import { createContext, useContext } from 'react';
import { colors as lightColors } from './colors';

export type ColorMode = 'light' | 'dark' | 'system';
export type ResolvedMode = 'light' | 'dark';

export interface ThemeContextValue {
  /** What the user picked — may be 'system'. */
  colorMode: ColorMode;
  setColorMode: (mode: ColorMode) => void;
  /** What is actually showing. */
  mode: ResolvedMode;
  isDark: boolean;
  /** Flip between light and dark (leaves 'system'). */
  toggleTheme: () => void;
  colors: typeof lightColors;
}

export const ThemeContext = createContext<ThemeContextValue>({
  colorMode: 'light',
  setColorMode: () => {},
  mode: 'light',
  isDark: false,
  toggleTheme: () => {},
  colors: lightColors,
});

export const useTheme = () => useContext(ThemeContext);
export const useColors = () => useContext(ThemeContext).colors;
