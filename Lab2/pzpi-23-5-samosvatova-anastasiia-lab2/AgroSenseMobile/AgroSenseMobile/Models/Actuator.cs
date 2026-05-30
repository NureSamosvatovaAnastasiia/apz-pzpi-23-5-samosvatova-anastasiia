using System;
using System.Collections.Generic;
using System.Text;
using System.Text.Json.Serialization;

namespace AgroSenseMobile.Models
{
    public class Actuator
    {
        [JsonPropertyName("id")]
        public string Id { get; set; }

        [JsonPropertyName("greenhouseId")]
        public string GreenhouseId { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("type")]
        public string Type { get; set; } // 'fan', 'pump', 'heater', 'grow_light', 'vent', 'humidifier'

        [JsonPropertyName("capacity")]
        public double? Capacity { get; set; }

        [JsonPropertyName("currentState")]
        public bool CurrentState { get; set; }

        [JsonPropertyName("currentValue")]
        public double? CurrentValue { get; set; }
    }
}
