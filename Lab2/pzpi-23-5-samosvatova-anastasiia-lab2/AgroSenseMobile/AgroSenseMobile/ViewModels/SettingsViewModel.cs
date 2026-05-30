using AgroSenseMobile.Helpers;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System;
using System.Collections.Generic;
using System.Text;

namespace AgroSenseMobile.ViewModels
{
    public partial class SettingsViewModel : ObservableObject
    {
        [ObservableProperty]
        private string currentLanguage;

        public SettingsViewModel()
        {
           
            var savedLang = Preferences.Get("AppLanguage", "en");
            CurrentLanguage = savedLang == "uk" ? "Українська" : "English";
        }

        [RelayCommand]
        private void ChangeLanguage(string langCode)
        {
            if (string.IsNullOrEmpty(langCode)) return;

          
            LanguageHelper.SetLanguage(langCode);

         
            CurrentLanguage = langCode == "uk" ? "Українська" : "English";
        }
    }
}
