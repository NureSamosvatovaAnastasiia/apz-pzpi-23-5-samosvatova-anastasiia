using System;
using System.Collections.Generic;
using System.Text;
using System.Text.Json.Serialization;

namespace AgroSenseMobile.Models
{
    public class Crop
    {
        [JsonPropertyName("id")]
        public string Id { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("idealTempMin")]
        public double? IdealTempMin { get; set; }

        [JsonPropertyName("idealTempMax")]
        public double? IdealTempMax { get; set; }

        [JsonPropertyName("idealSoilMoistureMin")]
        public double? IdealSoilMoistureMin { get; set; }

        [JsonPropertyName("idealSoilMoistureMax")]
        public double? IdealSoilMoistureMax { get; set; }

        [JsonPropertyName("idealAirHumidityMin")]
        public double? IdealAirHumidityMin { get; set; }

        [JsonPropertyName("idealAirHumidityMax")]
        public double? IdealAirHumidityMax { get; set; }

        [JsonPropertyName("idealLightLuxMin")]
        public double? IdealLightLuxMin { get; set; }

        [JsonPropertyName("idealLightLuxMax")]
        public double? IdealLightLuxMax { get; set; }
    }
}
