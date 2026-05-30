using AgroSenseMobile.Models;
using AgroSenseMobile.Services;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System.Collections.ObjectModel;

namespace AgroSenseMobile.ViewModels
{
    [QueryProperty(nameof(GreenhouseToEdit), "Greenhouse")]
    public partial class AddEditGreenhouseViewModel : ObservableObject
    {
        private readonly GreenhouseService _greenhouseService;

        [ObservableProperty] private string title = "Нова теплиця";
        [ObservableProperty] private string name;
        [ObservableProperty] private string location;
        [ObservableProperty] private string area;
        [ObservableProperty] private string height;
        [ObservableProperty] private bool isBusy;

     
        public ObservableCollection<Crop> Crops { get; } = new();

        [ObservableProperty]
        private Crop selectedCrop;

        private Greenhouse _greenhouseToEdit;
        public Greenhouse GreenhouseToEdit
        {
            get => _greenhouseToEdit;
            set
            {
                SetProperty(ref _greenhouseToEdit, value);
                if (value != null)
                {
                    Title = "Редагування теплиці";
                    Name = value.Name;
                    Location = value.Location;
                    Area = value.AreaSqMeters?.ToString();
                    Height = value.HeightMeters?.ToString();

                    SetSelectedCrop(); 
                }
            }
        }

        public AddEditGreenhouseViewModel(GreenhouseService greenhouseService)
        {
            _greenhouseService = greenhouseService;
            _ = LoadCropsAsync(); 
        }

        private async Task LoadCropsAsync()
        {
            try
            {
                var list = await _greenhouseService.GetCropsAsync();
                Crops.Clear();
                foreach (var c in list) Crops.Add(c);

                SetSelectedCrop();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Не вдалося завантажити культури: {ex.Message}");
            }
        }

        private void SetSelectedCrop()
        {
            if (GreenhouseToEdit?.ActiveCrop != null && Crops.Any())
                SelectedCrop = Crops.FirstOrDefault(c => c.Id == GreenhouseToEdit.ActiveCrop.Id);
            else if (GreenhouseToEdit?.ActiveCropId != null && Crops.Any())
                SelectedCrop = Crops.FirstOrDefault(c => c.Id == GreenhouseToEdit.ActiveCropId);
        }

        [RelayCommand]
        private async Task SaveAsync()
        {
            if (string.IsNullOrWhiteSpace(Name))
            {
                await Shell.Current.DisplayAlert("Помилка", "Назва теплиці є обов'язковою", "ОК");
                return;
            }

            IsBusy = true;
            try
            {
                string formattedArea = null;
                if (!string.IsNullOrWhiteSpace(Area) && double.TryParse(Area.Replace(',', '.'), System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out double a))
                    formattedArea = a.ToString("0.0#", System.Globalization.CultureInfo.InvariantCulture);

                string formattedHeight = null;
                if (!string.IsNullOrWhiteSpace(Height) && double.TryParse(Height.Replace(',', '.'), System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out double h))
                    formattedHeight = h.ToString("0.0#", System.Globalization.CultureInfo.InvariantCulture);

                var requestData = new
                {
                    name = Name,
                    location = Location,
                    areaSqMeters = formattedArea,
                    heightMeters = formattedHeight
                };

                string finalGreenhouseId = GreenhouseToEdit?.Id;

           
                if (GreenhouseToEdit == null)
                {
                    var createdGh = await _greenhouseService.CreateGreenhouseAsync(requestData);
                    finalGreenhouseId = createdGh?.Id;
                }
                else
                {
                    await _greenhouseService.UpdateGreenhouseAsync(finalGreenhouseId, requestData);
                }

              
                if (!string.IsNullOrEmpty(finalGreenhouseId) && SelectedCrop != null)
                {
                    await _greenhouseService.SetActiveCropAsync(finalGreenhouseId, SelectedCrop.Id);
                }

                await Shell.Current.GoToAsync("..");
            }
            catch (Exception ex)
            {
                await Shell.Current.DisplayAlert("Помилка", $"Не вдалося зберегти: {ex.Message}", "ОК");
            }
            finally
            {
                IsBusy = false;
            }
        }
    }
}

