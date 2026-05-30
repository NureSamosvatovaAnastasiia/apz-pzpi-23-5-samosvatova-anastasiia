using System;
using System.Collections.Generic;
using System.Text;
using System.Text.Json.Serialization;

namespace AgroSenseMobile.Models
{
    public class Greenhouse
    {
        [JsonPropertyName("id")]
        public string Id { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("location")]
        public string Location { get; set; }

        [JsonPropertyName("areaSqMeters")]
        public double? AreaSqMeters { get; set; }

        [JsonPropertyName("heightMeters")]
        public double? HeightMeters { get; set; }

        [JsonPropertyName("activeCropId")]
        public string ActiveCropId { get; set; }

        [JsonPropertyName("activeCrop")]
        public Crop ActiveCrop { get; set; }

        [JsonIgnore]
        public string CropDisplayName
        {
            get
            {
                if (ActiveCrop != null && !string.IsNullOrWhiteSpace(ActiveCrop.Name))
                    return $"{ActiveCrop.Name}";

                return "Не призначено";
            }
        }
    }

}
