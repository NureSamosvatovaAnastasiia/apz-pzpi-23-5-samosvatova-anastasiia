using AgroSenseMobile.Models;
using AgroSenseMobile.Resources.Localization;
using AgroSenseMobile.Services;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System.Collections.ObjectModel;

namespace AgroSenseMobile.ViewModels
{
    [QueryProperty(nameof(CurrentGreenhouse), "Greenhouse")]
    public partial class GreenhouseDetailViewModel : ObservableObject
    {
        private readonly IotService _iotService;

        [ObservableProperty] private Greenhouse currentGreenhouse;
        [ObservableProperty] private bool isBusy;

        public ObservableCollection<Sensor> Sensors { get; } = new();
        public ObservableCollection<Actuator> Actuators { get; } = new();

        public GreenhouseDetailViewModel(IotService iotService)
        {
            _iotService = iotService;
        }

        partial void OnCurrentGreenhouseChanged(Greenhouse value)
        {
            if (value != null) _ = LoadDevicesAsync();
        }

        [RelayCommand]
        public async Task LoadDevicesAsync()
        {
            if (CurrentGreenhouse == null) return;

            IsBusy = true;
            try
            {
                var sensorsTask = _iotService.GetSensorsAsync(CurrentGreenhouse.Id);
                var actuatorsTask = _iotService.GetActuatorsAsync(CurrentGreenhouse.Id);

                await Task.WhenAll(sensorsTask, actuatorsTask);

                Sensors.Clear();
                foreach (var s in sensorsTask.Result) Sensors.Add(s);

                Actuators.Clear();
                foreach (var a in actuatorsTask.Result) Actuators.Add(a);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"ПОМИЛКА ЗАВАНТАЖЕННЯ ПРИСТРОЇВ: {ex}");
                await Shell.Current.DisplayAlert(AppResources.ErrorTitle, AppResources.ErrorLoadDevices, AppResources.OkButton);
            }
            finally
            {
                IsBusy = false;
            }
        }

        [RelayCommand]
        private async Task GoToNotificationsAsync()
        {
            if (CurrentGreenhouse == null) return;

            await Shell.Current.GoToAsync("NotificationsPage", new Dictionary<string, object>
            {
                { "GreenhouseId", CurrentGreenhouse.Id }
            });
        }

        [RelayCommand]
        private async Task AddSensorAsync() =>
            await Shell.Current.GoToAsync("AddEditSensorPage", new Dictionary<string, object> { { "GreenhouseId", CurrentGreenhouse.Id } });

        [RelayCommand]
        private async Task EditSensorAsync(Sensor sensor) =>
            await Shell.Current.GoToAsync("AddEditSensorPage", new Dictionary<string, object> { { "GreenhouseId", CurrentGreenhouse.Id }, { "Sensor", sensor } });

        [RelayCommand]
        private async Task ViewSensorReadingsAsync(Sensor sensor)
        {
            if (CurrentGreenhouse == null || sensor == null) return;
            await Shell.Current.GoToAsync("SensorReadingsPage", new Dictionary<string, object>
            {
                { "GreenhouseId", CurrentGreenhouse.Id },
                { "Sensor", sensor }
            });
        }

        [RelayCommand]
        private async Task DeleteSensorAsync(Sensor sensor)
        {
            string message = string.Format(AppResources.DeleteSensorConfirmMessage, sensor.Name);
            if (await Shell.Current.DisplayAlert(AppResources.DeleteTitle, message, AppResources.YesButton, AppResources.NoButton))
            {
                try
                {
                    await _iotService.DeleteSensorAsync(CurrentGreenhouse.Id, sensor.Id);
                    Sensors.Remove(sensor);
                }
                catch (Exception ex)
                {
                    string errorMsg = string.Format(AppResources.ErrorDeleteFailedMessage, ex.Message);
                    await Shell.Current.DisplayAlert(AppResources.ErrorTitle, errorMsg, AppResources.OkButton);
                }
            }
        }


        [RelayCommand]
        private async Task AddActuatorAsync() =>
            await Shell.Current.GoToAsync("AddEditActuatorPage", new Dictionary<string, object> { { "GreenhouseId", CurrentGreenhouse.Id } });

        [RelayCommand]
        private async Task EditActuatorAsync(Actuator actuator) =>
            await Shell.Current.GoToAsync("AddEditActuatorPage", new Dictionary<string, object> { { "GreenhouseId", CurrentGreenhouse.Id }, { "Actuator", actuator } });

        [RelayCommand]
        private async Task ViewActuatorLogsAsync(Actuator actuator)
        {
            if (CurrentGreenhouse == null || actuator == null) return;
            await Shell.Current.GoToAsync("ActuatorLogsPage", new Dictionary<string, object>
            {
                { "GreenhouseId", CurrentGreenhouse.Id },
                { "Actuator", actuator }
            });
        }

        [RelayCommand]
        private async Task ToggleActuatorAsync(Actuator actuator)
        {
            if (actuator == null) return;

            bool targetState = actuator.CurrentState;

            try
            {
                await _iotService.ToggleActuatorStateAsync(actuator.Id, targetState);
                System.Diagnostics.Debug.WriteLine($"УСПІХ: Актуатор {actuator.Name} змінено на {targetState}");
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"ПОМИЛКА ПЕРЕМИКАННЯ АКТУАТОРА: {ex.Message}");

                actuator.CurrentState = !targetState;

                var index = Actuators.IndexOf(actuator);
                if (index >= 0)
                {
                    Actuators.RemoveAt(index);
                    Actuators.Insert(index, actuator);
                }

                await Shell.Current.DisplayAlert(AppResources.SyncErrorTitle, AppResources.ErrorSyncActuator, AppResources.OkButton);
            }
        }

        [RelayCommand]
        private async Task DeleteActuatorAsync(Actuator actuator)
        {
            string message = string.Format(AppResources.DeleteActuatorConfirmMessage, actuator.Name);
            if (await Shell.Current.DisplayAlert(AppResources.DeleteTitle, message, AppResources.YesButton, AppResources.NoButton))
            {
                try
                {
                    await _iotService.DeleteActuatorAsync(CurrentGreenhouse.Id, actuator.Id);
                    Actuators.Remove(actuator);
                }
                catch (Exception ex)
                {
                    string errorMsg = string.Format(AppResources.ErrorDeleteFailedMessage, ex.Message);
                    await Shell.Current.DisplayAlert(AppResources.ErrorTitle, errorMsg, AppResources.OkButton);
                }
            }
        }
    }
}