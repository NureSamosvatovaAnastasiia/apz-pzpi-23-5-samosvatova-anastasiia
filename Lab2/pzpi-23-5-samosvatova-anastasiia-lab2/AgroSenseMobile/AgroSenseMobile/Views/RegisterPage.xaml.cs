using AgroSenseMobile.ViewModels;

namespace AgroSenseMobile.Views;

public partial class RegisterPage : ContentPage
{
    public RegisterPage(RegisterViewModel viewModel)
    {
        InitializeComponent();
        BindingContext = viewModel;
    }
}