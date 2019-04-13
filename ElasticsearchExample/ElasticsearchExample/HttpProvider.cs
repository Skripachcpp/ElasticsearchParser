using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace ElasticsearchExample
{
    public interface IHttpAuthorization
    {
        Task<string> GetTokenAsync();
    }

    public class HttpProvider
    {
        private object _lock = new object();

        private string _baseUri;
        private readonly IHttpAuthorization _autoAuthorization;
        private readonly bool _autoSlash;
        private readonly Lazy<HttpClient> _lazyHttpClient = new Lazy<HttpClient>(() => new HttpClient());
        private HttpClient HttpClient => _lazyHttpClient.Value;

        public HttpProvider(string url) : this(url, null) { }

        public HttpProvider(string url, IHttpAuthorization autoAuthorization, bool autoAddSlash = true)
        {
            _baseUri = url ?? throw new ArgumentNullException(nameof(url));
            _autoAuthorization = autoAuthorization;
            _autoSlash = autoAddSlash;
        }

        public virtual string GetFullUrlForRequest(string relativeUri) => GetFullUrlAndJsonBodyForRequest(relativeUri, null).FullUrl;
        public (string FullUrl, string JsonBody) GetFullUrlAndJsonBodyForRequest(string relativeUri, object body)
        {
            if (!string.IsNullOrEmpty(relativeUri) && _autoSlash && !string.IsNullOrEmpty(relativeUri) && !string.IsNullOrEmpty(_baseUri))
            {
                if (relativeUri[0] != '/' && _baseUri[_baseUri.Length - 1] != '/')
                    relativeUri = "/" + relativeUri;
                else if (relativeUri[0] == '/' && _baseUri[_baseUri.Length - 1] == '/')
                    relativeUri = relativeUri.Substring(1);
            }

            var fullUrl = _baseUri + relativeUri;
            var jsonBody = JsonConvert.SerializeObject(body, formatting: Formatting.None);

            return (fullUrl, jsonBody);
        }

        protected virtual void ThrowIfRequestNoOk(HttpResponseMessage response, string fullUrl, string jsonBody = null)
        {
            if (response.StatusCode != HttpStatusCode.OK && response.StatusCode != HttpStatusCode.Created && response.StatusCode != HttpStatusCode.NoContent)
            {
                var statusCode = response.StatusCode;
                var method = response.RequestMessage?.Method?.Method;
                var content = response.Content?.ReadAsStringAsync().GetAwaiter().GetResult();

                throw new Exception($"{statusCode} ({(int)statusCode})\nMethod: {method}\nUrl: {fullUrl}{(jsonBody == null ? null : $"\nBody: { jsonBody }")}\nResponse: {content}");
            }
        }

        public virtual async Task PutJsonAsync(string relativeUri, object body)
        {
            var (fullUrl, jsonBody) = GetFullUrlAndJsonBodyForRequest(relativeUri, body);
            var response = await HttpClient.PutAsync(fullUrl, new StringContent(jsonBody, Encoding.UTF8, "application/json"));
            ThrowIfRequestNoOk(response, fullUrl, jsonBody);
        }

        public virtual async Task<string> PostJsonAsync(string relativeUri, object body)
        {
            var (fullUrl, jsonBody) = GetFullUrlAndJsonBodyForRequest(relativeUri, body);
            var response = await AuthorizedRequestAsync(async () => await HttpClient.PostAsync(fullUrl, new StringContent(jsonBody, Encoding.UTF8, "application/json")));
            ThrowIfRequestNoOk(response, fullUrl, jsonBody);

            return await response.Content.ReadAsStringAsync();
        }

        public virtual async Task<string> PatchJsonAsync(string relativeUri, object body)
        {
            var (fullUrl, jsonBody) = GetFullUrlAndJsonBodyForRequest(relativeUri, body);

            var response = await AuthorizedRequestAsync(async () => await HttpClient.SendAsync(new HttpRequestMessage(new HttpMethod("PATCH"), fullUrl) { Content = new StringContent(jsonBody, Encoding.UTF8, "application/json") }));
            ThrowIfRequestNoOk(response, fullUrl, jsonBody);

            return await response.Content.ReadAsStringAsync();
        }

        private void Authorization(bool soft = false)
        {
            var now = DateTime.Now;
            if (_autoAuthorization != null && (_authorizationDate == null || (!soft && (now - _authorizationDate.Value).Minutes > 1)))
            {
                lock (_lock)
                {
                    now = DateTime.Now;
                    if (_authorizationDate == null || (now - _authorizationDate.Value).Minutes > 1)
                    {
                        var token = _autoAuthorization.GetTokenAsync().GetAwaiter().GetResult();

                        HttpClient.DefaultRequestHeaders.Remove("Authorization");
                        HttpClient.DefaultRequestHeaders.Add("Authorization", "Bearer " + token);

                        _authorizationDate = now;
                    }
                }
            }
        }

        private DateTime? _authorizationDate;
        protected virtual async Task<HttpResponseMessage> AuthorizedRequestAsync(Func<Task<HttpResponseMessage>> request)
        {
            Authorization(true);

            var response = await request();

            //если произошла любая ошибка - авторизоваться и повторить запрос с новым токином
            if (_autoAuthorization != null && !response.IsSuccessStatusCode)
            {
                Authorization();

                response = await request();
            }

            return response;
        }

        public virtual async Task<string> GetAsync(string relativeUri = null)
        {
            var fullUrl = GetFullUrlForRequest(relativeUri);
            var response = await AuthorizedRequestAsync(async () => await HttpClient.GetAsync(fullUrl));
            ThrowIfRequestNoOk(response, fullUrl);
            var stringContent = await response.Content.ReadAsStringAsync();
            return stringContent;
        }

        public async Task DeleteAsync(string relativeUri)
        {
            var fullUrl = GetFullUrlForRequest(relativeUri);
            var response = await AuthorizedRequestAsync(async () => await HttpClient.DeleteAsync(fullUrl));
            ThrowIfRequestNoOk(response, fullUrl);
        }
    }
}
