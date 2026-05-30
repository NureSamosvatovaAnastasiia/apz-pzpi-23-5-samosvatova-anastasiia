using AgroSenseMobile.ViewModels;

namespace AgroSenseMobile.Views;

public partial class ActuatorLogsPage : ContentPage
{
    public ActuatorLogsPage(ActuatorLogsViewModel viewModel)
    {
        InitializeComponent();
        BindingContext = viewModel;
    }
}