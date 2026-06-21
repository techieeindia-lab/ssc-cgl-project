import { StyleSheet } from 'react-native';

export const DARK_COLORS = {
  bg_primary: '#0D1B2A',
  bg_secondary: '#132133',
  bg_card: '#1A2D42',
  accent: '#2E86DE',
  accent_light: '#5DADE2',
  accent_dark: '#1A5276',
  qa_color: '#E74C3C',
  gir_color: '#9B59B6',
  ga_color: '#27AE60',
  en_color: '#F39C12',
  text_primary: '#FFFFFF',
  text_secondary: '#A9B4C2',
  text_muted: '#4A6278',
  q_not_visited: '#2C3E50',
  q_not_answered: '#E74C3C',
  q_answered: '#27AE60',
  q_marked: '#8E44AD',
  q_answered_marked: '#2980B9',
  timer_normal: '#27AE60',
  timer_warning: '#F39C12',
  timer_danger: '#E74C3C',
  border: '#1E3448',
};

export const LIGHT_COLORS = {
  bg_primary: '#F3F4F8',       // cool slate grey background
  bg_secondary: '#FFFFFF',     // white card background
  bg_card: '#FFFFFF',          // white card background
  accent: '#3B82F6',           // vibrant royal blue
  accent_light: '#60A5FA',     // lighter blue
  accent_dark: '#DBEAFE',      // soft blue background tint
  qa_color: '#EF4444',         // warm red
  gir_color: '#8B5CF6',        // vibrant violet
  ga_color: '#10B981',         // emerald green
  en_color: '#F59E0B',         // amber orange
  text_primary: '#1E293B',     // rich slate-900 text
  text_secondary: '#64748B',   // cool slate-500 text
  text_muted: '#94A3B8',       // slate-400 muted text
  q_not_visited: '#E2E8F0',    // slate-200
  q_not_answered: '#EF4444',
  q_answered: '#10B981',
  q_marked: '#8B5CF6',
  q_answered_marked: '#3B82F6',
  timer_normal: '#10B981',
  timer_warning: '#F59E0B',
  timer_danger: '#EF4444',
  border: '#E2E8F0',           // slate-200 border
};

let currentTheme = 'dark';
const listeners = new Set();

export const getTheme = () => currentTheme;
export const setTheme = (theme) => {
  if (theme !== 'dark' && theme !== 'light') return;
  currentTheme = theme;
  listeners.forEach(l => {
    try {
      l(theme);
    } catch (e) {
      console.error('Theme listener error', e);
    }
  });
};

// Create a reverse mapping from dark color values to color keys
const colorToKeyMap = new Map();
Object.entries(DARK_COLORS).forEach(([key, val]) => {
  colorToKeyMap.set(val.toLowerCase(), key);
});

// Monkeypatch StyleSheet.create
const originalCreate = StyleSheet.create;

const resolveStaticStyles = (stylesObj, theme) => {
  const resolved = {};
  const colors = theme === 'light' ? LIGHT_COLORS : DARK_COLORS;

  for (const styleKey in stylesObj) {
    const styleDecl = stylesObj[styleKey];
    if (!styleDecl || typeof styleDecl !== 'object') {
      resolved[styleKey] = styleDecl;
      continue;
    }

    resolved[styleKey] = Array.isArray(styleDecl) ? [] : {};
    for (const prop in styleDecl) {
      const val = styleDecl[prop];
      if (typeof val === 'string') {
        const valLower = val.toLowerCase();
        if (colorToKeyMap.has(valLower)) {
          const colorKey = colorToKeyMap.get(valLower);
          resolved[styleKey][prop] = colors[colorKey];
          continue;
        }
      }
      resolved[styleKey][prop] = val;
    }
  }
  return resolved;
};

StyleSheet.create = (stylesObj) => {
  // Compile styles for both dark and light themes using the native StyleSheet.create
  const darkStyles = originalCreate(resolveStaticStyles(stylesObj, 'dark'));
  const lightStyles = originalCreate(resolveStaticStyles(stylesObj, 'light'));

  const result = {};
  for (const styleKey in stylesObj) {
    Object.defineProperty(result, styleKey, {
      get() {
        return currentTheme === 'light' ? lightStyles[styleKey] : darkStyles[styleKey];
      },
      enumerable: true,
      configurable: true,
    });
  }
  return result;
};

// Export COLORS proxy
export const COLORS = new Proxy({}, {
  get(target, prop) {
    const colors = currentTheme === 'light' ? LIGHT_COLORS : DARK_COLORS;
    return colors[prop];
  },
  ownKeys() {
    return Object.keys(DARK_COLORS);
  },
  getOwnPropertyDescriptor(target, prop) {
    return {
      enumerable: true,
      configurable: true,
    };
  }
});