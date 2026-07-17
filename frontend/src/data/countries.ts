export interface Country {
  code: string;
  name: string;
  flag: string;
  dialCode: string;
}

export const countries: Country[] = [
  { code: 'BY', name: 'Беларусь', flag: '🇧🇾', dialCode: '+375' },
  { code: 'RU', name: 'Россия', flag: '🇷🇺', dialCode: '+7' },
  { code: 'UA', name: 'Украина', flag: '🇺🇦', dialCode: '+380' },
  { code: 'KZ', name: 'Казахстан', flag: '🇰🇿', dialCode: '+7' },
  { code: 'PL', name: 'Польша', flag: '🇵🇱', dialCode: '+48' },
  { code: 'LT', name: 'Литва', flag: '🇱🇹', dialCode: '+370' },
  { code: 'LV', name: 'Латвия', flag: '🇱🇻', dialCode: '+371' },
  { code: 'EE', name: 'Эстония', flag: '🇪🇪', dialCode: '+372' },
];

// Для фильтрации используем список стран с дополнительным "Все страны"
export const filterCountries = [
  { code: 'all', name: 'Все страны', flag: '🌍', dialCode: '' },
  ...countries,
];