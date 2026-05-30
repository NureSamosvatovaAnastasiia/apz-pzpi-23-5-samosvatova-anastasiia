using AgroSenseMobile.ViewModels;

namespace AgroSenseMobile.Views;

public partial class SensorReadingsPage : ContentPage
{
    public SensorReadingsPage(SensorReadingsViewModel viewModel)
    {
        InitializeComponent();
        BindingContext = viewModel;
    }
}