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
    [QueryProperty(nameof(CurrentSensor), "Sensor")]
    public partial class SensorReadingsViewModel : ObservableObject
    {
        private readonly IotService _iotService;

        [ObservableProperty] private string pageTitle;
        [ObservableProperty] private string greenhouseId;
        [ObservableProperty] private Sensor currentSensor;
        [ObservableProperty] private bool isBusy;
        [ObservableProperty] private string newValue;

        public ObservableCollection<Reading> Readings { get; } = new();

        public SensorReadingsViewModel(IotService iotService)
        {
            _iotService = iotService;
        }

        partial void OnCurrentSensorChanged(Sensor value)
        {
            if (value != null)
            {
                PageTitle = string.Format(AppResources.SensorReadingsTitle, value.Name);
                _ = LoadReadingsAsync();
            }
        }

        [RelayCommand]
        public async Task LoadReadingsAsync()
        {
            if (CurrentSensor == null || string.IsNullOrEmpty(GreenhouseId)) return;

            IsBusy = true;
            try
            {
                var data = await _iotService.GetSensorReadingsAsync(GreenhouseId, CurrentSensor.Id, 50);
                Readings.Clear();
                foreach (var r in data.OrderByDescending(x => x.Timestamp))
                    Readings.Add(r);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"CRASH: {ex}");
                await Microsoft.Maui.Controls.Shell.Current.DisplayAlert(AppResources.ErrorTitle, AppResources.ErrorLoadReadings, AppResources.OkButton);
            }
            finally
            {
                IsBusy = false;
            }
        }

        [RelayCommand]
        private async Task AddReadingAsync()
        {
            if (string.IsNullOrWhiteSpace(NewValue) || !double.TryParse(NewValue.Replace(',', '.'), System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out double val))
            {
                await Microsoft.Maui.Controls.Shell.Current.DisplayAlert(AppResources.ErrorTitle, AppResources.ErrorInvalidNumber, AppResources.OkButton);
                return;
            }

            IsBusy = true;
            try
            {
                await _iotService.AddSensorReadingAsync(CurrentSensor.Id, val);
                NewValue = string.Empty;
                await LoadReadingsAsync();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"CRASH: {ex}");
                await Microsoft.Maui.Controls.Shell.Current.DisplayAlert(AppResources.ErrorTitle, AppResources.ErrorSaveReading, AppResources.OkButton);
            }
            finally
            {
                IsBusy = false;
            }
        }
    }
}