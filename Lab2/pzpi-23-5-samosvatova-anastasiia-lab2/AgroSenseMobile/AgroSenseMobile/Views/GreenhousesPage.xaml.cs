using AgroSenseMobile.ViewModels;


namespace AgroSenseMobile.Views;

public partial class GreenhousesPage : ContentPage
{
    private readonly GreenhousesViewModel _viewModel;

    public GreenhousesPage(GreenhousesViewModel viewModel)
    {
        InitializeComponent();
        BindingContext = viewModel;
        _viewModel = viewModel;
    }

    protected override void OnAppearing()
    {
        base.OnAppearing();
        _viewModel.LoadGreenhousesCommand.Execute(null);
    }
}