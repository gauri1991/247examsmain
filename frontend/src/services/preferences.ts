import { apiRequest } from '@/lib/api';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  examReminders: boolean;
  soundEffects: boolean;
  autoSave: boolean;
  defaultExamDuration: number;
  resultsEmailNotifications: boolean;
  weeklyReports: boolean;
  fontSize: 'small' | 'medium' | 'large';
  animationsEnabled: boolean;
}

export const defaultPreferences: UserPreferences = {
  theme: 'system',
  language: 'en',
  timezone: 'Asia/Kolkata',
  examReminders: true,
  soundEffects: true,
  autoSave: true,
  defaultExamDuration: 120,
  resultsEmailNotifications: true,
  weeklyReports: false,
  fontSize: 'medium',
  animationsEnabled: true,
};

export class PreferencesService {
  private static STORAGE_KEY = 'userPreferences';

  static async loadPreferences(): Promise<UserPreferences> {
    try {
      // First try to load from localStorage for immediate response
      const localPrefs = this.loadFromLocalStorage();
      
      // In production, also try to fetch from API
      // const apiPrefs = await this.loadFromAPI();
      
      return localPrefs;
    } catch (error) {
      console.error('Failed to load preferences:', error);
      return defaultPreferences;
    }
  }

  static async savePreferences(preferences: UserPreferences): Promise<void> {
    try {
      // Save to localStorage immediately
      this.saveToLocalStorage(preferences);
      
      // In production, also save to API
      // await this.saveToAPI(preferences);
      
      // Apply preferences immediately
      this.applyPreferences(preferences);
    } catch (error) {
      console.error('Failed to save preferences:', error);
      throw error;
    }
  }

  private static loadFromLocalStorage(): UserPreferences {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...defaultPreferences, ...parsed };
      }
    } catch (error) {
      console.error('Failed to parse stored preferences:', error);
    }
    return defaultPreferences;
  }

  private static saveToLocalStorage(preferences: UserPreferences): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(preferences));
  }

  private static async loadFromAPI(): Promise<Partial<UserPreferences>> {
    try {
      const response = await apiRequest('/users/preferences/', {
        method: 'GET',
      });
      return response.data || {};
    } catch (error) {
      console.error('Failed to load preferences from API:', error);
      return {};
    }
  }

  private static async saveToAPI(preferences: UserPreferences): Promise<void> {
    try {
      await apiRequest('/users/preferences/', {
        method: 'POST',
        body: JSON.stringify(preferences),
      });
    } catch (error) {
      console.error('Failed to save preferences to API:', error);
      // Don't throw here - localStorage save succeeded
    }
  }

  static applyPreferences(preferences: UserPreferences): void {
    // Apply theme
    this.applyTheme(preferences.theme);
    
    // Apply font size
    this.applyFontSize(preferences.fontSize);
    
    // Apply animations
    this.applyAnimations(preferences.animationsEnabled);
  }

  private static applyTheme(theme: 'light' | 'dark' | 'system'): void {
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System theme
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (systemDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }

  private static applyFontSize(fontSize: 'small' | 'medium' | 'large'): void {
    const root = document.documentElement;
    root.classList.remove('font-small', 'font-medium', 'font-large');
    root.classList.add(`font-${fontSize}`);
  }

  private static applyAnimations(enabled: boolean): void {
    const root = document.documentElement;
    if (enabled) {
      root.classList.remove('no-animations');
    } else {
      root.classList.add('no-animations');
    }
  }

  static exportPreferences(): string {
    const preferences = this.loadFromLocalStorage();
    return JSON.stringify(preferences, null, 2);
  }

  static async importPreferences(preferencesJson: string): Promise<void> {
    try {
      const preferences = JSON.parse(preferencesJson);
      const validatedPreferences = { ...defaultPreferences, ...preferences };
      await this.savePreferences(validatedPreferences);
    } catch (error) {
      console.error('Failed to import preferences:', error);
      throw new Error('Invalid preferences format');
    }
  }

  static resetToDefaults(): Promise<void> {
    return this.savePreferences(defaultPreferences);
  }
}