import {httpGet, httpPut, httpPost, httpPath, httpDelete, urlConcat} from '../http'

export async function crateIndex() {
  return httpPut('storage', {
    "settings": {
      "analysis": {
        "analyzer": {
          "my_analyzer": {
            "tokenizer": "standard",
            "char_filter": ["my_char_filter"],
            "filter": ["lowercase"]
          }
        },
        "char_filter": {
          "my_char_filter": {
            "type": "html_strip"
          }
        }
      }
    },
    "mappings" : {
      "properties" : {
        "content" : {
          "type" : "text",
          "analyzer":"my_analyzer"
        },
        "text": {
          "type" : "text"
        },
        "title": {
          "type" : "text"
        },
        "url": {
          "type" : "text"
        }
      }
    }
  })
}

export async function deleteIndex() {
  return httpDelete('storage');
}

async function setDoc(link) {
  let content = await httpGet(link, null, {host: "https://localhost:44396/api/html?link=", autoSlash: false})
  let key = encodeURIComponent(link);

  let title = null;
  if (content) {
    let headTags = content.match(/<head[^>]*>[\s\S]*<\/head>/gi);
    let headTag = headTags && headTags.length > 0 && headTags[0] || null;
    if (headTag) {
      let titleTags = headTag.match(/<title[^>]*>[\s\S]*<\/title>/gi);
      let titleTag = titleTags && titleTags.length > 0 && titleTags[0] || null;
      if (titleTag) {
        title = titleTag.replace('<title>', '').replace('</title>', '');
      }
    }
  }

  let response = await httpPost(`storage/_analyze`, {
    "tokenizer":      "keyword",
    "char_filter":  [ "html_strip" ],
    "text": content
  });

  let text = null;
  if (response) {
    let tokens = response.tokens;
    if (tokens && tokens.length > 0) {
      let token = tokens[0];
      if (token) {
        text = token.token;
      }
    }
  }

  if (text) {
    text = text.replace(/\n/g, " ");
    text = text.replace(/\s+/g, " ");
  }

  await httpPut(`storage/_doc/${key}`, {
    content: content,
    text: text,
    url: link,
    title: title
  });
}

