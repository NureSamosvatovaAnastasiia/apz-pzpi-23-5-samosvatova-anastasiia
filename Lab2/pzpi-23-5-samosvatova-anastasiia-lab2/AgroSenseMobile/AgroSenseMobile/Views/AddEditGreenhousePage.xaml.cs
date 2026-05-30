using AgroSenseMobile.ViewModels;

namespace AgroSenseMobile.Views;

public partial class AddEditGreenhousePage : ContentPage
{
    public AddEditGreenhousePage(AddEditGreenhouseViewModel viewModel)
    {
        InitializeComponent();
        BindingContext = viewModel;
    }
}