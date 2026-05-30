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
    [QueryProperty(nameof(GreenhouseId), "GreenhouseId")]
    public partial class NotificationsViewModel : ObservableObject
    {
        private readonly NotificationService _notificationService;
        private IDispatcherTimer _pollingTimer;

        [ObservableProperty] private string greenhouseId;
        [ObservableProperty] private bool isBusy;
        [ObservableProperty] private bool isRefreshing;
        [ObservableProperty] private int unreadCount;
        [ObservableProperty] private string pageTitle;

        public ObservableCollection<Notification> Notifications { get; } = new();

        public NotificationsViewModel(NotificationService notificationService)
        {
            _notificationService = notificationService;
            PageTitle = AppResources.NotificationsTitle;
        }

        partial void OnGreenhouseIdChanged(string value)
        {
            if (!string.IsNullOrEmpty(value))
            {
                PageTitle = AppResources.NotificationsTitle + " 🌿";
                _ = LoadNotificationsAsync();
            }
        }

        // --- АВТОМАТИЧНЕ ОНОВЛЕННЯ (ФОНОВИЙ ТАЙМЕР) ---
        public void StartPolling()
        {
            if (_pollingTimer == null && Application.Current != null)
            {
                _pollingTimer = Application.Current.Dispatcher.CreateTimer();
                _pollingTimer.Interval = TimeSpan.FromSeconds(10); // Перевіряємо кожні 10 секунд
                _pollingTimer.Tick += async (s, e) => await LoadNotificationsSilentlyAsync();
            }
            _pollingTimer?.Start();
        }

        public void StopPolling()
        {
            _pollingTimer?.Stop();
        }

        private async Task LoadNotificationsSilentlyAsync()
        {
            try
            {
                List<Notification> data;
                if (string.IsNullOrEmpty(GreenhouseId))
                    data = await _notificationService.GetAllNotificationsAsync();
                else
                    data = await _notificationService.GetGreenhouseNotificationsAsync(GreenhouseId);

                var sortedData = data.OrderByDescending(x => x.CreatedAt).ToList();

                // Перевіряємо чи є нові сповіщення, яких ще немає на екрані
                bool hasNewItems = sortedData.Any(d => !Notifications.Any(n => n.Id == d.Id));

                // Перевіряємо чи змінився статус (можливо, прочитали з іншого пристрою)
                bool statusChanged = false;
                foreach (var serverItem in sortedData)
                {
                    var localItem = Notifications.FirstOrDefault(n => n.Id == serverItem.Id);
                    if (localItem != null && localItem.IsRead != serverItem.IsRead)
                    {
                        statusChanged = true;
                        break;
                    }
                }

                // Якщо є зміни - оновлюємо UI непомітно (без крутилки IsBusy)
                if (hasNewItems || statusChanged)
                {
                    MainThread.BeginInvokeOnMainThread(() =>
                    {
                        Notifications.Clear();
                        foreach (var item in sortedData)
                        {
                            Notifications.Add(item);
                        }
                        UpdateUnreadCount();
                    });
                }
            }
            catch
            {
                // Ігноруємо мережеві помилки у фоновому режимі (щоб не спамити алертами)
            }
        }
        // ------------------------------------------------

        [RelayCommand]
        public async Task LoadNotificationsAsync()
        {
            if (IsBusy) return;

            IsBusy = true;
            try
            {
                List<Notification> data;

                if (string.IsNullOrEmpty(GreenhouseId))
                {
                    PageTitle = AppResources.NotificationsTitle;
                    data = await _notificationService.GetAllNotificationsAsync();
                }
                else
                {
                    data = await _notificationService.GetGreenhouseNotificationsAsync(GreenhouseId);
                }

                Notifications.Clear();
                foreach (var item in data.OrderByDescending(x => x.CreatedAt))
                {
                    Notifications.Add(item);
                }

                UpdateUnreadCount();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"ПОМИЛКА СПОВІЩЕНЬ: {ex.Message}");
                await Shell.Current.DisplayAlert(AppResources.ErrorTitle, AppResources.ErrorLoadNotifications, AppResources.OkButton);
            }
            finally
            {
                IsBusy = false;
                IsRefreshing = false;
            }
        }

        [RelayCommand]
        private async Task MarkAllAsReadAsync()
        {
            var unreadNotifications = Notifications.Where(n => !n.IsRead).ToList();
            if (!unreadNotifications.Any()) return;

          
            foreach (var notification in unreadNotifications)
            {
                notification.IsRead = true;

           
                var index = Notifications.IndexOf(notification);
                if (index >= 0)
                {
                    Notifications.RemoveAt(index);
                    Notifications.Insert(index, notification);
                }
            }
            UpdateUnreadCount();

         
            try
            {
                var unreadIds = unreadNotifications.Select(n => n.Id);
                await _notificationService.MarkAllAsReadAsync(unreadIds);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Помилка MarkAllAsRead: {ex.Message}");
            }
        }

        [RelayCommand]
        private async Task MarkAsReadAsync(Notification notification)
        {
            if (notification == null || notification.IsRead) return;

            notification.IsRead = true;
            var index = Notifications.IndexOf(notification);
            if (index >= 0)
            {
                Notifications.RemoveAt(index);
                Notifications.Insert(index, notification);
            }
            UpdateUnreadCount();

          
            try
            {
                await _notificationService.MarkAsReadAsync(notification.Id);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Помилка MarkAsRead: {ex.Message}");
            }
        }

        private void UpdateUnreadCount()
        {
            UnreadCount = Notifications.Count(n => !n.IsRead);
        }
    }
}
