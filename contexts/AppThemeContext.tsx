import { createContext, ReactNode, useContext, useState } from 'react';

export type ThemeMode = 'light' | 'dark';

type ThemeColors = {
  background: string;
  card: string;
  cardAlt: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentAlt: string;
  border: string;
};

const darkColors: ThemeColors = {
  background: '#1a1a2e',
  card: '#16213e',
  cardAlt: '#0f3460',
  text: '#ffffff',
  textSecondary: '#aaaaaa',
  textMuted: '#777777',
  accent: '#e94560',
  accentAlt: '#4ecca3',
  border: '#22223a',
};

const lightColors: ThemeColors = {
  background: '#f2f2f7',
  card: '#ffffff',
  cardAlt: '#eef1f8',
  text: '#1a1a2e',
  textSecondary: '#5a5a6e',
  textMuted: '#8a8a9e',
  accent: '#e94560',
  accentAlt: '#1f9d73',
  border: '#e0e0ec',
};

type AppThemeContextValue = {
  mode: ThemeMode;
  colors: ThemeColors;
  toggleTheme: () => void;
};

const AppThemeContext = createContext<AppThemeContextValue | undefined>(undefined);

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('dark');

  const toggleTheme = () => {
    setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const colors = mode === 'dark' ? darkColors : lightColors;

  return (
    <AppThemeContext.Provider value={{ mode, colors, toggleTheme }}>
      {children}
    </AppThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(AppThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within an AppThemeProvider');
  }
  return context;
}