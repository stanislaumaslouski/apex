import React, { useState, useEffect } from 'react';
import { Client, clientsApi } from '../api/api';
import { PhoneInput } from './PhoneInput';
import { countries } from '../data/countries';

interface ClientFormProps {
  client?: Client | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const ClientForm: React.FC<ClientFormProps> = ({
  client,
  onSuccess,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company: '',
    country: '',
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string>('');
  const isEditing = !!client;

  useEffect(() => {
    if (client) {
      setFormData({
        first_name: client.first_name,
        last_name: client.last_name,
        email: client.email,
        phone: client.phone || '',
        company: client.company || '',
        country: client.country || '',
        is_active: client.is_active,
      });
    }
  }, [client]);

  // ✅ ИСПРАВЛЕННЫЙ handleChange
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    // Для checkbox проверяем отдельно
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handlePhoneChange = (phone: string) => {
    setFormData(prev => ({ ...prev, phone }));
    setPhoneError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.phone) {
      const digits = formData.phone.replace(/\D/g, '');
      if (digits.length < 10 || digits.length > 15) {
        setPhoneError('Введите корректный номер телефона');
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      if (isEditing && client) {
        await clientsApi.update(client.id, formData);
      } else {
        await clientsApi.create(formData);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка сохранения клиента');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800/30 border border-yellow-600/20 rounded-xl p-6">
      <h3 className="text-xl font-bold text-white mb-4">
        {isEditing ? '✏️ Редактирование клиента' : '➕ Новый клиент'}
      </h3>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          name="first_name"
          placeholder="Имя *"
          required
          value={formData.first_name}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
        />
        <input
          type="text"
          name="last_name"
          placeholder="Фамилия *"
          required
          value={formData.last_name}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
        />
        <input
          type="email"
          name="email"
          placeholder="Email *"
          required
          value={formData.email}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
        />
        <PhoneInput
          value={formData.phone}
          onChange={handlePhoneChange}
          error={phoneError}
          placeholder="Введите номер телефона"
        />
        <input
          type="text"
          name="company"
          placeholder="Компания"
          value={formData.company}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
        />

        {/* ВЫБОР СТРАНЫ */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Страна
          </label>
          <select
            name="country"
            value={formData.country}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all appearance-none"
          >
            <option value="">Выберите страну</option>
            {countries.map((country) => (
              <option key={country.code} value={country.code}>
                {country.flag} {country.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            name="is_active"
            id="is_active"
            checked={formData.is_active}
            onChange={handleChange}
            className="w-5 h-5 text-yellow-400 focus:ring-yellow-400 border-gray-600 rounded bg-gray-700/50"
          />
          <label htmlFor="is_active" className="text-gray-300">
            Активен
          </label>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-black font-medium rounded-lg transition-all transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50"
        >
          {loading ? 'Сохранение...' : isEditing ? 'Обновить' : 'Сохранить'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-all"
        >
          Отмена
        </button>
      </div>
    </form>
  );
};