using AgroSenseMobile.Models;
using System;
using System.Collections.Generic;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace AgroSenseMobile.Services
{
    public class GreenhouseService
    {
        private readonly ApiService _apiService;
        private readonly JsonSerializerOptions _jsonOptions;

        public GreenhouseService(ApiService apiService)
        {
            _apiService = apiService;
            _jsonOptions = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
                NumberHandling = JsonNumberHandling.AllowReadingFromString
            };
        }

        public async Task<List<Greenhouse>> GetMyGreenhousesAsync()
        {
            var greenhouses = await _apiService.GetAsync<List<Greenhouse>>("greenhouses");
            return greenhouses ?? new List<Greenhouse>();
        }

        public async Task<List<Crop>> GetCropsAsync()
        {
            var crops = await _apiService.GetAsync<List<Crop>>("greenhouses/crops");
            return crops ?? new List<Crop>();
        }

        public async Task SetActiveCropAsync(string greenhouseId, string cropId)
        {
            var requestData = new { cropId = cropId };
            var response = await _apiService.PutRawAsync($"greenhouses/{greenhouseId}/crop", requestData);
            response.EnsureSuccessStatusCode();
        }

        public async Task<Greenhouse> CreateGreenhouseAsync(object requestData)
        {
            var response = await _apiService.PostRawAsync("greenhouses", requestData);
            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync();

            try
            {
                var list = JsonSerializer.Deserialize<List<Greenhouse>>(json, _jsonOptions);
                if (list != null && list.Count > 0) return list[0];
            }
            catch { }

            try
            {
                return JsonSerializer.Deserialize<Greenhouse>(json, _jsonOptions);
            }
            catch { }

            return null;
        }

        public async Task UpdateGreenhouseAsync(string id, object requestData)
        {
            var response = await _apiService.PutRawAsync($"greenhouses/{id}", requestData);
            response.EnsureSuccessStatusCode();
        }

        public async Task DeleteGreenhouseAsync(string id)
        {
            await _apiService.DeleteAsync($"greenhouses/{id}");
        }
    }
}
