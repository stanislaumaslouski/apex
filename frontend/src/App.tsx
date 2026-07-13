import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { ClientsList } from './components/ClientsList';

function Navigation() {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <nav className="bg-black border-b border-yellow-600/30 shadow-lg shadow-yellow-600/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2 group">
              <img
                src="/Image.png"
                alt="APEX CRM Logo"
                className="h-8 w-auto transition-all duration-300 ease-in-out group-hover:scale-110 group-hover:rotate-6 group-hover:drop-shadow-lg group-hover:drop-shadow-yellow-400/50"
              />
              <span className="text-xl font-bold text-white tracking-tight transition-colors duration-300 group-hover:text-yellow-400">
                APEX<span className="text-yellow-400 group-hover:text-white transition-colors duration-300">CRM</span>
              </span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-400">
                  👤 {user?.username}
                </span>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm font-medium text-black bg-yellow-400 rounded-lg hover:bg-yellow-500 transition-colors"
                >
                  Выйти
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-300 hover:text-yellow-400 transition-colors">
                  Войти
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-black bg-yellow-400 rounded-lg hover:bg-yellow-500 transition-colors"
                >
                  Регистрация
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function AppContent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1A1A] via-[#2D2D2D] to-[#1A1A1A]">
      <Navigation />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-gray-900/50 backdrop-blur-sm border border-yellow-600/20 rounded-2xl shadow-2xl shadow-yellow-600/5 p-6">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <ClientsList />
                </ProtectedRoute>
              } />
              <Route path="/clients/new" element={
                <ProtectedRoute>
                  <ClientsList />
                </ProtectedRoute>
              } />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;