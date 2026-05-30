using AgroSenseMobile.Resources.Localization;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text;

namespace AgroSenseMobile.Helpers
{
    public static class LanguageHelper
    {
        public static void SetLanguage(string languageCode)
        {
            var culture = new CultureInfo(languageCode);
            Thread.CurrentThread.CurrentCulture = culture;
            Thread.CurrentThread.CurrentUICulture = culture;
            CultureInfo.DefaultThreadCurrentCulture = culture;
            CultureInfo.DefaultThreadCurrentUICulture = culture;

            AppResources.Culture = culture;
            Preferences.Set("AppLanguage", languageCode);

   
            if (Application.Current != null)
            {
               var token = SecureStorage.Default.GetAsync("jwt_token").Result;

                Application.Current.MainPage = new AppShell();
                if (string.IsNullOrEmpty(token))
                {
                    Shell.Current.GoToAsync("//LoginPage");
                }
                else
                {
                 
                    Shell.Current.GoToAsync("//GreenhousesPage");
                }
            }
        }

        public static void LoadSavedLanguage()
        {
            var savedLang = Preferences.Get("AppLanguage", "en");

            var culture = new CultureInfo(savedLang);
            Thread.CurrentThread.CurrentCulture = culture;
            Thread.CurrentThread.CurrentUICulture = culture;
            CultureInfo.DefaultThreadCurrentCulture = culture;
            CultureInfo.DefaultThreadCurrentUICulture = culture;
            AppResources.Culture = culture;
        }
    }
}
