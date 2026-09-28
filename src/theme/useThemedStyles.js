import { useMemo, useRef } from 'react';
import { useTheme } from './ThemeContext';

/**
 * createStyles(colors) → StyleSheet
 * createStyles modül seviyesinde tanımlıysa her tema değişiminde bir kez üretilir.
 * Inline function verilirse yine çalışır; mümkünse modül seviyesinde tut.
 */
export function useThemedStyles(createStyles) {
  const { colors } = useTheme();
  const factoryRef = useRef(createStyles);
  factoryRef.current = createStyles;

  return useMemo(() => factoryRef.current(colors), [colors]);
}
