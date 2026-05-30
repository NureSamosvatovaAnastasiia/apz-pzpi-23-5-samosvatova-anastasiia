using AgroSenseMobile.ViewModels;

namespace AgroSenseMobile.Views;

public partial class NotificationsPage : ContentPage
{
    public NotificationsPage(NotificationsViewModel viewModel)
    {
        InitializeComponent();
        BindingContext = viewModel;
    }

    protected override void OnAppearing()
    {
        base.OnAppearing();
    
        var vm = (NotificationsViewModel)BindingContext;
        vm.LoadNotificationsCommand.Execute(null);
    }
}