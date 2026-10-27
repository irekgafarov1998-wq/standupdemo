export type Language = 'ru' | 'en' | 'zh' | 'tr';

export interface LanguageInfo {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
  region: string;
}

export const SUPPORTED_LANGUAGES: Record<Language, LanguageInfo> = {
  ru: {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    flag: '🇷🇺',
    region: 'СНГ / Россия'
  },
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
    region: 'Global / US / UK'
  },
  zh: {
    code: 'zh',
    name: 'Chinese (Simplified)',
    nativeName: '简体中文',
    flag: '🇨🇳',
    region: '中国 / 亚洲'
  },
  tr: {
    code: 'tr',
    name: 'Turkish',
    nativeName: 'Türkçe',
    flag: '🇹🇷',
    region: 'Türkiye / Orta Doğu'
  }
};
