using AgroSenseMobile.ViewModels;
namespace AgroSenseMobile.Views;

public partial class AddEditSensorPage : ContentPage
{
    public AddEditSensorPage(AddEditSensorViewModel viewModel)
    {
        InitializeComponent();
        BindingContext = viewModel;
    }
}
