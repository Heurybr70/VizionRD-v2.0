import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const systemScheme = useColorScheme();
  const [theme, setTheme] = useState('light');
  const isDark = theme === 'dark';

  useEffect(() => {
    AsyncStorage.getItem('vizionrd-theme').then((stored) => {
      if (stored) {
        setTheme(stored);
      } else {
        setTheme(systemScheme === 'dark' ? 'dark' : 'light');
      }
    });
  }, []);

  const toggleTheme = async () => {
    const next = isDark ? 'light' : 'dark';
    setTheme(next);
    await AsyncStorage.setItem('vizionrd-theme', next);
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme debe usarse dentro de ThemeProvider');
  return ctx;
};
