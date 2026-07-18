import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientsApi, Client } from '../api/api';
import { ClientForm } from './ClientForm';
import { countries } from '../data/countries';
import { Flag } from './Flag';

export const ClientsList: React.FC = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const loadClients = useCallback(async () => {
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
  }, []);

  const filterClients = useCallback(() => {
    let filtered = [...clients];

    if (selectedCountry !== 'all') {
      filtered = filtered.filter(client => client.country === selectedCountry);
    }

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(client => {
        const fullName = `${client.first_name} ${client.last_name}`.toLowerCase();
        if (fullName.includes(searchLower)) return true;
        if (client.last_name.toLowerCase().includes(searchLower)) return true;
        if (client.email.toLowerCase().includes(searchLower)) return true;

        const phoneClean = client.phone?.replace(/[\s()\-+]/g, '') || '';
        const searchClean = searchLower.replace(/[\s()\-+]/g, '');
        if (phoneClean.includes(searchClean)) return true;

        return false;
      });
    }

    setFilteredClients(filtered);
  }, [clients, searchTerm, selectedCountry]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  useEffect(() => {
    filterClients();
  }, [filterClients]);

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

  const formatPhoneNumber = (phone: string): string => {
    if (!phone) return '-';

    const cleaned = phone.replace(/[^\d+]/g, '');
    if (!cleaned) return '-';

    if (cleaned.startsWith('+')) {
      const digits = cleaned.slice(1);
      if (digits.length <= 3) return '+' + digits;
      if (digits.length <= 5) return '+' + digits.slice(0, 3) + ' ' + digits.slice(3);
      if (digits.length <= 7) return '+' + digits.slice(0, 3) + ' (' + digits.slice(3, 5) + ')';
      if (digits.length <= 9) return '+' + digits.slice(0, 3) + ' (' + digits.slice(3, 5) + ') ' + digits.slice(5, 8);
      if (digits.length <= 11) return '+' + digits.slice(0, 3) + ' (' + digits.slice(3, 5) + ') ' + digits.slice(5, 8) + '-' + digits.slice(8, 10);
      return '+' + digits.slice(0, 3) + ' (' + digits.slice(3, 5) + ') ' + digits.slice(5, 8) + '-' + digits.slice(8, 10) + '-' + digits.slice(10, 12);
    }

    if (phone.length <= 3) return phone;
    if (phone.length <= 6) return phone.slice(0, 3) + ' ' + phone.slice(3);
    if (phone.length <= 8) return phone.slice(0, 3) + ' ' + phone.slice(3, 6) + ' ' + phone.slice(6);
    if (phone.length <= 10) return phone.slice(0, 3) + ' ' + phone.slice(3, 6) + ' ' + phone.slice(6, 8) + '-' + phone.slice(8);
    return phone.slice(0, 3) + ' ' + phone.slice(3, 6) + ' ' + phone.slice(6, 8) + '-' + phone.slice(8, 10) + '-' + phone.slice(10);
  };

  const highlightMatch = (text: string, search: string): React.ReactNode => {
    if (!search.trim() || !text) return text;

    const searchLower = search.toLowerCase().trim();
    const textLower = text.toLowerCase();
    const index = textLower.indexOf(searchLower);

    if (index === -1) return text;

    return (
      <>
        {text.slice(0, index)}
        <span className="bg-yellow-400/30 text-yellow-200 px-0.5 rounded">
          {text.slice(index, index + search.length)}
        </span>
        {text.slice(index + search.length)}
      </>
    );
  };

  const handleCountryChange = (country: string) => {
    setSelectedCountry(country);
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Загрузка клиентов...</div>;
  }

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Клиенты</h1>
        </div>
        <div className="flex gap-3 items-center">
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

      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="🔍 Поиск по имени, e-mail или номеру телефона"
              className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="min-w-[200px]">
          <select
            value={selectedCountry}
            onChange={(e) => handleCountryChange(e.target.value)}
            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all appearance-none"
          >
            <option value="all">🌍 Все страны</option>
            {countries.map((country) => (
              <option key={country.code} value={country.code}>
                {country.flag} {country.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-4 flex justify-between items-center text-sm text-gray-400">
        <span>
          {searchTerm || selectedCountry !== 'all' ? (
            <>Найдено: <span className="text-yellow-400 font-semibold">{filteredClients.length}</span> из {clients.length}</>
          ) : (
            <>Всего клиентов: <span className="text-yellow-400 font-semibold">{clients.length}</span></>
          )}
        </span>
        {filteredClients.length === 0 && (searchTerm || selectedCountry !== 'all') && (
          <span className="text-yellow-400">✕ Клиенты не найдены</span>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {showForm && (
        <div className="mb-6">
          <ClientForm
            client={editingClient}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </div>
      )}

      {filteredClients.length === 0 ? (
        <div className="text-center py-12 bg-gray-800/30 border border-gray-700/50 rounded-xl">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-xl font-medium text-white">Клиенты не найдены</h3>
          <p className="text-gray-400 mt-2">
            {searchTerm || selectedCountry !== 'all' ? 'Попробуйте изменить параметры поиска' : 'Добавьте первого клиента!'}
          </p>
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
                  Страна
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
              {filteredClients.map((client) => {
                const country = countries.find(c => c.code === client.country);
                return (
                  <tr
                    key={client.id}
                    className="hover:bg-yellow-400/5 transition-colors cursor-pointer"
                    onClick={() => navigate(`/clients/${client.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      #{client.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {searchTerm ? (
                        <>
                          {highlightMatch(client.first_name, searchTerm)}
                          {' '}
                          {highlightMatch(client.last_name, searchTerm)}
                        </>
                      ) : (
                        `${client.first_name} ${client.last_name}`
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {searchTerm ? highlightMatch(client.email, searchTerm) : client.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono tracking-wide">
                      {formatPhoneNumber(client.phone || '')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {country ? (
                        <div className="flex items-center gap-2">
                          <Flag code={country.flag} size={20} />
                          {country.name}
                        </div>
                      ) : '-'}
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
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(client);
                        }}
                        className="text-yellow-400 hover:text-yellow-300 transition-colors"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(client.id);
                        }}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};