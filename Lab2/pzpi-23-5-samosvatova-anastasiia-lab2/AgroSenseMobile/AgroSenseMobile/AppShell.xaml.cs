using AgroSenseMobile.Views;

namespace AgroSenseMobile
{
    public partial class AppShell : Shell
    {
        public AppShell()
        {
            InitializeComponent();
            Routing.RegisterRoute(nameof(RegisterPage), typeof(RegisterPage));
            Routing.RegisterRoute(nameof(AddEditGreenhousePage), typeof(AddEditGreenhousePage));
            Routing.RegisterRoute(nameof(GreenhouseDetailPage), typeof(GreenhouseDetailPage));
            Routing.RegisterRoute(nameof(AddEditActuatorPage), typeof(AddEditActuatorPage));
            Routing.RegisterRoute(nameof(GreenhouseDetailPage), typeof(GreenhouseDetailPage));
            Routing.RegisterRoute(nameof(AddEditSensorPage), typeof(AddEditSensorPage));
            Routing.RegisterRoute(nameof(AddEditActuatorPage), typeof(AddEditActuatorPage));

            Routing.RegisterRoute(nameof(SensorReadingsPage), typeof(SensorReadingsPage));
            Routing.RegisterRoute(nameof(ActuatorLogsPage), typeof(ActuatorLogsPage));
            Routing.RegisterRoute(nameof(NotificationsPage), typeof(NotificationsPage));

            Routing.RegisterRoute(nameof(SettingsPage), typeof(Views.SettingsPage));
        }
    }
}
