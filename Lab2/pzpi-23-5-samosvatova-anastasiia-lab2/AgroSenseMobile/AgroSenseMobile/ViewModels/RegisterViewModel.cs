using AgroSenseMobile.Services;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System;
using System.Collections.Generic;
using System.Text;

    namespace AgroSenseMobile.ViewModels
    {
        public partial class RegisterViewModel : ObservableObject
        {
            private readonly AuthService _authService;

            [ObservableProperty] private string username;
            [ObservableProperty] private string email;
            [ObservableProperty] private string password;

            [ObservableProperty] private string confirmPassword;

      
            [ObservableProperty] private string verificationCode;

            [ObservableProperty] private bool isBusy;

            [ObservableProperty] private bool isVerificationStep;

            public RegisterViewModel(AuthService authService)
            {
                _authService = authService;
            }

            [RelayCommand]
            private async Task RegisterAsync()
            {
                if (string.IsNullOrWhiteSpace(Username) || string.IsNullOrWhiteSpace(Email) || string.IsNullOrWhiteSpace(Password))
                {
                    await Shell.Current.DisplayAlert("Увага", "Будь ласка, заповніть всі поля.", "OK");
                    return;
                }

                if (Password != ConfirmPassword)
                {
                    await Shell.Current.DisplayAlert("Увага", "Паролі не співпадають. Перевірте правильність введення.", "OK");
                    return;
                }

                IsBusy = true;
                try
                {
                    
                    int statusCode = await _authService.RegisterAsync(Username, Email, Password);

                    if (statusCode == 201 || statusCode == 200)
                    {
                      
                        IsVerificationStep = true;
                    }
                    else if (statusCode == 409)
                    {
                        await Shell.Current.DisplayAlert("Помилка", "Користувач з таким email вже зареєстрований.", "OK");
                    }
                    else
                    {
                        await Shell.Current.DisplayAlert("Помилка", $"Не вдалося зареєструватись (Код помилки: {statusCode}).", "OK");
                    }
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine($"Register Error: {ex.Message}");
                    await Shell.Current.DisplayAlert("Помилка", "Помилка зв'язку з сервером. Спробуйте пізніше.", "OK");
                }
                finally
                {
                    IsBusy = false;
                }
            }

            [RelayCommand]
            private async Task VerifyAsync()
            {
                if (string.IsNullOrWhiteSpace(VerificationCode))
                {
                    await Shell.Current.DisplayAlert("Увага", "Будь ласка, введіть код підтвердження.", "OK");
                    return;
                }

                IsBusy = true;
                try
                {
                    bool isSuccess = await _authService.VerifyEmailAsync(Email, VerificationCode);

                    if (isSuccess)
                    {
                        await Shell.Current.DisplayAlert("Успіх", "Акаунт успішно підтверджено! Тепер ви можете увійти.", "OK");

                        await Shell.Current.GoToAsync("..");
                    }
                    else
                    {
                        await Shell.Current.DisplayAlert("Помилка", "Невірний код підтвердження. Спробуйте ще раз.", "OK");
                    }
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine($"Verify Error: {ex.Message}");
                    await Shell.Current.DisplayAlert("Помилка", "Помилка сервера під час перевірки.", "OK");
                }
                finally
                {
                    IsBusy = false;
                }
            }
        }
    }

