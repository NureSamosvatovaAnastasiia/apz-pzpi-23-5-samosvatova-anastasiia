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
    [QueryProperty(nameof(SensorToEdit), "Sensor")]
    public partial class AddEditSensorViewModel : ObservableObject
    {
        private readonly IotService _iotService;

        [ObservableProperty] private string pageTitle;
        [ObservableProperty] private string greenhouseId;
        [ObservableProperty] private string name;
        [ObservableProperty] private string unit;
        [ObservableProperty] private string selectedType;
        [ObservableProperty] private bool isBusy;

     
        public List<string> SensorTypes { get; } = new()
        {
            "temperature", "humidity", "soil_moisture", "light", "co2", "ph"
        };

        private Sensor _sensorToEdit;
        public Sensor SensorToEdit
        {
            get => _sensorToEdit;
            set
            {
                SetProperty(ref _sensorToEdit, value);
                if (value != null)
                {
                   
                    PageTitle = AppResources.EditSensorTitle;
                    Name = value.Name;
                    Unit = value.Unit;
                    SelectedType = value.Type;
                }
            }
        }

        public AddEditSensorViewModel(IotService iotService)
        {
            _iotService = iotService;
           
            PageTitle = AppResources.NewSensorTitle;
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
                var requestData = new
                {
                    greenhouseId = GreenhouseId,
                    name = Name,
                    type = SelectedType,
                    unit = string.IsNullOrWhiteSpace(Unit) ? null : Unit
                };

                if (SensorToEdit == null)
                    await _iotService.CreateSensorAsync(GreenhouseId, requestData);
                else
                    await _iotService.UpdateSensorAsync(SensorToEdit.Id, requestData);

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
