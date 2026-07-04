import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Client } from '../types';
import { clientsApi } from '../api/clients';

export const ClientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadClient(parseInt(id));
    }
  }, [id]);

  const loadClient = async (clientId: number) => {
    try {
      setLoading(true);
      const data = await clientsApi.getById(clientId);
      setClient(data);
      setError(null);
    } catch (err) {
      setError('Клиент не найден');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!client) return;
    if (!window.confirm('Вы уверены, что хотите удалить этого клиента?')) return;

    try {
      await clientsApi.delete(client.id);
      navigate('/');
    } catch (err) {
      setError('Ошибка удаления клиента');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Загрузка...</div>;
  }

  if (error || !client) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error || 'Клиент не найден'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {client.first_name} {client.last_name}
          </h2>
          <p className="text-sm text-gray-500">ID: {client.id}</p>
        </div>
        <div className="flex space-x-3">
          <Link
            to={`/clients/${client.id}/edit`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Редактировать
          </Link>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Удалить
          </button>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Email</dt>
            <dd className="mt-1 text-sm text-gray-900">{client.email}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Телефон</dt>
            <dd className="mt-1 text-sm text-gray-900">{client.phone || '-'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Компания</dt>
            <dd className="mt-1 text-sm text-gray-900">{client.company || '-'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Статус</dt>
            <dd className="mt-1">
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                client.is_active
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {client.is_active ? 'Активен' : 'Неактивен'}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Создан</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {new Date(client.created_at).toLocaleDateString('ru-RU')}
            </dd>
          </div>
          {client.updated_at && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Обновлен</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(client.updated_at).toLocaleDateString('ru-RU')}
              </dd>
            </div>
          )}
        </dl>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <Link
          to="/"
          className="text-blue-600 hover:text-blue-800"
        >
          ← Назад к списку клиентов
        </Link>
      </div>
    </div>
  );
};