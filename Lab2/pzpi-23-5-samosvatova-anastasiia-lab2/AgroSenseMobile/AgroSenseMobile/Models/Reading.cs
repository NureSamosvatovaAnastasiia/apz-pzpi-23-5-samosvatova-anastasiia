using System;
using System.Collections.Generic;
using System.Text;
using System.Text.Json.Serialization;

namespace AgroSenseMobile.Models
{
    public class Reading
    {
        [JsonPropertyName("id")]
        public string Id { get; set; }

        [JsonPropertyName("sensorId")]
        public string SensorId { get; set; }

        [JsonPropertyName("value")]
        public double Value { get; set; }

        [JsonPropertyName("timestamp")]
        public DateTime Timestamp { get; set; }
    }

}
