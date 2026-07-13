import React, { useEffect, useState } from 'react';
import { clientsApi, Client } from '../api/api';
import { useAuth } from '../contexts/AuthContext';
import { ClientForm } from './ClientForm';

export const ClientsList: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const response = await clientsApi.getAll();
      setClients(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка загрузки клиентов');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingClient(null);
    loadClients();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingClient(null);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить этого клиента?')) return;
    try {
      await clientsApi.delete(id);
      await loadClients();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка удаления клиента');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Загрузка клиентов...</div>;
  }

  return (
    <div>
      {/* Шапка */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Клиенты</h1>
          {user && (
            <p className="text-sm text-gray-400">
              Добро пожаловать, {user.username}!
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setEditingClient(null);
              setShowForm(!showForm);
            }}
            className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-medium rounded-lg transition-all"
          >
            {showForm && !editingClient ? '✕ Отмена' : '+ Добавить клиента'}
          </button>
        </div>
      </div>

      {/* Ошибки */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Форма создания/редактирования */}
      {showForm && (
        <div className="mb-6">
          <ClientForm
            client={editingClient}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </div>
      )}

      {/* Таблица клиентов */}
      {clients.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Нет клиентов. Добавьте первого!
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-700/50">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-800/80">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-yellow-600/20">
                  ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-yellow-600/20">
                  Имя
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-yellow-600/20">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-yellow-600/20">
                  Телефон
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-yellow-600/20">
                  Компания
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-yellow-600/20">
                  Статус
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-yellow-600/20">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-900/30 divide-y divide-gray-700/50">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-yellow-400/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    #{client.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                    {client.first_name} {client.last_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {client.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {client.phone || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {client.company || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      client.is_active 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {client.is_active ? '● Активен' : '○ Неактивен'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-3">
                    <button
                      onClick={() => handleEdit(client)}
                      className="text-yellow-400 hover:text-yellow-300 transition-colors"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(client.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};