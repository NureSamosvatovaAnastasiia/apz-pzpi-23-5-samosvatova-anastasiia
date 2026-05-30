using AgroSenseMobile.Models;
using System;
using System.Collections.Generic;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace AgroSenseMobile.Services
{
    public class IotService
    {
        private readonly ApiService _apiService;
        private readonly JsonSerializerOptions _jsonOptions;

        public IotService(ApiService apiService)
        {
            _apiService = apiService;
            _jsonOptions = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
                NumberHandling = JsonNumberHandling.AllowReadingFromString
            };
        }

        public async Task<List<Sensor>> GetSensorsAsync(string greenhouseId)
        {
            var json = await _apiService.GetAsync<JsonDocument>($"iot/greenhouses/{greenhouseId}/sensors");
            return ExtractList<Sensor>(json);
        }

        public async Task<List<Actuator>> GetActuatorsAsync(string greenhouseId)
        {
            var json = await _apiService.GetAsync<JsonDocument>($"iot/greenhouses/{greenhouseId}/actuators");
            return ExtractList<Actuator>(json);
        }

        // --- СЕНСОРИ ---

        public async Task CreateSensorAsync(string greenhouseId, object sensorData)
        {
            var response = await _apiService.PostRawAsync($"iot/greenhouses/{greenhouseId}/sensors", sensorData);
            response.EnsureSuccessStatusCode();
        }

        public async Task UpdateSensorAsync(string id, object sensorData)
        {
            var response = await _apiService.PutRawAsync($"iot/sensors/{id}", sensorData);
            response.EnsureSuccessStatusCode();
        }

        public async Task DeleteSensorAsync(string greenhouseId, string id)
        {
            await _apiService.DeleteAsync($"iot/greenhouses/{greenhouseId}/sensors/{id}");
        }

        // --- АКТУАТОРИ ---

        public async Task CreateActuatorAsync(string greenhouseId, object actuatorData)
        {
            var response = await _apiService.PostRawAsync($"iot/greenhouses/{greenhouseId}/actuators", actuatorData);
            response.EnsureSuccessStatusCode();
        }

        public async Task UpdateActuatorAsync(string id, object actuatorData)
        {
            var response = await _apiService.PutRawAsync($"iot/actuators/{id}", actuatorData);
            response.EnsureSuccessStatusCode();
        }

        public async Task DeleteActuatorAsync(string greenhouseId, string id)
        {
            await _apiService.DeleteAsync($"iot/greenhouses/{greenhouseId}/actuators/{id}");
        }

        public async Task ToggleActuatorStateAsync(string actuatorId, bool newState)
        {
  
            var request = new { state = newState, value = newState ? 100 : 0 };

            var response = await _apiService.PatchRawAsync($"iot/actuators/{actuatorId}", request);

            response.EnsureSuccessStatusCode();
        }


        public async Task<List<Reading>> GetSensorReadingsAsync(string greenhouseId, string sensorId, int limit = 50)
        {
            var json = await _apiService.GetAsync<JsonDocument>($"iot/greenhouses/{greenhouseId}/sensors/{sensorId}/history?limit={limit}");
            return ExtractList<Reading>(json);
        }

        public async Task AddSensorReadingAsync(string sensorId, double value)
        {
            var request = new { sensorId = sensorId, value = value };
            var response = await _apiService.PostRawAsync($"iot/manual", request);
            response.EnsureSuccessStatusCode();
        }

        public async Task<List<ActuatorLog>> GetActuatorLogsAsync(string greenhouseId, string actuatorId, int limit = 50)
        {
            var json = await _apiService.GetAsync<JsonDocument>($"iot/greenhouses/{greenhouseId}/actuators/{actuatorId}/history?limit={limit}");
            return ExtractList<ActuatorLog>(json);
        }

        private List<T> ExtractList<T>(JsonDocument doc)
        {
  
            if (doc.RootElement.ValueKind == JsonValueKind.Array)
                return JsonSerializer.Deserialize<List<T>>(doc.RootElement.GetRawText(), _jsonOptions) ?? new List<T>();

            if (doc.RootElement.ValueKind == JsonValueKind.Object)
            {
   
                string[] possibleKeys = { "data", "history", "logs", "items", "readings" };

                foreach (var key in possibleKeys)
                {
                    if (doc.RootElement.TryGetProperty(key, out var prop) && prop.ValueKind == JsonValueKind.Array)
                    {
                        return JsonSerializer.Deserialize<List<T>>(prop.GetRawText(), _jsonOptions) ?? new List<T>();
                    }
                }
            }

            return new List<T>(); 
        }
    }
}