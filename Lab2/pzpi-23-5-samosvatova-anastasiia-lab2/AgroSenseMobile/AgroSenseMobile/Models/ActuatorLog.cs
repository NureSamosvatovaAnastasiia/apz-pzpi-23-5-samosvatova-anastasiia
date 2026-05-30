using System;
using System.Collections.Generic;
using System.Text;
using System.Text.Json.Serialization;

namespace AgroSenseMobile.Models
{
    public class ActuatorLog
    {
        [JsonPropertyName("id")]
        public string Id { get; set; }

        [JsonPropertyName("actuatorId")]
        public string ActuatorId { get; set; }

        [JsonPropertyName("state")]
        public bool State { get; set; }

        [JsonPropertyName("value")]
        public double? Value { get; set; }

        [JsonPropertyName("reason")]
        public string Reason { get; set; }

        [JsonPropertyName("timestamp")]
        public DateTime Timestamp { get; set; }
    }
}
