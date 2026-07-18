import React, { useState, useRef, useEffect } from 'react';
import { countries, Country } from '../data/countries';
import { Flag } from './Flag';

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
  const [displayValue, setDisplayValue] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      const matched = countries.find(c => value.startsWith(c.dialCode));
      if (matched) {
        setSelectedCountry(matched);
      }
      setDisplayValue(formatPhoneNumber(value));
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatPhoneNumber = (phone: string): string => {
    if (!phone) return '';

    const cleaned = phone.replace(/[^\d+]/g, '');
    if (!cleaned) return '';

    let dialCode = '';
    let rest = cleaned;

    for (const country of countries) {
      if (cleaned.startsWith(country.dialCode)) {
        dialCode = country.dialCode;
        rest = cleaned.slice(dialCode.length);
        break;
      }
    }

    if (!dialCode) {
      if (cleaned.startsWith('+')) {
        const digits = cleaned.slice(1);
        if (digits.length <= 3) return '+' + digits;
        if (digits.length <= 5) return '+' + digits.slice(0, 3) + ' ' + digits.slice(3);
        if (digits.length <= 8) return '+' + digits.slice(0, 3) + ' ' + digits.slice(3, 6) + ' ' + digits.slice(6);
        return '+' + digits.slice(0, 3) + ' ' + digits.slice(3, 6) + ' ' + digits.slice(6, 8) + ' ' + digits.slice(8);
      }
      return cleaned;
    }

    let formatted = dialCode;
    const digits = rest.replace(/\D/g, '');

    if (digits.length === 0) return formatted;

    if (digits.length <= 2) {
      formatted += ' ' + digits;
    } else if (digits.length <= 4) {
      formatted += ' (' + digits.slice(0, 2) + ')';
      if (digits.length > 2) {
        formatted += ' ' + digits.slice(2);
      }
    } else if (digits.length <= 7) {
      formatted += ' (' + digits.slice(0, 2) + ') ' + digits.slice(2, 5);
      if (digits.length > 5) {
        formatted += '-' + digits.slice(5);
      }
    } else {
      formatted += ' (' + digits.slice(0, 2) + ') ' + digits.slice(2, 5) + '-' + digits.slice(5, 7);
      if (digits.length > 7) {
        formatted += '-' + digits.slice(7, 9);
      }
      if (digits.length > 9) {
        formatted += '-' + digits.slice(9, 11);
      }
    }

    return formatted;
  };

  const cleanPhoneNumber = (formatted: string): string => {
    return formatted.replace(/[\s()-]/g, '');
  };

  const validatePhone = (phone: string): boolean => {
    if (!phone) return !required;

    const cleaned = phone.replace(/[^\d+]/g, '');

    if (!/^\+?\d*$/.test(cleaned)) {
      setLocalError('Введите корректный номер телефона');
      return false;
    }

    if (cleaned.indexOf('+') > 0) {
      setLocalError('Введите корректный номер телефона');
      return false;
    }

    const digits = cleaned.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 15) {
      setLocalError('Введите корректный номер телефона');
      return false;
    }

    setLocalError('');
    return true;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;

    let cleaned = rawValue.replace(/[^\d+]/g, '');

    if (cleaned.indexOf('+') > 0) {
      cleaned = cleaned.replace(/\+/g, '');
    }

    const maxLength = 18;
    if (cleaned.length > maxLength) {
      cleaned = cleaned.slice(0, maxLength);
    }

    const formatted = formatPhoneNumber(cleaned);
    setDisplayValue(formatted);

    const cleanValue = cleanPhoneNumber(formatted);
    onChange(cleanValue);
    validatePhone(cleanValue);
  };

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setIsOpen(false);

    let newValue = value;
    countries.forEach(c => {
      if (newValue.startsWith(c.dialCode)) {
        newValue = newValue.replace(c.dialCode, '');
      }
    });

    const finalValue = country.dialCode + newValue;
    const formatted = formatPhoneNumber(finalValue);
    setDisplayValue(formatted);
    onChange(finalValue);
    validatePhone(finalValue);
  };

  const getFormatHint = (): string => {
    if (!displayValue) return 'Пример: +375 (29) 123-45-67';
    return '';
  };

  return (
    <div className={`relative ${className}`}>
      <label className="block text-sm font-medium text-gray-300 mb-1">
        Телефон {required && <span className="text-yellow-400">*</span>}
      </label>

      <div className="flex">
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="h-[50px] px-3 bg-gray-700/50 border border-r-0 border-gray-600 rounded-l-lg hover:bg-gray-600/50 transition-colors flex items-center gap-2"
          >
            <Flag code={selectedCountry.flag} size={24} />
            <span className="text-white text-sm">{selectedCountry.dialCode}</span>
            <svg className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

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
                  <Flag code={country.flag} size={24} />
                  <span className="text-white flex-1">{country.name}</span>
                  <span className="text-gray-400 text-sm">{country.dialCode}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <input
          type="tel"
          value={displayValue}
          onChange={handlePhoneChange}
          onBlur={() => {
            validatePhone(value);
            if (onBlur) onBlur();
          }}
          placeholder={placeholder}
          required={required}
          className={`flex-1 px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-r-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all font-mono tracking-wide ${
            (error || localError) ? 'border-red-500 focus:ring-red-500' : ''
          }`}
        />
      </div>

      {(error || localError) && (
        <p className="mt-1 text-sm text-red-400">
          {error || localError}
        </p>
      )}

      {!error && !localError && displayValue && (
        <p className="mt-1 text-xs text-gray-500">
          {getFormatHint()}
        </p>
      )}
    </div>
  );
};