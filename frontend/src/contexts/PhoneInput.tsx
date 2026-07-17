import React, { useState, useRef, useEffect } from 'react';
import { countries, Country } from '../data/countries';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  onBlur,
  error,
  placeholder = 'Введите номер телефона',
  required = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country>(countries[0]);
  const [localError, setLocalError] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Определяем страну по номеру
  useEffect(() => {
    if (value) {
      const matched = countries.find(c => value.startsWith(c.dialCode));
      if (matched) {
        setSelectedCountry(matched);
      }
    }
  }, [value]);

  // Закрытие дропдауна при клике вне
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Валидация телефона
  const validatePhone = (phone: string): boolean => {
    if (!phone) return !required;

    // Удаляем все кроме цифр и +
    const cleaned = phone.replace(/[^\d+]/g, '');

    // Проверка: только цифры и + в начале
    if (!/^\+?\d*$/.test(cleaned)) {
      setLocalError('Введите корректный номер телефона');
      return false;
    }

    // Проверка: + только в начале
    if (cleaned.indexOf('+') > 0) {
      setLocalError('Введите корректный номер телефона');
      return false;
    }

    // Подсчет цифр
    const digits = cleaned.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 15) {
      setLocalError('Введите корректный номер телефона');
      return false;
    }

    setLocalError('');
    return true;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value;

    // Удаляем все кроме цифр и +
    input = input.replace(/[^\d+]/g, '');

    // Убедимся, что + только в начале
    if (input.indexOf('+') > 0) {
      input = input.replace(/\+/g, '');
    }

    onChange(input);
    validatePhone(input);
  };

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setIsOpen(false);

    // Очищаем номер от старого кода
    let newValue = value;
    countries.forEach(c => {
      if (newValue.startsWith(c.dialCode)) {
        newValue = newValue.replace(c.dialCode, '');
      }
    });

    // Добавляем новый код
    const finalValue = country.dialCode + newValue;
    onChange(finalValue);
    validatePhone(finalValue);
  };

  const formatPhoneDisplay = (phone: string): string => {
    if (!phone) return '';
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 0) return '';

    // Форматирование: +XXX (XX) XXX-XX-XX
    let formatted = '';
    if (phone.startsWith('+')) {
      formatted = '+';
      const rest = digits;
      if (rest.length > 0) formatted += rest.slice(0, 3);
      if (rest.length > 3) formatted += ' (' + rest.slice(3, 5);
      if (rest.length > 5) formatted += ') ' + rest.slice(5, 8);
      if (rest.length > 8) formatted += '-' + rest.slice(8, 10);
      if (rest.length > 10) formatted += '-' + rest.slice(10, 12);
      return formatted;
    }
    return phone;
  };

  return (
    <div className={`relative ${className}`}>
      <label className="block text-sm font-medium text-gray-300 mb-1">
        Телефон {required && <span className="text-yellow-400">*</span>}
      </label>

      <div className="flex">
        {/* Выбор страны */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="h-[50px] px-3 bg-gray-700/50 border border-r-0 border-gray-600 rounded-l-lg hover:bg-gray-600/50 transition-colors flex items-center gap-2"
          >
            <span className="text-xl">{selectedCountry.flag}</span>
            <span className="text-white text-sm">{selectedCountry.dialCode}</span>
            <svg className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Дропдаун стран */}
          {isOpen && (
            <div className="absolute left-0 top-full mt-1 w-72 max-h-60 overflow-y-auto bg-gray-800 border border-gray-600 rounded-lg shadow-2xl z-50">
              <div className="sticky top-0 bg-gray-800 p-2 border-b border-gray-600">
                <input
                  type="text"
                  placeholder="Поиск страны..."
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  onChange={(e) => {
                    const search = e.target.value.toLowerCase();
                    const items = dropdownRef.current?.querySelectorAll('.country-item');
                    items?.forEach(item => {
                      const text = item.textContent?.toLowerCase() || '';
                      (item as HTMLElement).style.display = text.includes(search) ? 'flex' : 'none';
                    });
                  }}
                />
              </div>
              {countries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleCountrySelect(country)}
                  className={`country-item w-full px-4 py-2 flex items-center gap-3 hover:bg-yellow-400/10 transition-colors text-left ${
                    selectedCountry.code === country.code ? 'bg-yellow-400/20' : ''
                  }`}
                >
                  <span className="text-xl">{country.flag}</span>
                  <span className="text-white flex-1">{country.name}</span>
                  <span className="text-gray-400 text-sm">{country.dialCode}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Поле ввода телефона */}
        <input
          type="tel"
          value={value}
          onChange={handlePhoneChange}
          onBlur={() => {
            validatePhone(value);
            if (onBlur) onBlur();
          }}
          placeholder={placeholder}
          required={required}
          className={`flex-1 px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-r-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all ${
            (error || localError) ? 'border-red-500 focus:ring-red-500' : ''
          }`}
        />
      </div>

      {/* Сообщение об ошибке */}
      {(error || localError) && (
        <p className="mt-1 text-sm text-red-400">
          {error || localError}
        </p>
      )}

      {/* Подсказка по формату */}
      {!error && !localError && value && (
        <p className="mt-1 text-xs text-gray-500">
          Формат: +XXX (XX) XXX-XX-XX (от 10 до 15 цифр)
        </p>
      )}
    </div>
  );
};