import {httpGet, httpPut, httpPost, httpPath, httpDelete, urlConcat} from '../http'

export async function crateIndex() {
  return Promise.all([
    httpPut('multiindex_query_main', {
      "settings": {
      },
      "mappings": {
      }
    }),
    httpPut('multiindex_query_nested', {
      "settings": {
      },
      "mappings": {
      }
    })
  ])
}

export async function deleteIndex() {
  return Promise.all([
    httpDelete('multiindex_query_main'),
    httpDelete('multiindex_query_nested')
  ])
}

export async function setTestData() {
  return Promise.all([
    httpPut('multiindex_query_main/_doc/1', {
      "group" : "fans"
    }),
    httpPut('multiindex_query_main/_doc/2', {
      "group" : "followers"
    }),

    httpPut('multiindex_query_nested/_doc/1', {
      "multiindex_query_main": "1",
      "first" : "John",
      "last" :  "smith"
    }),
    httpPut('multiindex_query_nested/_doc/2', {
      "multiindex_query_main": "1",
      "first" : "Alice",
      "last" :  "white"
    }),
    httpPut('multiindex_query_nested/_doc/3', {
      "multiindex_query_main": "2",
      "first" : "Kant",
      "last" :  "philosopher"
    }),
    httpPut('multiindex_query_nested/_doc/4', {
      "multiindex_query_main": "2",
      "first" : "Kenny",
      "last" :  "dead"
    }),
  ])
}

export async function search(text) {
  if (!text) {

    let r = {
      multiindex_query_main: null,
      multiindex_query_nested: null
    };
    await Promise.all([
      httpGet("multiindex_query_main/_search?pretty=true&q=*:*").then(a => r.multiindex_query_main = a),
      httpGet("multiindex_query_nested/_search?pretty=true&q=*:*").then(a => r.multiindex_query_nested = a),
    ]);

    return r;
  } else {
    return 'не реализовано';

    /*return httpPost("multiindex_query_main/_search", {
      "query": {

      }
    });*/
  }
}

export async function clearBlockReadOnly() {
  await httpPut("multiindex_query_main/_settings", {
    "index.blocks.read_only_allow_delete": null
  });
}
