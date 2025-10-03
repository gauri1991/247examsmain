'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  actualTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system');
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Load theme from localStorage or user preferences
    const savedTheme = localStorage.getItem('theme') as Theme;
    const userPreferences = localStorage.getItem('userPreferences');
    
    if (userPreferences) {
      try {
        const preferences = JSON.parse(userPreferences);
        if (preferences.theme) {
          setTheme(preferences.theme);
        }
      } catch (error) {
        console.error('Failed to parse user preferences:', error);
      }
    } else if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    const updateActualTheme = () => {
      let newActualTheme: 'light' | 'dark' = 'light';

      if (theme === 'system') {
        newActualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      } else {
        newActualTheme = theme as 'light' | 'dark';
      }

      setActualTheme(newActualTheme);

      // Apply theme to document
      const root = document.documentElement;
      if (newActualTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    updateActualTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        updateActualTheme();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Also update user preferences if they exist
    const userPreferences = localStorage.getItem('userPreferences');
    if (userPreferences) {
      try {
        const preferences = JSON.parse(userPreferences);
        preferences.theme = newTheme;
        localStorage.setItem('userPreferences', JSON.stringify(preferences));
      } catch (error) {
        console.error('Failed to update user preferences:', error);
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme, actualTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}