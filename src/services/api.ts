import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерцептор для добавления токена
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
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Типы для API
export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  type: 'deposit' | 'withdrawal' | 'exchange';
  createdAt: string;
  updatedAt: string;
  userId: string;
  walletId: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface Wallet {
  id: string;
  name: string;
  type: 'fiat' | 'crypto';
  currency: string;
  balance: number;
  status: 'active' | 'inactive' | 'blocked';
  address?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  status: 'active' | 'inactive' | 'blocked';
  firstName?: string;
  lastName?: string;
  telegramId?: string;
  twoFactorEnabled: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  telegramUsername?: string;
}

// Интерфейсы
export interface AuthResponse {
  status: 'pending' | 'success' | 'error';
  telegramConfirmationId?: string;
  token?: string;
  user?: User;
  message?: string;
}

// API методы
export const authAPI = {
  // Инициация входа по токену
  initiateLogin: async (token: string): Promise<AuthResponse> => {
    const { data } = await api.post("/auth/login/token", { token });
    return data;
  },

  // Проверка статуса подтверждения через Telegram
  checkTelegramConfirmation: async (confirmationId: string): Promise<AuthResponse> => {
    const { data } = await api.get(`/auth/telegram/check/${confirmationId}`);
    return data;
  },

  // Выход из системы
  logout: async () => {
    const { data } = await api.post("/auth/logout");
    return data;
  },

  // Получение информации о текущем пользователе
  getCurrentUser: async (): Promise<User> => {
    const { data } = await api.get("/auth/me");
    return data;
  },

  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  register: (userData: { email: string; password: string; firstName: string; lastName: string }) =>
    api.post('/auth/register', userData),
  verify2FA: (code: string) =>
    api.post('/auth/verify-2fa', { code }),
  enable2FA: () =>
    api.post('/auth/enable-2fa'),
  disable2FA: () =>
    api.post('/auth/disable-2fa'),
};

export const transactionAPI = {
  getAll: (params?: { 
    page?: number; 
    limit?: number; 
    status?: Transaction['status'];
    type?: Transaction['type'];
    startDate?: string;
    endDate?: string;
  }) => api.get('/transactions', { params }),
  getById: (id: string) =>
    api.get(`/transactions/${id}`),
  create: (data: Partial<Transaction>) =>
    api.post('/transactions', data),
  update: (id: string, data: Partial<Transaction>) =>
    api.put(`/transactions/${id}`, data),
  cancel: (id: string) =>
    api.post(`/transactions/${id}/cancel`),
  approve: (id: string) =>
    api.post(`/transactions/${id}/approve`),
  reject: (id: string, reason: string) =>
    api.post(`/transactions/${id}/reject`, { reason }),
};

export const walletAPI = {
  getAll: () =>
    api.get('/wallets'),
  getById: (id: string) =>
    api.get(`/wallets/${id}`),
  create: (data: Partial<Wallet>) =>
    api.post('/wallets', data),
  update: (id: string, data: Partial<Wallet>) =>
    api.put(`/wallets/${id}`, data),
  delete: (id: string) =>
    api.delete(`/wallets/${id}`),
  getTransactions: (id: string, params?: { page?: number; limit?: number }) =>
    api.get(`/wallets/${id}/transactions`, { params }),
  getBalance: (id: string) =>
    api.get(`/wallets/${id}/balance`),
};

export const userAPI = {
  getCurrent: () =>
    api.get('/users/me'),
  update: (data: Partial<User>) =>
    api.put('/users/me', data),
  updatePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/users/me/password', data),
  updateNotifications: (settings: Record<string, boolean>) =>
    api.put('/users/me/notifications', settings),
};

export const statsAPI = {
  getOverview: (period: 'day' | 'week' | 'month' | 'year') =>
    api.get('/stats/overview', { params: { period } }),
  getTransactionStats: (params: {
    startDate: string;
    endDate: string;
    type?: Transaction['type'];
  }) => api.get('/stats/transactions', { params }),
  getBalanceHistory: (params: {
    walletId?: string;
    startDate: string;
    endDate: string;
  }) => api.get('/stats/balance-history', { params }),
};

export const settingsAPI = {
  getSystemSettings: () =>
    api.get('/settings/system'),
  updateSystemSettings: (settings: Record<string, any>) =>
    api.put('/settings/system', settings),
  getFees: () =>
    api.get('/settings/fees'),
  updateFees: (fees: Record<string, number>) =>
    api.put('/settings/fees', fees),
  getLimits: () =>
    api.get('/settings/limits'),
  updateLimits: (limits: Record<string, number>) =>
    api.put('/settings/limits', limits),
};

export default api; 