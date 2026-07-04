import React, { useState } from 'react';
import { ClientList } from './components/ClientList';
import { ClientForm } from './components/ClientForm';

function App() {
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    setShowForm(false);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                CRM - Управление клиентами
              </h1>
              <button
                onClick={() => setShowForm(!showForm)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {showForm ? 'Закрыть форму' : '+ Добавить клиента'}
              </button>
            </div>

            {showForm && (
              <div className="mb-8 p-4 border border-gray-200 rounded-lg">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Новый клиент
                </h2>
                <ClientForm onSuccess={handleSuccess} onCancel={() => setShowForm(false)} />
              </div>
            )}

            <ClientList key={refreshKey} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;