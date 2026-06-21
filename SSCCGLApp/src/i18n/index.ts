import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';

import en from './en.json';
import hi from './hi.json';

const LANGUAGES = {
  en: { translation: en },
  hi: { translation: hi },
};

const LANGUAGE_KEY = 'app_language';

const detectLanguage = async () => {
  try {
    const stored = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (stored) return stored;
  } catch {}
  const locales = Localization.getLocales?.();
  const langCode = locales?.[0]?.languageCode;
  if (langCode?.startsWith('hi')) return 'hi';
  return 'en';
};

detectLanguage().then((lang) => {
  i18n.use(initReactI18next).init({
    resources: LANGUAGES,
    lng: lang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    compatibilityJSON: 'v4',
  });
});

const changeLanguage = async (lang: 'en' | 'hi') => {
  await i18n.changeLanguage(lang);
  await AsyncStorage.setItem(LANGUAGE_KEY, lang);
};

export { changeLanguage };

export default i18n;
