import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { clientsApi, Client } from '../api/api';
import { countries } from '../data/countries';
import { Flag } from '../components/Flag';

export const ClientCard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadClient = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await clientsApi.getById(Number(id));
      setClient(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка загрузки данных клиента');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadClient();
  }, [loadClient]);

  const formatPhoneNumber = (phone: string): string => {
    if (!phone) return '-';
    const cleaned = phone.replace(/[^\d+]/g, '');
    if (!cleaned) return '-';
    return cleaned;
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-400">Загрузка данных клиента...</div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg">
        {error || 'Клиент не найден'}
      </div>
    );
  }

  const country = countries.find(c => c.code === client.country);

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/clients')}
        className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Назад к списку клиентов
      </button>

      <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-yellow-400/10 to-transparent px-6 py-4 border-b border-gray-700/50">
          <h1 className="text-2xl font-bold text-white">
            {client.first_name} {client.last_name}
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            ID: #{client.id} • Статус:{' '}
            <span className={client.is_active ? 'text-green-400' : 'text-red-400'}>
              {client.is_active ? 'Активен' : 'Неактивен'}
            </span>
          </p>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                Контактная информация
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-400">Имя</p>
                  <p className="text-white font-medium">{client.first_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Фамилия</p>
                  <p className="text-white font-medium">{client.last_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <a
                    href={`mailto:${client.email}`}
                    className="text-yellow-400 hover:text-yellow-300 transition-colors"
                  >
                    {client.email}
                  </a>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Телефон</p>
                  <a
                    href={`tel:${client.phone}`}
                    className="text-yellow-400 hover:text-yellow-300 transition-colors font-mono"
                  >
                    {formatPhoneNumber(client.phone || '')}
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-400">Страна / Регион</p>
                <p className="text-white flex items-center gap-2">
                  {country ? (
                    <>
                      <Flag code={country.flag} size={16} />
                      {country.name}
                    </>
                  ) : client.country || '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Компания</p>
                <p className="text-white">{client.company || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Дата создания</p>
                <p className="text-white">{formatDate(client.created_at)}</p>
              </div>
              {client.notes && client.notes.trim() && (
                <div>
                  <p className="text-sm text-gray-400">Дополнительная информация</p>
                  <div className="bg-gray-700/30 p-3 rounded-lg mt-1 whitespace-pre-wrap text-white">
                    {client.notes}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-900/30 border-t border-gray-700/50 flex gap-3">
          <button
            onClick={() => navigate(`/clients/${client.id}/edit`)}
            className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-medium rounded-lg transition-all"
          >
            ✏️ Редактировать
          </button>
          <button
            onClick={async () => {
              if (window.confirm('Вы уверены, что хотите удалить этого клиента?')) {
                try {
                  await clientsApi.delete(client.id);
                  navigate('/clients');
                } catch (err: any) {
                  alert(err.response?.data?.detail || 'Ошибка удаления клиента');
                }
              }
            }}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-medium rounded-lg transition-all border border-red-500/20"
          >
            🗑️ Удалить
          </button>
        </div>
      </div>
    </div>
  );
};