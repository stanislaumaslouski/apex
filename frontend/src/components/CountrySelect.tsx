import React, { useState, useRef, useEffect } from 'react';
import { countries } from '../data/countries';
import { Flag } from './Flag';

interface CountrySelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  label?: string;
  placeholder?: string;
}

export const CountrySelect: React.FC<CountrySelectProps> = ({
  value,
  onChange,
  className = '',
  label = 'Страна',
  placeholder = 'Выберите страну',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedCountry = countries.find(c => c.code === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-300 mb-1">
        {label}
      </label>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white flex items-center justify-between hover:bg-gray-600/50 transition-all focus:outline-none focus:ring-2 focus:ring-yellow-400"
      >
        <span className="flex items-center gap-2">
          {selectedCountry ? (
            <>
              {/* Передаем flag как code — это может быть эмодзи или код */}
              <Flag code={selectedCountry.flag} />
              {selectedCountry.name}
            </>
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </span>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 max-h-60 overflow-y-auto bg-gray-800 border border-gray-600 rounded-lg shadow-2xl z-50">
          <div className="sticky top-0 bg-gray-800 p-2 border-b border-gray-600">
            <input
              type="text"
              placeholder="Поиск страны..."
              className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              onChange={(e) => {
                const search = e.target.value.toLowerCase();
                const items = dropdownRef.current?.querySelectorAll('.country-option');
                items?.forEach(item => {
                  const text = item.textContent?.toLowerCase() || '';
                  (item as HTMLElement).style.display = text.includes(search) ? 'flex' : 'none';
                });
              }}
            />
          </div>
          <button
            className={`country-option w-full px-4 py-2 flex items-center gap-3 hover:bg-yellow-400/10 transition-colors text-left ${
              value === 'all' ? 'bg-yellow-400/20' : ''
            }`}
            onClick={() => {
              onChange('all');
              setIsOpen(false);
            }}
          >
            <Flag code="all" />
            <span className="text-white">Все страны</span>
          </button>
          {countries.map((country) => (
            <button
              key={country.code}
              className={`country-option w-full px-4 py-2 flex items-center gap-3 hover:bg-yellow-400/10 transition-colors text-left ${
                value === country.code ? 'bg-yellow-400/20' : ''
              }`}
              onClick={() => {
                onChange(country.code);
                setIsOpen(false);
              }}
            >
              <Flag code={country.flag} size={16} />
              <span className="text-white flex-1">{country.name}</span>
              <span className="text-gray-400 text-sm">{country.dialCode}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};