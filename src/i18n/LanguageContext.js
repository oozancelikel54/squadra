import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DEFAULT_LOCALE,
  LOCALES,
  localizeInstruction,
  translate,
} from './translations';

const STORAGE_KEY = '@lineupbuilder/locale';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [locale, setLocaleState] = useState(DEFAULT_LOCALE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (mounted && (saved === 'tr' || saved === 'en')) {
          setLocaleState(saved);
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

  const setLocale = useCallback(async (next) => {
    if (next !== 'tr' && next !== 'en') return;
    setLocaleState(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, next);
    } catch (e) {
      // ignore
    }
  }, []);

  const t = useCallback(
    (key, vars) => translate(locale, key, vars),
    [locale]
  );

  const ti = useCallback(
    (instruction) => localizeInstruction(instruction, locale),
    [locale]
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
      ti,
      ready,
      locales: LOCALES,
    }),
    [locale, setLocale, t, ti, ready]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useI18n() must be used within <LanguageProvider>');
  }
  return ctx;
}
