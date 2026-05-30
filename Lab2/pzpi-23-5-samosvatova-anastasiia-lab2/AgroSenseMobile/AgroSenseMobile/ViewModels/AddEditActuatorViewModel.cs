using AgroSenseMobile.Models;
using AgroSenseMobile.Resources.Localization;
using AgroSenseMobile.Services;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System;
using System.Collections.Generic;
using System.Text;
using System.Xml.Linq;

namespace AgroSenseMobile.ViewModels
{
    [QueryProperty(nameof(GreenhouseId), "GreenhouseId")]
    [QueryProperty(nameof(ActuatorToEdit), "Actuator")]
    public partial class AddEditActuatorViewModel : ObservableObject
    {
        private readonly IotService _iotService;

        [ObservableProperty] private string pageTitle;
        [ObservableProperty] private string greenhouseId;
        [ObservableProperty] private string name;
        [ObservableProperty] private string capacity;
        [ObservableProperty] private string selectedType;
        [ObservableProperty] private bool isBusy;

        public List<string> ActuatorTypes { get; } = new()
        {
            "fan", "pump", "heater", "grow_light", "vent", "humidifier"
        };

        private Actuator _actuatorToEdit;
        public Actuator ActuatorToEdit
        {
            get => _actuatorToEdit;
            set
            {
                SetProperty(ref _actuatorToEdit, value);
                if (value != null)
                {
                   
                    PageTitle = AppResources.EditActuatorTitle;
                    Name = value.Name;
                    Capacity = value.Capacity?.ToString();
                    SelectedType = value.Type;
                }
            }
        }

        public AddEditActuatorViewModel(IotService iotService)
        {
            _iotService = iotService;
            PageTitle = AppResources.NewActuatorTitle; 
        }

        [RelayCommand]
        private async Task SaveAsync()
        {
            if (string.IsNullOrWhiteSpace(Name) || string.IsNullOrWhiteSpace(SelectedType))
            {
                await Shell.Current.DisplayAlert(AppResources.ErrorTitle, AppResources.ErrorFillNameAndType, "OK");
                return;
            }

            IsBusy = true;
            try
            {
             
                string formattedCapacity = null;
                if (!string.IsNullOrWhiteSpace(Capacity))
                {
                    if (double.TryParse(Capacity.Replace(',', '.'), System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out double c))
                        formattedCapacity = c.ToString("0.0#", System.Globalization.CultureInfo.InvariantCulture);
                }

                var requestData = new
                {
                    greenhouseId = GreenhouseId,
                    name = Name,
                    type = SelectedType,
                    capacity = formattedCapacity
                };

                if (ActuatorToEdit == null)
                    await _iotService.CreateActuatorAsync(GreenhouseId, requestData);
                else
                    await _iotService.UpdateActuatorAsync(ActuatorToEdit.Id, requestData);

                await Shell.Current.GoToAsync("..");
            }
            catch (Exception ex)
            {
                string errorMsg = string.Format(AppResources.ErrorSaveFailed, ex.Message);
                await Shell.Current.DisplayAlert(AppResources.ErrorTitle, errorMsg, "OK");
            }
            finally
            {
                IsBusy = false;
            }
        }
    }
}
