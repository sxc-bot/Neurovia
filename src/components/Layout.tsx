import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Brain, 
  FileText, 
  Settings as SettingsIcon,

  Moon,
  Sun
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) {
      if (saved === 'auto') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      return saved === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });

  // Sync language state with localStorage changes from other components
  useEffect(() => {
    const handleStorageChange = () => {
      const storedLanguage = localStorage.getItem('language') || 'en';
      setLanguage(storedLanguage);
      
      // Also sync theme state
      const storedTheme = localStorage.getItem('theme');
      if (storedTheme) {
        if (storedTheme === 'auto') {
          setIsDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
        } else {
          setIsDarkMode(storedTheme === 'dark');
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('localStorageChange', handleStorageChange);
    window.addEventListener('themeChange', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageChange', handleStorageChange);
      window.removeEventListener('themeChange', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Only update localStorage if this change came from the Layout toggle
    // (not from Settings component which handles its own localStorage)
    const currentTheme = localStorage.getItem('theme');
    if (!currentTheme || (currentTheme !== 'auto' && ((isDarkMode && currentTheme !== 'dark') || (!isDarkMode && currentTheme !== 'light')))) {
      localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
      window.dispatchEvent(new CustomEvent('themeChange'));
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('language', language);
    // Trigger custom event to notify other components
    window.dispatchEvent(new CustomEvent('localStorageChange'));
  }, [language]);

  const getContent = () => {
    if (language === 'id') {
      return {
        appName: 'Neurovia AI',
        appSubtitle: 'Analitik Kesejahteraan',
        navigation: [
          { name: 'Ikhtisar Dasbor', href: '/', icon: LayoutDashboard },
          { name: 'Jurnal & Sentimen', href: '/journal', icon: BookOpen },
          { name: 'Metrik Pikiran', href: '/mind-metrics', icon: Brain },
          { name: 'Laporan AI', href: '/ai-report', icon: FileText },
          { name: 'Pengaturan', href: '/settings', icon: SettingsIcon },
        ],
        user: {
          name: 'Alex Johnson',
          status: 'Anggota Premium'
        },
        currentDate: new Date().toLocaleDateString('id-ID', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      };
    } else {
      return {
        appName: 'Neurovia AI',
        appSubtitle: 'Wellbeing Analytics',
        navigation: [
          { name: 'Dashboard Overview', href: '/', icon: LayoutDashboard },
          { name: 'Journal & Sentiment', href: '/journal', icon: BookOpen },
          { name: 'Mind Metrics', href: '/mind-metrics', icon: Brain },
          { name: 'AI Report', href: '/ai-report', icon: FileText },
          { name: 'Settings', href: '/settings', icon: SettingsIcon },
        ],
        user: {
          name: 'Alex Johnson',
          status: 'Premium Member'
        },
        currentDate: new Date().toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      };
    }
  };

  const content = getContent();

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'id' : 'en';
    setLanguage(newLanguage);
  };

  return (
    <div className="min-h-screen">
      <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        {/* Sidebar */}
        <div className="w-64 bg-white/80 dark:bg-slate-800/90 backdrop-blur-md border-r border-slate-200/50 dark:border-slate-700/50 shadow-lg">
          <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">{content.appName}</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">{content.appSubtitle}</p>
              </div>
            </div>
          </div>
          
          <nav className="mt-6 px-4 space-y-2">
            {content.navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-700 dark:text-blue-400 border border-blue-200/50 dark:border-blue-500/30'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 hover:text-slate-800 dark:hover:text-slate-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>


        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white/80 dark:bg-slate-800/90 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-700/50 shadow-sm">
            <div className="flex items-center justify-between px-6 py-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                  {content.navigation.find(item => item.href === location.pathname)?.name || content.navigation[0].name}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {content.currentDate}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleLanguage}
                  className="px-3 py-2 rounded-lg bg-slate-100/50 dark:bg-slate-700/50 hover:bg-slate-200/50 dark:hover:bg-slate-600/50 transition-colors text-sm font-medium text-slate-600 dark:text-slate-300"
                >
                  {language === 'en' ? '🇮🇩 ID' : '🇺🇸 EN'}
                </button>
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-lg bg-slate-100/50 dark:bg-slate-700/50 hover:bg-slate-200/50 dark:hover:bg-slate-600/50 transition-colors"
                >
                  {isDarkMode ? (
                    <Sun className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                  ) : (
                    <Moon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                  )}
                </button>
                {/* Notification icon removed */}
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;