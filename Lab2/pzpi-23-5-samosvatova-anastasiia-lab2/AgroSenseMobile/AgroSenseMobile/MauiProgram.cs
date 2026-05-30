using AgroSenseMobile.Services;
using AgroSenseMobile.ViewModels;
using AgroSenseMobile.Views;
using CommunityToolkit.Maui;
using Microsoft.Extensions.Logging;

namespace AgroSenseMobile
{
    public static class MauiProgram
    {
        public static MauiApp CreateMauiApp()
        {
            var builder = MauiApp.CreateBuilder();
            builder
                .UseMauiApp<App>().UseMauiCommunityToolkit()
                .ConfigureFonts(fonts =>
                {
                    fonts.AddFont("OpenSans-Regular.ttf", "OpenSansRegular");
                    fonts.AddFont("OpenSans-Semibold.ttf", "OpenSansSemibold");
                });

#if DEBUG
    		builder.Logging.AddDebug();
#endif

            builder.Services.AddSingleton<ApiService>();
            builder.Services.AddSingleton<AuthService>();
            builder.Services.AddSingleton<GreenhouseService>(); 
            builder.Services.AddSingleton<NotificationService>();
            builder.Services.AddSingleton<IotService>();

            builder.Services.AddTransient<LoginViewModel>();
            builder.Services.AddTransient<RegisterViewModel>();
            builder.Services.AddTransient<GreenhousesViewModel>(); 

            builder.Services.AddTransient<ActuatorLogsViewModel>(); 
            builder.Services.AddTransient<SensorReadingsViewModel>();

            builder.Services.AddTransient<AddEditGreenhouseViewModel>();
         
            builder.Services.AddTransient<LoginPage>();
            builder.Services.AddTransient<RegisterPage>();
            builder.Services.AddTransient<GreenhousesPage>();
            
            builder.Services.AddTransient<AddEditGreenhousePage>();

            builder.Services.AddTransient<GreenhouseDetailViewModel>();
            builder.Services.AddTransient<GreenhouseDetailPage>();

            builder.Services.AddTransient<AddEditActuatorViewModel>();
            builder.Services.AddTransient<AddEditActuatorPage>();

            builder.Services.AddTransient<AddEditSensorViewModel>();
            builder.Services.AddTransient<AddEditSensorPage>();

            builder.Services.AddTransient<SensorReadingsPage>();
            builder.Services.AddTransient<ActuatorLogsPage>();
            
            builder.Services.AddTransient<NotificationsViewModel>();
            builder.Services.AddTransient<NotificationsPage>();

            builder.Services.AddTransient<SettingsPage>();
            builder.Services.AddTransient<SettingsViewModel>();
            return builder.Build();
        }
    }
}


