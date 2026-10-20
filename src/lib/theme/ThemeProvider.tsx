import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { App, ConfigProvider } from 'antd';
import enUS from 'antd/locale/en_US';
import { colors as lightColors } from './colors';
import { darkColors } from './colors.dark';
import { buildAntdTheme } from './antdTheme';
import { setCSSCustomProperties } from './cssVariables';
import { ThemeContext, type ColorMode, type ResolvedMode } from './ThemeContext';

const STORAGE_KEY = 'jm-theme';

const getSystemMode = (): ResolvedMode =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';

const readStoredMode = (): ColorMode => {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    // First visit defaults to light (the brand's primary look), like the hub
    return v === 'light' || v === 'dark' || v === 'system' ? v : 'light';
  } catch {
    return 'light';
  }
};

/**
 * Owns colour mode, Ant Design's ConfigProvider and the CSS custom properties.
 * Wraps everything in antd's <App> so `App.useApp()` message / modal /
 * notification pick up the theme (the static `message.x()` API does not).
 */
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [colorMode, setColorModeState] = useState<ColorMode>(readStoredMode);
  const [systemMode, setSystemMode] = useState<ResolvedMode>(getSystemMode);

  // Follow OS-level changes while in 'system'
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemMode(e.matches ? 'dark' : 'light');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const setColorMode = useCallback((next: ColorMode) => {
    setColorModeState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // storage unavailable — keep the in-memory choice
    }
  }, []);

  const mode: ResolvedMode = colorMode === 'system' ? systemMode : colorMode;
  const isDark = mode === 'dark';
  const colors = isDark ? darkColors : lightColors;

  const toggleTheme = useCallback(
    () => setColorMode(isDark ? 'light' : 'dark'),
    [isDark, setColorMode],
  );

  const antdTheme = useMemo(() => buildAntdTheme(colors, isDark), [colors, isDark]);

  useEffect(() => {
    setCSSCustomProperties(colors, isDark);
    document.documentElement.setAttribute('data-theme', mode);
    document.documentElement.style.colorScheme = mode;
  }, [colors, isDark, mode]);

  const value = useMemo(
    () => ({ colorMode, setColorMode, mode, isDark, toggleTheme, colors }),
    [colorMode, setColorMode, mode, isDark, toggleTheme, colors],
  );

  return (
    <ThemeContext.Provider value={value}>
      <ConfigProvider theme={antdTheme} locale={enUS}>
        <App>{children}</App>
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};
