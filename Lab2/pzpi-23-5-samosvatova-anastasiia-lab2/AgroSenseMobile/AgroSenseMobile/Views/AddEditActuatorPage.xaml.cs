using AgroSenseMobile.ViewModels;
namespace AgroSenseMobile.Views;

public partial class AddEditActuatorPage : ContentPage
{
    public AddEditActuatorPage(AddEditActuatorViewModel viewModel)
    {
        InitializeComponent();
        BindingContext = viewModel;
    }
}
