import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

interface ThemeState {
  isDarkMode: boolean;
  isLoading: boolean;
  toggleTheme: () => void;
  loadTheme: () => Promise<void>;
}

const THEME_KEY = 'book2action_theme';

export const useThemeStore = create<ThemeState>((set, get) => ({
  isDarkMode: true,
  isLoading: true,
  
  toggleTheme: async () => {
    const newTheme = !get().isDarkMode;
    set({ isDarkMode: newTheme });
    try {
      await SecureStore.setItemAsync(THEME_KEY, newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  },
  
  loadTheme: async () => {
    try {
      const savedTheme = await SecureStore.getItemAsync(THEME_KEY);
      if (savedTheme !== null) {
        set({ isDarkMode: savedTheme === 'dark', isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Failed to load theme preference:', error);
      set({ isLoading: false });
    }
  },
}));
