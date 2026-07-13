import axios from 'axios';

// В продакшене используем /api, локально - localhost:8000
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерцептор для добавления токена к каждому запросу
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Интерцептор для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============ ТИПЫ ============
export interface Client {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// ============ AUTH API ============
export const authApi = {
  register: (username: string, email: string, password: string) => {
    return api.post('/auth/register', { username, email, password });
  },

  login: (username: string, password: string) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    return api.post<TokenResponse>('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  },

  me: () => {
    return api.get<User>('/auth/me');
  },
};

// ============ CLIENTS API ============
export const clientsApi = {
  getAll: () => {
    return api.get<Client[]>('/clients/');
  },

  getById: (id: number) => {
    return api.get<Client>(`/clients/${id}`);
  },

  create: (data: Omit<Client, 'id' | 'created_at' | 'updated_at'>) => {
    return api.post<Client>('/clients/', data);
  },

  update: (id: number, data: Partial<Omit<Client, 'id' | 'created_at' | 'updated_at'>>) => {
    return api.put<Client>(`/clients/${id}`, data);
  },

  delete: (id: number) => {
    return api.delete(`/clients/${id}`);
  },
};