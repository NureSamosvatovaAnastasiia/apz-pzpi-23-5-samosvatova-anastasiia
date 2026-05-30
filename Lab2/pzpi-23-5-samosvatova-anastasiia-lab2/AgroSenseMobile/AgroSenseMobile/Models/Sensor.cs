using System;
using System.Collections.Generic;
using System.Text;
using System.Text.Json.Serialization;

namespace AgroSenseMobile.Models
{
    public class Sensor
    {
        [JsonPropertyName("id")]
        public string Id { get; set; }

        [JsonPropertyName("greenhouseId")]
        public string GreenhouseId { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("type")]
        public string Type { get; set; } // 'temperature', 'humidity', 'soil_moisture', 'light'

        // НОВЕ ПОЛЕ ЗГІДНО БД
        [JsonPropertyName("unit")]
        public string Unit { get; set; }

        [JsonPropertyName("isActive")]
        public bool IsActive { get; set; }
    }

}
