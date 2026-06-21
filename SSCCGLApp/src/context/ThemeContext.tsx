import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setTheme as setGlobalTheme, COLORS, ThemeColors } from '../theme/colors';

type ThemeType = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeType;
  colors: ThemeColors;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  colors: COLORS,
  toggleTheme: () => {},
  isDark: true,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeType>('dark');

  useEffect(() => {
    // Load persisted theme on start
    AsyncStorage.getItem('app_theme').then((savedTheme) => {
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setThemeState(savedTheme);
        setGlobalTheme(savedTheme);
      }
    });
  }, []);

  const toggleTheme = async () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setThemeState(nextTheme);
    setGlobalTheme(nextTheme);
    await AsyncStorage.setItem('app_theme', nextTheme);
  };

  const isDark = theme === 'dark';

  return (
    <ThemeContext.Provider value={{ theme, colors: COLORS, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
