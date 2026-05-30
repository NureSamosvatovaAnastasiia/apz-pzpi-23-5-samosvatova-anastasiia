using AgroSenseMobile.Helpers;
using Microsoft.Extensions.DependencyInjection;

namespace AgroSenseMobile
{
    public partial class App : Application
    {
        public App()
        {
            InitializeComponent();

            LanguageHelper.LoadSavedLanguage();
            MainPage = new AppShell();
        }

        protected override async void OnStart()
        {
            base.OnStart();
            await CheckAuthStatusAsync();
        }

        private async Task CheckAuthStatusAsync()
        {
        
            var token = await SecureStorage.Default.GetAsync("jwt_token");

            if (!string.IsNullOrEmpty(token))
            {
          
                await Shell.Current.GoToAsync("//GreenhousesPage");
            }
            else
            {
            
                await Shell.Current.GoToAsync("//LoginPage");
            }
        }
    }
}