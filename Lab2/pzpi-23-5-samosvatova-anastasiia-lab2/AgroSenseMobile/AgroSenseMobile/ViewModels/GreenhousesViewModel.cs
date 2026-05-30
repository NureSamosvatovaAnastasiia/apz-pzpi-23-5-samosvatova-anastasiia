using AgroSenseMobile.Models;
using AgroSenseMobile.Resources.Localization;
using AgroSenseMobile.Services;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Text;

namespace AgroSenseMobile.ViewModels
{
    public partial class GreenhousesViewModel : ObservableObject
    {
        private readonly GreenhouseService _greenhouseService;
        private readonly NotificationService _notificationService; 

        public ObservableCollection<Greenhouse> Greenhouses { get; } = new();

        [ObservableProperty]
        private bool isBusy;

        [ObservableProperty]
        private bool isRefreshing;

       
        [ObservableProperty]
        [NotifyPropertyChangedFor(nameof(HasUnreadNotifications))]
        private int unreadNotificationsCount;

        public bool HasUnreadNotifications => UnreadNotificationsCount > 0;

        public GreenhousesViewModel(GreenhouseService greenhouseService, NotificationService notificationService)
        {
            _greenhouseService = greenhouseService;
            _notificationService = notificationService;
        }

        [RelayCommand]
        private async Task LoadGreenhousesAsync()
        {
            if (IsBusy) return;

            IsBusy = true;
            try
            {
              
                Greenhouses.Clear();
                var greenhouses = await _greenhouseService.GetMyGreenhousesAsync();
                foreach (var gh in greenhouses)
                {
                    Greenhouses.Add(gh);
                }

              
                var notifications = await _notificationService.GetAllNotificationsAsync();
                UnreadNotificationsCount = notifications.Count(n => !n.IsRead);
            }
            catch (Exception)
            {
                
                await Shell.Current.DisplayAlert(
                    AppResources.ErrorTitle,
                    AppResources.ErrorLoadGreenhouses,
                    AppResources.OkButton);
            }
            finally
            {
                IsBusy = false;
                IsRefreshing = false; 
            }
        }

        [RelayCommand]
        private async Task AddGreenhouseAsync()
        {
            await Shell.Current.GoToAsync("AddEditGreenhousePage");
        }

        [RelayCommand]
        private async Task EditGreenhouseAsync(Greenhouse greenhouse)
        {
            if (greenhouse == null) return;
            await Shell.Current.GoToAsync("AddEditGreenhousePage", new Dictionary<string, object>
            {
                { "Greenhouse", greenhouse }
            });
        }

        [RelayCommand]
        private async Task DeleteGreenhouseAsync(Greenhouse greenhouse)
        {
            if (greenhouse == null) return;

          
            string message = string.Format(AppResources.DeleteGreenhouseConfirmMessage, greenhouse.Name);
            bool confirm = await Shell.Current.DisplayAlert(
                AppResources.DeleteTitle,
                message,
                AppResources.YesButton,
                AppResources.NoButton);

            if (!confirm) return;

            IsBusy = true;
            try
            {
                await _greenhouseService.DeleteGreenhouseAsync(greenhouse.Id);
                Greenhouses.Remove(greenhouse);
            }
            catch (Exception)
            {
               
                await Shell.Current.DisplayAlert(
                    AppResources.ErrorTitle,
                    AppResources.ErrorDeleteGreenhouse,
                    AppResources.OkButton);
            }
            finally
            {
                IsBusy = false;
            }
        }

        [RelayCommand]
        private async Task GoToDetailsAsync(Greenhouse greenhouse)
        {
            if (greenhouse == null) return;
            await Shell.Current.GoToAsync("GreenhouseDetailPage", new Dictionary<string, object>
            {
                { "Greenhouse", greenhouse }
            });
        }

        [RelayCommand]
        private async Task LogoutAsync()
        {
            SecureStorage.Default.Remove("jwt_token");
            await Shell.Current.GoToAsync("//LoginPage");
        }

        [RelayCommand]
        private async Task GoToNotificationsAsync()
        {
            await Shell.Current.GoToAsync("NotificationsPage");
        }

        [RelayCommand]
        private async Task GoToSettingsAsync()
        {
            await Shell.Current.GoToAsync("SettingsPage");
        }
    }
}
