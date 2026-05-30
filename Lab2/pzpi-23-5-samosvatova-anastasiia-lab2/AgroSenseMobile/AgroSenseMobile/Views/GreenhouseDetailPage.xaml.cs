using AgroSenseMobile.ViewModels;

namespace AgroSenseMobile.Views;

public partial class GreenhouseDetailPage : ContentPage
{
    public GreenhouseDetailPage(GreenhouseDetailViewModel viewModel)
    {
        InitializeComponent();
        BindingContext = viewModel;
    }
}