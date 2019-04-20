import {httpGet, httpPut, httpPost, httpPath, httpDelete, urlConcat} from '../http'

export async function crateIndex() {
  return httpPut('nested_query', {
    "settings": {
    },
    "mappings": {
      "properties": {
        "user": {
          "type": "nested"
        }
      }
    }
  })
}

export async function deleteIndex() {
  return httpDelete('nested_query');
}

export async function setTestData() {
  return Promise.all([
    httpPut('nested_query/_doc/1', {
      "group" : "fans",
      "user" : [
        {
          "first" : "John",
          "last" :  "smith"
        },
        {
          "first" : "Alice",
          "last" :  "white"
        }
      ]
    }),
    httpPut('nested_query/_doc/2', {
      "group" : "followers",
      "user" : [
        {
          "first" : "Kant",
          "last" :  "philosopher"
        },
        {
          "first" : "Kenny",
          "last" :  "dead"
        }
      ]
    })
  ])
}

export async function search(text) {
  if (!text) {
    return httpGet("nested_query/_search?pretty=true&q=*:*");
  } else {
    return httpPost("nested_query/_search", {
      "query": {
        "nested": {
          "path": "user",
          "query": {
            "bool": {
              "must": [
                { "match": { "user.first": text }}
              ]
            }
          }
        }
      }
    });
  }
}

export async function clearBlockReadOnly() {
  await httpPut("nested_query/_settings", {
    "index.blocks.read_only_allow_delete": null
  });
}
