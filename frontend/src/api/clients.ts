import axios from 'axios';
import { Client, ClientCreate, ClientUpdate } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://apex-steel-ten.vercel.app';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const clientsApi = {
  // Получить всех клиентов
  getAll: async (): Promise<Client[]> => {
    const response = await api.get('/clients/');
    return response.data;
  },

  // Получить клиента по ID
  getById: async (id: number): Promise<Client> => {
    const response = await api.get(`/clients/${id}`);
    return response.data;
  },

  // Создать клиента
  create: async (data: ClientCreate): Promise<Client> => {
    const response = await api.post('/clients/', data);
    return response.data;
  },

  // Обновить клиента
  update: async (id: number, data: ClientUpdate): Promise<Client> => {
    const response = await api.put(`/clients/${id}`, data);
    return response.data;
  },

  // Удалить клиента
  delete: async (id: number): Promise<void> => {
    await api.delete(`/clients/${id}`);
  },
};