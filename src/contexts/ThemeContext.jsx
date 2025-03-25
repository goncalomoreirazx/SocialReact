import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Check for stored preference or system preference
  const getInitialTheme = () => {
    if (typeof window === 'undefined') return 'light';
    
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) return storedTheme;
    
    // Check system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'light';
  };

  const [theme, setTheme] = useState(getInitialTheme);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  // Update localStorage and apply theme to document when theme changes
  useEffect(() => {
    localStorage.setItem('theme', theme);
    
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);