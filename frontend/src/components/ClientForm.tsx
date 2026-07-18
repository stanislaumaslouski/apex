import React, { useState, useEffect } from 'react';
import { clientsApi, Client } from '../api/api';
import { countries } from '../data/countries';
import { PhoneInput } from './PhoneInput';

interface ClientFormProps {
  client?: Client | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const ClientForm: React.FC<ClientFormProps> = ({
  client,
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    country: 'BY',
    company: '',
    notes: '',        // ← ДОБАВЛЕНО ПОЛЕ notes
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (client) {
      setFormData({
        first_name: client.first_name || '',
        last_name: client.last_name || '',
        email: client.email || '',
        phone: client.phone || '',
        country: client.country || 'BY',
        company: client.company || '',
        notes: client.notes || '',    // ← ДОБАВЛЕНО
        is_active: client.is_active !== undefined ? client.is_active : true,
      });
    }
  }, [client]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handlePhoneChange = (value: string) => {
    setFormData(prev => ({ ...prev, phone: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Валидация
      if (!formData.first_name.trim() || !formData.last_name.trim()) {
        throw new Error('Имя и фамилия обязательны для заполнения');
      }
      if (!formData.email.trim()) {
        throw new Error('Email обязателен для заполнения');
      }
      if (!formData.phone.trim()) {
        throw new Error('Телефон обязателен для заполнения');
      }

      const dataToSend = {
        ...formData,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        company: formData.company.trim() || undefined,
        notes: formData.notes.trim() || undefined,  // ← ДОБАВЛЕНО
      };

      if (client) {
        // Обновление
        await clientsApi.update(client.id, dataToSend);
      } else {
        // Создание
        await clientsApi.create(dataToSend);
      }

      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Ошибка сохранения клиента');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-6">
      <h2 className="text-xl font-bold text-white mb-4">
        {client ? '✏️ Редактирование клиента' : '➕ Новый клиент'}
      </h2>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Имя */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Имя <span className="text-yellow-400">*</span>
          </label>
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
            placeholder="Введите имя"
          />
        </div>

        {/* Фамилия */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Фамилия <span className="text-yellow-400">*</span>
          </label>
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
            placeholder="Введите фамилию"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Email <span className="text-yellow-400">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
            placeholder="example@email.com"
          />
        </div>

        {/* Телефон */}
        <div>
          <PhoneInput
            value={formData.phone}
            onChange={handlePhoneChange}
            required
            placeholder="Введите номер телефона"
          />
        </div>

        {/* Страна */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Страна
          </label>
          <select
            name="country"
            value={formData.country}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all appearance-none"
          >
            {countries.map((country) => (
              <option key={country.code} value={country.code}>
                {country.flag} {country.name}
              </option>
            ))}
          </select>
        </div>

        {/* Компания */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Компания
          </label>
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
            placeholder="Название компании"
          />
        </div>
      </div>

      {/* Дополнительная информация (notes) - НОВОЕ ПОЛЕ */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Дополнительная информация
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all resize-y"
          placeholder="Введите дополнительную информацию о клиенте..."
        />
        <p className="mt-1 text-xs text-gray-500">
          Максимум 500 символов
        </p>
      </div>

      {/* Статус */}
      <div className="mt-4 flex items-center gap-3">
        <input
          type="checkbox"
          name="is_active"
          checked={formData.is_active}
          onChange={handleChange}
          className="w-5 h-5 rounded border-gray-600 bg-gray-700/50 text-yellow-400 focus:ring-yellow-400 focus:ring-2"
        />
        <label className="text-sm font-medium text-gray-300">
          Активен
        </label>
      </div>

      {/* Кнопки */}
      <div className="flex gap-3 mt-6">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-6 py-3 bg-yellow-400 hover:bg-yellow-500 disabled:bg-yellow-600/50 text-black font-medium rounded-lg transition-all"
        >
          {loading ? 'Сохранение...' : client ? '💾 Сохранить' : '➕ Создать'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 font-medium rounded-lg transition-all"
        >
          Отмена
        </button>
      </div>
    </form>
  );
};