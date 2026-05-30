using System;
using System.Collections.Generic;
using System.Text;
using System.Text.Json.Serialization;

namespace AgroSenseMobile.Models
{
    public class User
    {
        [JsonPropertyName("id")]
        public string Id { get; set; }

        [JsonPropertyName("username")]
        public string Username { get; set; }

        [JsonPropertyName("email")]
        public string Email { get; set; }
    }

    public class AuthResponse
    {
        [JsonPropertyName("token")]
        public string Token { get; set; }

        [JsonPropertyName("user")]
        public User User { get; set; }
    }
}
