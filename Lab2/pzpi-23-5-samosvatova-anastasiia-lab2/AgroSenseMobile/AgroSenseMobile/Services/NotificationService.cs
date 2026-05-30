using AgroSenseMobile.Models;
using System;
using System.Collections.Generic;
using System.Text;
using System.Text.Json;

namespace AgroSenseMobile.Services
{
    public class NotificationService
    {
        private readonly ApiService _apiService;

        public NotificationService(ApiService apiService)
        {
            _apiService = apiService;
        }

        public async Task<List<Notification>> GetAllNotificationsAsync(int limit = 50)
        {
            var json = await _apiService.GetAsync<JsonDocument>($"notifications?limit={limit}");
            return ExtractNotifications(json);
        }

        public async Task<List<Notification>> GetGreenhouseNotificationsAsync(string greenhouseId)
        {
            var json = await _apiService.GetAsync<JsonDocument>($"notifications/{greenhouseId}");
            return ExtractNotifications(json);
        }

        public async Task MarkAsReadAsync(string notificationId)
        {
            var response = await _apiService.PatchRawAsync($"notifications/{notificationId}/read", new { });
            response.EnsureSuccessStatusCode();
        }
        public async Task MarkAllAsReadAsync(IEnumerable<string> unreadNotificationIds)
        {
            foreach (var id in unreadNotificationIds)
            {
                try
                {

                    await MarkAsReadAsync(id);
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine($"Помилка оновлення статусу для сповіщення {id}: {ex.Message}");
         
                }
            }
        }
   
        private List<Notification> ExtractNotifications(JsonDocument json)
        {
            try
            {
                return JsonSerializer.Deserialize<List<Notification>>(json.RootElement.GetRawText(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new List<Notification>();
            }
            catch (JsonException)
            {
                if (json.RootElement.TryGetProperty("data", out var dataProp))
                {
                    return JsonSerializer.Deserialize<List<Notification>>(dataProp.GetRawText(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new List<Notification>();
                }
                throw;
            }
        }
    }
}
