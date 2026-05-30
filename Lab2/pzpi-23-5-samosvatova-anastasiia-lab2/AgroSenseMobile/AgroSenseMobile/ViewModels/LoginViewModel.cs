using AgroSenseMobile.Helpers;
using AgroSenseMobile.Resources.Localization;
using AgroSenseMobile.Services;
using AgroSenseMobile.Views;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System;
using System.Collections.Generic;
using System.Text;

namespace AgroSenseMobile.ViewModels
{
    public partial class LoginViewModel : ObservableObject
    {
        private readonly AuthService _authService;

        [ObservableProperty] private string email;
        [ObservableProperty] private string password;
        [ObservableProperty] private bool isBusy;

        public LoginViewModel(AuthService authService)
        {
            _authService = authService;
        }

        [RelayCommand]
        private async Task LoginAsync()
        {
            if (string.IsNullOrWhiteSpace(Email) || string.IsNullOrWhiteSpace(Password))
            {
             
                await Shell.Current.DisplayAlert("Помилка", AppResources.ErrorEmptyFields, "OK");
                return;
            }

            IsBusy = true;
            try
            {
                var response = await _authService.LoginAsync(Email, Password);

                if (response != null && !string.IsNullOrEmpty(response.Token))
                {
                
                    await Shell.Current.GoToAsync("//GreenhousesPage");
                }
                else
                {
                    await Shell.Current.DisplayAlert("Помилка", AppResources.ErrorLoginFailed, "OK");
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Login Error: {ex.Message}");
                await Shell.Current.DisplayAlert("Помилка", AppResources.ErrorLoginFailed, "OK");
            }
            finally
            {
                IsBusy = false;
            }
        }

        [RelayCommand]
        private async Task GoToRegisterAsync()
        {
            await Shell.Current.GoToAsync("RegisterPage");
        }

        [RelayCommand]
        private void ChangeLanguage(string langCode)
        {
            LanguageHelper.SetLanguage(langCode);
        }
    }
}
