import React, { useState } from 'react';
import { useEffect } from 'react';
import { Settings as SettingsIcon, Globe, Moon, Sun, Download, Palette, Database } from 'lucide-react';

const Settings: React.FC = () => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) {
      return saved === 'dark' ? 'dark' : saved === 'auto' ? 'auto' : 'light';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'auto' : 'light';
  });
  
  // Gemini API Key state
  const [geminiKey, setGeminiKey] = useState(() => localStorage.getItem('geminiKey') || '');


  // Sync language state with localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const storedLanguage = localStorage.getItem('language') || 'en';
      setLanguage(storedLanguage);
      
      // Also sync theme state
      const storedTheme = localStorage.getItem('theme');
      if (storedTheme) {
        setTheme(storedTheme === 'dark' ? 'dark' : storedTheme === 'auto' ? 'auto' : 'light');
      }
    };

    // Listen for storage changes from other tabs/components
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom storage events from same tab
    window.addEventListener('localStorageChange', handleStorageChange);
    window.addEventListener('themeChange', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageChange', handleStorageChange);
      window.removeEventListener('themeChange', handleStorageChange);
    };
  }, []);
  
  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
    // Trigger a custom event to notify other components in the same tab
    window.dispatchEvent(new CustomEvent('localStorageChange'));
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    
    // Apply theme logic similar to Layout component
    const root = document.documentElement;
    if (newTheme === 'dark') {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else if (newTheme === 'light') {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else if (newTheme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      localStorage.setItem('theme', 'auto');
    }
    
    // Trigger custom event to notify Layout component
    window.dispatchEvent(new CustomEvent('themeChange'));
  };

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
  ];

  const themes = [
    { id: 'light', name: 'Light', name_id: 'Terang', icon: Sun },
    { id: 'dark', name: 'Dark', name_id: 'Gelap', icon: Moon },
    { id: 'auto', name: 'Auto', name_id: 'Otomatis', icon: Palette },
  ];

  const exportFormats = [
    { id: 'csv', name: 'CSV', description: 'Comma-separated values for spreadsheet applications' },
    { id: 'pdf', name: 'PDF', description: 'Formatted report for viewing and printing' },
    { id: 'json', name: 'JSON', description: 'Raw data format for developers' },
  ];

  const handleExport = (format: string) => {
    // Simulate export functionality
    console.log(`Exporting data in ${format.toUpperCase()} format...`);
  };

  // Removed notification handler and related state
  const saveGeminiKey = () => {
    localStorage.setItem('geminiKey', geminiKey);
    console.log('Gemini API Key saved');
  };

  const getLanguageContent = () => {
    if (language === 'id') {
      return {
        title: 'Pengaturan',
        subtitle: 'Sesuaikan pengalaman Neurovia AI Anda',
        sections: {
          appearance: 'Tampilan',
          language: 'Bahasa',
          theme: 'Tema',
          notifications: 'Notifikasi',
          dailyReminder: 'Pengingat Harian',
          weeklyReport: 'Laporan Mingguan',
          insights: 'Wawasan AI',
          survey: 'Survei & Analisis',
          frequency: 'Frekuensi Survei',
          weekly: 'Mingguan',
          monthly: 'Bulanan',
          quarterly: 'Triwulanan',
          dataExport: 'Ekspor Data',
          autoExport: 'Ekspor Otomatis',
          exportFormats: 'Format Ekspor',
          privacy: 'Privasi & Keamanan',
          account: 'Akun',
          about: 'Tentang',
        }
      };
    } else {
      return {
        title: 'Settings',
        subtitle: 'Customize your Neurovia AI experience',
        sections: {
          appearance: 'Appearance',
          language: 'Language',
          theme: 'Theme',
          notifications: 'Notifications',
          dailyReminder: 'Daily Reminder',
          weeklyReport: 'Weekly Report',
          insights: 'AI Insights',
          survey: 'Survey & Analysis',
          frequency: 'Survey Frequency',
          weekly: 'Weekly',
          monthly: 'Monthly',
          quarterly: 'Quarterly',
          dataExport: 'Data Export',
          autoExport: 'Auto Export',
          exportFormats: 'Export Formats',
          privacy: 'Privacy & Security',
          account: 'Account',
          about: 'About',
        }
      };
    }
  };

  const content = getLanguageContent();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Settings Header */}
      <div className="bg-white/80 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <SettingsIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{content.title}</h1>
            <p className="text-slate-600 dark:text-slate-400">{content.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Gemini API Key */}
      <div className="bg-white/80 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-6 flex items-center space-x-2">
          <Database className="w-5 h-5" />
          <span>{language === 'id' ? 'Kunci API Gemini' : 'Gemini API Key'}</span>
        </h3>
        <div className="space-y-4">
          <input
            type="password"
            value={geminiKey}
            onChange={(e) => setGeminiKey(e.target.value)}
            placeholder={language === 'id' ? 'Masukkan Kunci API Gemini Anda' : 'Enter your Gemini API Key'}
            className="w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-700/50 rounded-lg border border-slate-200/50 dark:border-slate-600/50 focus:ring-2 focus:ring-blue-500/50 focus:border-transparent outline-none text-slate-700 dark:text-slate-300"
          />
          <button
            onClick={saveGeminiKey}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            {language === 'id' ? 'Simpan Kunci' : 'Save Key'}
          </button>
        </div>
      </div>

      {/* Appearance Settings */}
      <div className="bg-white/80 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-6 flex items-center space-x-2">
          <Palette className="w-5 h-5" />
          <span>{content.sections.appearance}</span>
        </h3>
        
        <div className="space-y-6">
          {/* Language Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              <Globe className="w-4 h-4 inline mr-2" />
              {content.sections.language}
            </label>
            <div className="grid grid-cols-2 gap-3">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    language === lang.code
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20'
                      : 'border-slate-200/50 dark:border-slate-600/50 hover:border-slate-300/50 dark:hover:border-slate-500/50'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{lang.flag}</span>
                    <span className="font-medium text-slate-800 dark:text-slate-100">{lang.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Theme Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              {content.sections.theme}
            </label>
            <div className="grid grid-cols-3 gap-3">
              {themes.map((themeOption) => {
                const Icon = themeOption.icon;
                return (
                  <button
                    key={themeOption.id}
                    onClick={() => handleThemeChange(themeOption.id)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      theme === themeOption.id
                        ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20'
                        : 'border-slate-200/50 dark:border-slate-600/50 hover:border-slate-300/50 dark:hover:border-slate-500/50'
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <Icon className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-100">{language === 'id' ? (themeOption.id === 'light' ? 'Terang' : themeOption.id === 'dark' ? 'Gelap' : 'Otomatis') : themeOption.name}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>



      {/* Data Export */}
      <div className="bg-white/80 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-6 flex items-center space-x-2">
          <Download className="w-5 h-5" />
          <span>{content.sections.dataExport}</span>
        </h3>
        
        <div className="space-y-4">
          {exportFormats.map((format) => (
            <div key={format.id} className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-700/50 rounded-lg">
              <div>
                <h4 className="font-medium text-slate-800 dark:text-slate-100">{format.name}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">{format.description}</p>
              </div>
              <button
                onClick={() => handleExport(format.id)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Export
              </button>
            </div>
          ))}
        </div>
      </div>



    </div>
  );
};

export default Settings;