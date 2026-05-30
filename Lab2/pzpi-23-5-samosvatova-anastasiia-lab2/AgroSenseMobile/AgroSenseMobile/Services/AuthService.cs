using AgroSenseMobile.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace AgroSenseMobile.Services
{
    public class AuthService
    {
        private readonly ApiService _apiService;

        public AuthService(ApiService apiService)
        {
            _apiService = apiService;
        }

        public async Task<AuthResponse> LoginAsync(string email, string password)
        {
            var request = new { email, password };
            var response = await _apiService.PostAsync<AuthResponse>("auth/login", request);

            if (response != null && !string.IsNullOrEmpty(response.Token))
            {
                await SecureStorage.Default.SetAsync("jwt_token", response.Token);
            }

            return response;
        }

        public async Task<int> RegisterAsync(string username, string email, string password)
        {
            var request = new { username, email, password };
            var response = await _apiService.PostRawAsync("auth/register", request);

            return (int)response.StatusCode;
        }

        public async Task<bool> VerifyEmailAsync(string email, string code)
        {
            var request = new { email, code };
            var response = await _apiService.PostRawAsync("auth/verify", request);

            return response.IsSuccessStatusCode;
        }

        public void Logout()
        {
            SecureStorage.Default.Remove("jwt_token");
        }
    }
}
