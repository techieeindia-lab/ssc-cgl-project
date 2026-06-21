export interface ThemeColors {
  bg_primary: string;
  bg_secondary: string;
  bg_card: string;
  accent: string;
  accent_light: string;
  accent_dark: string;
  qa_color: string;
  gir_color: string;
  ga_color: string;
  en_color: string;
  text_primary: string;
  text_secondary: string;
  text_muted: string;
  q_not_visited: string;
  q_not_answered: string;
  q_answered: string;
  q_marked: string;
  q_answered_marked: string;
  timer_normal: string;
  timer_warning: string;
  timer_danger: string;
  border: string;
}

export const DARK_COLORS: ThemeColors;
export const LIGHT_COLORS: ThemeColors;
export const COLORS: ThemeColors;
export function getTheme(): 'dark' | 'light';
export function setTheme(theme: 'dark' | 'light'): void;
