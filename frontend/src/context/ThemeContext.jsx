import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};


export const ThemeProvider = ({ children }) => {
  // Inicialmente null para evitar flash, luego se sincroniza en useEffect
  const [theme, setTheme] = useState(null);

  useEffect(() => {
    // Solo en montaje: sincronizar con localStorage o sistema
    let initialTheme = 'dark';
    const stored = localStorage.getItem('vizionrd-theme');
    if (stored) {
      initialTheme = stored;
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      initialTheme = 'dark';
    } else {
      initialTheme = 'light';
    }
    setTheme(initialTheme);
  }, []);

  useEffect(() => {
    if (!theme) return;
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('vizionrd-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  const value = {
    theme,
    toggleTheme,
    isDark: theme === 'dark',
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