export async function setTestData() {
  await Promise.all([
    setDoc("https://ru.wikipedia.org/wiki/%D0%9B%D0%BE%D1%81%D0%BE%D1%81%D1%91%D0%B2%D1%8B%D0%B5"),
    setDoc("http://ru.texthandler.com/info/remove-double-spaces-javascript/"),
    setDoc("https://discuss.elastic.co/t/forbidden-12-index-read-only-allow-delete-api/110282"),
    setDoc("https://stackoverflow.com/questions/5076466/javascript-replace-n-with-br"),
    setDoc("https://www.elastic.co/guide/en/elasticsearch/reference/current/analysis-htmlstrip-charfilter.html"),
    setDoc("https://ru.wikipedia.org/wiki/%D0%9A%D0%BE%D1%88%D0%BA%D0%B8%D0%BD_%D0%B4%D0%BE%D0%BC_(%D0%BC%D1%83%D0%BB%D1%8C%D1%82%D1%84%D0%B8%D0%BB%D1%8C%D0%BC,_1958)"),
    setDoc("https://ru.wikipedia.org/wiki/HTTP"),
    setDoc("https://ru.wikipedia.org/wiki/%D0%97%D0%B0%D0%B3%D0%BB%D0%B0%D0%B2%D0%BD%D0%B0%D1%8F_%D1%81%D1%82%D1%80%D0%B0%D0%BD%D0%B8%D1%86%D0%B0"),
    setDoc("https://ru.wikipedia.org/wiki/Python"),
    setDoc("https://ru.wikipedia.org/wiki/Java"),
    setDoc("https://ru.wikipedia.org/wiki/JavaScript"),
    setDoc("https://ru.wikipedia.org/wiki/PHP"),
    setDoc("https://ru.wikipedia.org/wiki/%D0%9F%D0%B0%D1%81%D0%BA%D0%B0%D0%BB%D1%8C_(%D1%8F%D0%B7%D1%8B%D0%BA_%D0%BF%D1%80%D0%BE%D0%B3%D1%80%D0%B0%D0%BC%D0%BC%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F)"),
    setDoc("https://ru.wikipedia.org/wiki/%D0%A1%D0%B8_(%D1%8F%D0%B7%D1%8B%D0%BA_%D0%BF%D1%80%D0%BE%D0%B3%D1%80%D0%B0%D0%BC%D0%BC%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F)"),
    setDoc("https://ru.wikipedia.org/wiki/C_Sharp"),
    setDoc("https://ru.wikipedia.org/wiki/SQL"),
    setDoc("https://ru.wikipedia.org/wiki/Go"),
    setDoc("https://ru.wikipedia.org/wiki/Delphi_(%D1%8F%D0%B7%D1%8B%D0%BA_%D0%BF%D1%80%D0%BE%D0%B3%D1%80%D0%B0%D0%BC%D0%BC%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F)"),
    setDoc("https://ru.wikipedia.org/wiki/Kotlin"),
    setDoc("https://ru.wikipedia.org/wiki/R_(%D1%8F%D0%B7%D1%8B%D0%BA_%D0%BF%D1%80%D0%BE%D0%B3%D1%80%D0%B0%D0%BC%D0%BC%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F)"),
    setDoc("https://ru.wikipedia.org/wiki/%D0%AF%D0%B7%D1%8B%D0%BA_%D0%B0%D1%81%D1%81%D0%B5%D0%BC%D0%B1%D0%BB%D0%B5%D1%80%D0%B0"),
    setDoc("https://ru.wikipedia.org/wiki/Ruby"),
    setDoc("https://ru.wikipedia.org/wiki/AJAX"),
    setDoc("https://ru.wikipedia.org/wiki/Swift_(%D1%8F%D0%B7%D1%8B%D0%BA_%D0%BF%D1%80%D0%BE%D0%B3%D1%80%D0%B0%D0%BC%D0%BC%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F)"),
    setDoc("https://ru.wikipedia.org/wiki/%D0%91%D0%B5%D0%B9%D1%81%D0%B8%D0%BA"),
    setDoc("https://ru.wikipedia.org/wiki/%D0%A1%D0%BA%D1%80%D0%B5%D1%82%D1%87_(%D1%8F%D0%B7%D1%8B%D0%BA_%D0%BF%D1%80%D0%BE%D0%B3%D1%80%D0%B0%D0%BC%D0%BC%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F)"),
    setDoc("https://ru.wikipedia.org/wiki/Scala_(%D1%8F%D0%B7%D1%8B%D0%BA_%D0%BF%D1%80%D0%BE%D0%B3%D1%80%D0%B0%D0%BC%D0%BC%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F)"),
    setDoc("https://ru.wikipedia.org/wiki/Visual_Basic"),
    setDoc("https://ru.wikipedia.org/wiki/Lua"),
    setDoc("https://ru.wikipedia.org/wiki/%D0%A4%D0%BE%D1%80%D1%82%D1%80%D0%B0%D0%BD"),
    setDoc("https://ru.wikipedia.org/wiki/Haskell"),
    setDoc("https://ru.wikipedia.org/wiki/Perl"),
    setDoc("https://ru.wikipedia.org/wiki/Rust_(%D1%8F%D0%B7%D1%8B%D0%BA_%D0%BF%D1%80%D0%BE%D0%B3%D1%80%D0%B0%D0%BC%D0%BC%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F)"),
    setDoc("https://ru.wikipedia.org/wiki/%D0%9B%D0%B8%D1%81%D0%BF"),
    setDoc("https://ru.wikipedia.org/wiki/ECMAScript"),
    setDoc("https://ru.wikipedia.org/wiki/Brainfuck"),
    setDoc("https://ru.wikipedia.org/wiki/Erlang"),
    setDoc("https://ru.wikipedia.org/wiki/%D0%90%D0%B4%D0%B0_(%D1%8F%D0%B7%D1%8B%D0%BA_%D0%BF%D1%80%D0%BE%D0%B3%D1%80%D0%B0%D0%BC%D0%BC%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F)"),
    setDoc("https://ru.wikipedia.org/wiki/%D0%9B%D0%BE%D0%B3%D0%BE_(%D1%8F%D0%B7%D1%8B%D0%BA_%D0%BF%D1%80%D0%BE%D0%B3%D1%80%D0%B0%D0%BC%D0%BC%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F)"),
    setDoc("https://ru.wikipedia.org/wiki/TypeScript"),
    setDoc("https://ru.wikipedia.org/wiki/Objective-C"),
    setDoc("https://ru.wikipedia.org/wiki/%D0%9F%D1%80%D0%BE%D0%BB%D0%BE%D0%B3_(%D1%8F%D0%B7%D1%8B%D0%BA_%D0%BF%D1%80%D0%BE%D0%B3%D1%80%D0%B0%D0%BC%D0%BC%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F)"),
    setDoc("https://ru.wikipedia.org/wiki/%D0%94%D0%A0%D0%90%D0%9A%D0%9E%D0%9D"),
    setDoc("https://ru.wikipedia.org/wiki/D_(%D1%8F%D0%B7%D1%8B%D0%BA_%D0%BF%D1%80%D0%BE%D0%B3%D1%80%D0%B0%D0%BC%D0%BC%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F)"),
    setDoc("https://ru.wikipedia.org/wiki/J_(%D1%8F%D0%B7%D1%8B%D0%BA_%D0%BF%D1%80%D0%BE%D0%B3%D1%80%D0%B0%D0%BC%D0%BC%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F)"),
    setDoc("https://ru.wikipedia.org/wiki/%D0%92%D1%81%D1%82%D1%80%D0%BE%D0%B5%D0%BD%D0%BD%D1%8B%D0%B9_%D1%8F%D0%B7%D1%8B%D0%BA_%D0%BF%D1%80%D0%BE%D0%B3%D1%80%D0%B0%D0%BC%D0%BC%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F_1%D0%A1:%D0%9F%D1%80%D0%B5%D0%B4%D0%BF%D1%80%D0%B8%D1%8F%D1%82%D0%B8%D0%B5"),
    setDoc("https://ru.wikipedia.org/wiki/Groovy"),
    setDoc("https://ru.wikipedia.org/wiki/PascalABC.NET"),
    setDoc("https://ru.wikipedia.org/wiki/F_Sharp"),
    setDoc("https://ru.wikipedia.org/wiki/C--"),
    setDoc("https://ru.wikipedia.org/wiki/%D0%9A%D0%BE%D0%B1%D0%BE%D0%BB"),
    setDoc("https://ru.wikipedia.org/wiki/Smalltalk"),
    setDoc("https://ru.wikipedia.org/wiki/PL/SQL"),
    setDoc("https://ru.wikipedia.org/wiki/LESS_(%D1%8F%D0%B7%D1%8B%D0%BA_%D1%81%D1%82%D0%B8%D0%BB%D0%B5%D0%B9)"),
    setDoc("https://ru.wikipedia.org/wiki/%D0%90%D0%BB%D0%B3%D0%BE%D0%BB"),
    setDoc("https://ru.wikipedia.org/wiki/Malbolge"),
    setDoc("https://ru.wikipedia.org/wiki/AutoIt"),
    setDoc("https://ru.wikipedia.org/wiki/Tcl"),
    setDoc("https://ru.wikipedia.org/wiki/%D0%92%D0%B8%D0%BA%D0%B8%D0%BF%D0%B5%D0%B4%D0%B8%D1%8F:%D0%9F%D0%BE%D0%BF%D1%83%D0%BB%D1%8F%D1%80%D0%BD%D1%8B%D0%B5_%D1%81%D1%82%D0%B0%D1%82%D1%8C%D0%B8/2017/%D0%AF%D0%B7%D1%8B%D0%BA%D0%B8_%D0%BF%D1%80%D0%BE%D0%B3%D1%80%D0%B0%D0%BC%D0%BC%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F"),
  ])

}

export async function setData(link) {
  await setDoc(link);
}

export async function search(text) {
  if (!text) {
    return httpGet("storage/_search?pretty=true&q=*:*");
  } else {
    return httpPost("storage/_search", {
      "query": {
        "bool" : {
          "must" : {
            "query_string" : {
              "query" : `${text}~`,
            }
          }
        }
      },
      "highlight" : {
        "encoder": "html",
        "pre_tags": "<em>",
        "post_tags": "</em>",
        "fields": {
          "text": {
            "fragment_size" : 150,
            "number_of_fragments" : 3,
          }
        }
      }

    });
  }
}

export async function clearBlockReadOnly() {
  await httpPut("storage/_settings", {
    "index.blocks.read_only_allow_delete": null
  });
}
