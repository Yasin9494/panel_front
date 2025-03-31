import { useState, useEffect } from 'react';
import { authAPI, userAPI, User } from '../services/api';
import { message } from 'antd';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async () => {
    try {
      const { data } = await userAPI.getCurrent();
      setUser(data);
    } catch (err) {
      setError('Ошибка загрузки пользователя');
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { data } = await authAPI.login({ email, password });
      localStorage.setItem('token', data.token);
      if (data.requires2FA) {
        return { requires2FA: true };
      }
      await loadUser();
      message.success('Успешный вход в систему');
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Ошибка входа';
      message.error(errorMessage);
      setError(errorMessage);
      return { error: errorMessage };
    }
  };

  const verify2FA = async (code: string) => {
    try {
      const { data } = await authAPI.verify2FA(code);
      localStorage.setItem('token', data.token);
      await loadUser();
      message.success('2FA верификация успешна');
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Ошибка 2FA';
      message.error(errorMessage);
      return { error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    message.success('Выход выполнен успешно');
  };

  const register = async (userData: { 
    email: string; 
    password: string; 
    firstName: string; 
    lastName: string; 
  }) => {
    try {
      await authAPI.register(userData);
      message.success('Регистрация успешна. Пожалуйста, войдите в систему.');
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Ошибка регистрации';
      message.error(errorMessage);
      return { error: errorMessage };
    }
  };

  return {
    user,
    loading,
    error,
    login,
    logout,
    register,
    verify2FA,
  };
}; 