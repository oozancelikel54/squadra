import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Appearance, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SystemUI from 'expo-system-ui';
import { getColors } from './palette';

const STORAGE_KEY = '@lineup/theme'; // geriye uyumluluk — paket adı değişmedi

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [mode, setModeState] = useState('light');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (mounted && (saved === 'light' || saved === 'dark')) {
          setModeState(saved);
        }
      } catch (e) {
        // ignore
      } finally {
        if (mounted) setReady(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const applySystemChrome = useCallback((nextMode) => {
    const palette = getColors(nextMode);
    Appearance.setColorScheme(nextMode);
    SystemUI.setBackgroundColorAsync(palette.bg).catch(() => {});
    StatusBar.setBarStyle(
      nextMode === 'dark' ? 'light-content' : 'dark-content',
      true
    );
  }, []);

  useEffect(() => {
    if (!ready) return;
    applySystemChrome(mode);
    const sub = Appearance.addChangeListener(() => {
      Appearance.setColorScheme(mode);
    });
    return () => sub.remove();
  }, [mode, ready, applySystemChrome]);

  const setMode = useCallback(async (next) => {
    if (next !== 'light' && next !== 'dark') return;
    setModeState(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, next);
    } catch (e) {
      // ignore
    }
  }, []);

  const toggleMode = useCallback(() => {
    setMode(mode === 'dark' ? 'light' : 'dark');
  }, [mode, setMode]);

  const colors = useMemo(() => getColors(mode), [mode]);
  const isDark = mode === 'dark';

  const value = useMemo(
    () => ({
      mode,
      setMode,
      toggleMode,
      colors,
      isDark,
      ready,
    }),
    [mode, setMode, toggleMode, colors, isDark, ready]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}
