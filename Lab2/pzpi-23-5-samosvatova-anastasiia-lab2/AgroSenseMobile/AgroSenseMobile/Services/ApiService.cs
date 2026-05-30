using System;
using System.Collections.Generic;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace AgroSenseMobile.Services
{
    public class ApiService
    {
        private readonly HttpClient _httpClient;
        private readonly JsonSerializerOptions _serializerOptions;

        public ApiService()
        {
            _httpClient = new HttpClient
            {
                BaseAddress = new Uri(Constants.BaseApiUrl + "/")
            };

            _serializerOptions = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,

                NumberHandling = JsonNumberHandling.AllowReadingFromString
            };
        }

        private async Task AddAuthorizationHeaderAsync()
        {
            var token = await SecureStorage.Default.GetAsync("jwt_token");
            if (!string.IsNullOrEmpty(token))
            {
                _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            }
            else
            {
                _httpClient.DefaultRequestHeaders.Authorization = null;
            }
        }

        public async Task<T> GetAsync<T>(string endpoint)
        {
            await AddAuthorizationHeaderAsync();
            var response = await _httpClient.GetAsync(endpoint);
            response.EnsureSuccessStatusCode();
            var content = await response.Content.ReadAsStringAsync();
            System.Diagnostics.Debug.WriteLine($"\n[API GET {endpoint}] RAW JSON: {content}\n");
            return JsonSerializer.Deserialize<T>(content, _serializerOptions);
        }

        public async Task<T> PostAsync<T>(string endpoint, object data)
        {
            await AddAuthorizationHeaderAsync();
            var response = await _httpClient.PostAsJsonAsync(endpoint, data);
            response.EnsureSuccessStatusCode();
            var content = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<T>(content, _serializerOptions);
        }

        public async Task<HttpResponseMessage> PostRawAsync(string endpoint, object data)
        {
            await AddAuthorizationHeaderAsync();
            return await _httpClient.PostAsJsonAsync(endpoint, data);
        }

        public async Task<T> PutAsync<T>(string endpoint, object data)
        {
            await AddAuthorizationHeaderAsync();
            var response = await _httpClient.PutAsJsonAsync(endpoint, data);
            response.EnsureSuccessStatusCode();
            var content = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<T>(content, _serializerOptions);
        }

        public async Task<HttpResponseMessage> PutRawAsync(string endpoint, object data)
        {
            await AddAuthorizationHeaderAsync();
            return await _httpClient.PutAsJsonAsync(endpoint, data);
        }

        public async Task DeleteAsync(string endpoint)
        {
            await AddAuthorizationHeaderAsync();
            var response = await _httpClient.DeleteAsync(endpoint);
            response.EnsureSuccessStatusCode();
        }

        public async Task<HttpResponseMessage> PatchRawAsync(string endpoint, object data)
        {
            await AddAuthorizationHeaderAsync();

            var jsonContent = JsonContent.Create(data);

            return await _httpClient.PatchAsync(endpoint, jsonContent);
        }
    }
}