import axios from 'axios';
import qs from 'qs';

const HOST = 'http://localhost:9200';

const paramsSerializer = p => qs.stringify(p, { allowDots: true });

export async function httpGet (url, params, {host, noCache = false, autoSlash = true} = {}) {
  let fullUrl = urlConcat(host || HOST, url, {autoSlash});
  let options = { params: params, paramsSerializer };
  if (noCache) options.headers = {'Pragma': 'no-cache'};
  return (await axios.get(fullUrl, options)).data;
}

export async function httpPut (url, body) {
  let fullUrl = urlConcat(HOST, url);
  return (await axios.put(fullUrl, body)).data;
}

export async function httpPost (url, body, headers) {
  let fullUrl = urlConcat(HOST, url);
  const response = await axios.post(fullUrl, body, {headers});

  return response && response.data;
}

export async function httpPath (url, body, headers) {
  let fullUrl = urlConcat(HOST, url);
  return (await axios.patch(fullUrl, body, {headers})).data;
}

export async function httpDelete (url, params, headers) {
  let fullUrl = urlConcat(HOST, url);
  return (await axios.delete(fullUrl, {params: params, paramsSerializer, headers})).data;
}

export function urlConcat(url, relativeUri, {autoSlash = true} = {}) {
  if (autoSlash && relativeUri && url)
  {
    if (relativeUri[0] !== '/' && url[url.length - 1] !== '/')
      relativeUri = "/" + relativeUri;
    else if (relativeUri[0] === '/' && url[url.length - 1] === '/')
      relativeUri = relativeUri.substring(1);
  }

  if (!relativeUri) {
    return url;
  } else {
    let fullUrl = url + relativeUri;
    return fullUrl;
  }
}
