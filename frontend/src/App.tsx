import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { ClientList } from './components/ClientList';
import { ClientForm } from './components/ClientForm';
import { ClientDetail } from './components/ClientDetail';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex space-x-8">
                <Link to="/" className="inline-flex items-center px-1 pt-1 text-gray-900">
                  <span className="text-xl font-bold">CRM</span>
                </Link>
                <Link to="/" className="inline-flex items-center px-1 pt-1 text-gray-500 hover:text-gray-900">
                  Клиенты
                </Link>
                <Link to="/clients/new" className="inline-flex items-center px-1 pt-1 text-gray-500 hover:text-gray-900">
                  + Добавить
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white shadow rounded-lg p-6">
              <Routes>
                <Route path="/" element={<ClientList />} />
                <Route path="/clients/new" element={<ClientFormWrapper />} />
                <Route path="/clients/:id/edit" element={<ClientFormWrapper />} />
                <Route path="/clients/:id" element={<ClientDetail />} />
              </Routes>
            </div>
          </div>
        </div>
      </div>
    </Router>
  );
}

// Обертка для формы с навигацией
function ClientFormWrapper() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/');
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <ClientForm
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  );
}

export default App;