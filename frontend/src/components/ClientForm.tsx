import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { clientsApi, Client } from '../api/api';
import { PhoneInput } from './PhoneInput';
import { CountrySelect } from './CountrySelect';

interface ClientFormProps {
  client?: Client | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const ClientForm: React.FC<ClientFormProps> = ({
  client: propClient,
  onSuccess,
  onCancel,
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    country: 'BY',
    company: '',
    notes: '',
    is_active: true,
  });

  const isEditing = !!id || !!propClient;

  const fillForm = useCallback((clientData: Client) => {
    setFormData({
      first_name: clientData.first_name || '',
      last_name: clientData.last_name || '',
      email: clientData.email || '',
      phone: clientData.phone || '',
      country: clientData.country || 'BY',
      company: clientData.company || '',
      notes: clientData.notes || '',
      is_active: clientData.is_active !== undefined ? clientData.is_active : true,
    });
  }, []);

  const loadClient = useCallback(async (clientId: number) => {
    try {
      setLoading(true);
      const response = await clientsApi.getById(clientId);
      setClient(response.data);
      fillForm(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка загрузки клиента');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [fillForm]);

  useEffect(() => {
    if (id) {
      loadClient(Number(id));
    } else if (propClient) {
      fillForm(propClient);
    }
  }, [id, propClient, loadClient, fillForm]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handlePhoneChange = (value: string) => {
    setFormData(prev => ({ ...prev, phone: value }));
  };

  const handleCountryChange = (value: string) => {
    setFormData(prev => ({ ...prev, country: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
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
        notes: formData.notes.trim() || undefined,
      };

      if (isEditing) {
        const clientId = client?.id || propClient?.id || Number(id);
        if (clientId) {
          await clientsApi.update(clientId, dataToSend);
        }
      } else {
        await clientsApi.create(dataToSend);
      }

      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/clients');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Ошибка сохранения клиента');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate('/clients');
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Загрузка данных клиента...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-6">
      <h2 className="text-xl font-bold text-white mb-4">
        {isEditing ? '✏️ Редактирование клиента' : '➕ Новый клиент'}
      </h2>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        <div>
          <PhoneInput
            value={formData.phone}
            onChange={handlePhoneChange}
            required
            placeholder="Введите номер телефона"
          />
        </div>

        <div>
          <CountrySelect
            value={formData.country}
            onChange={handleCountryChange}
            label="Страна"
            placeholder="Выберите страну"
          />
        </div>

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

      <div className="flex gap-3 mt-6">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-6 py-3 bg-yellow-400 hover:bg-yellow-500 disabled:bg-yellow-600/50 text-black font-medium rounded-lg transition-all"
        >
          {loading ? 'Сохранение...' : isEditing ? '💾 Сохранить' : '➕ Создать'}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="px-6 py-3 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 font-medium rounded-lg transition-all"
        >
          Отмена
        </button>
      </div>
    </form>
  );
};