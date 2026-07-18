export interface Country {
  code: string;
  name: string;
  flag: string;
  dialCode: string;
}

export const countries: Country[] = [
  // Европа
  { code: 'BY', name: 'Беларусь', flag: 'by', dialCode: '+375' },
  { code: 'RU', name: 'Россия', flag: 'ru', dialCode: '+7' },
  { code: 'UA', name: 'Украина', flag: 'ua', dialCode: '+380' },
  { code: 'PL', name: 'Польша', flag: 'pl', dialCode: '+48' },
  { code: 'LT', name: 'Литва', flag: 'lt', dialCode: '+370' },
  { code: 'LV', name: 'Латвия', flag: 'lv', dialCode: '+371' },
  { code: 'EE', name: 'Эстония', flag: 'ee', dialCode: '+372' },
  { code: 'KZ', name: 'Казахстан', flag: 'kz', dialCode: '+7' },

];

export const filterCountries = [
  { code: 'all', name: 'Все страны', flag: '🌍', dialCode: '' },
  ...countries,
];