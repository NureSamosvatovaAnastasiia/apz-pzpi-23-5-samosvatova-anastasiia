using System;
using System.Collections.Generic;
using System.Text;
using System.Text.Json.Serialization;

namespace AgroSenseMobile.Models
{
    public class Notification
    {
        [JsonPropertyName("id")]
        public string Id { get; set; }

        [JsonPropertyName("greenhouseId")]
        public string GreenhouseId { get; set; }

        [JsonPropertyName("message")]
        public string Message { get; set; }

        [JsonPropertyName("severity")]
        public string Severity { get; set; } // 'INFO', 'WARNING', 'CRITICAL'

        [JsonPropertyName("isRead")]
        public bool IsRead { get; set; }

        [JsonPropertyName("createdAt")]
        public DateTime CreatedAt { get; set; }

        [JsonPropertyName("greenhouseName")]
        public string GreenhouseName { get; set; }
    }
}
