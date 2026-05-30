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
    [QueryProperty(nameof(CurrentActuator), "Actuator")]
    public partial class ActuatorLogsViewModel : ObservableObject
    {
        private readonly IotService _iotService;

        [ObservableProperty] private string pageTitle;
        [ObservableProperty] private string greenhouseId;
        [ObservableProperty] private Actuator currentActuator;
        [ObservableProperty] private bool isBusy;

        public ObservableCollection<ActuatorLog> Logs { get; } = new();

        public ActuatorLogsViewModel(IotService iotService)
        {
            _iotService = iotService;
        }

        partial void OnCurrentActuatorChanged(Actuator value)
        {
            if (value != null)
            {

                PageTitle = string.Format(AppResources.ActuatorLogsTitle, value.Name);
                _ = LoadLogsAsync();
            }
        }

        [RelayCommand]
        public async Task LoadLogsAsync()
        {
            if (CurrentActuator == null || string.IsNullOrEmpty(GreenhouseId)) return;

            IsBusy = true;
            try
            {
                var data = await _iotService.GetActuatorLogsAsync(GreenhouseId, CurrentActuator.Id, 50);

                Logs.Clear();
        
                foreach (var log in data.OrderByDescending(x => x.Timestamp))
                {
                    Logs.Add(log);
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"ПОМИЛКА ЛОГІВ: {ex.Message}");
                await Microsoft.Maui.Controls.Shell.Current.DisplayAlert(AppResources.ErrorTitle, AppResources.ErrorLoadLogs, AppResources.OkButton);
            }
            finally
            {
                IsBusy = false;
            }
        }
    }
}
