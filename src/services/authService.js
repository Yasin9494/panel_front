import api, { setAuthToken } from '../api/axios';

class AuthService {
  async login(token) {
    try {
      console.log('🔑 Попытка входа с токеном:', token);
      const response = await api.post('/auth/login', { token });
      console.log('📨 Ответ от сервера при входе:', response.data);
      
      if (response.data.requiresTelegramConfirmation) {
        if (!response.data.code) {
          throw new Error('Код подтверждения не получен');
        }
        return this.waitForConfirmation(response.data.code);
      }
      
      return response.data;
    } catch (error) {
      console.error('🚫 Ошибка при входе:', error.response?.data || error.message);
      throw error;
    }
  }

  async waitForConfirmation(code) {
    console.log('⏳ Ожидание подтверждения для кода:', code);
    
    const checkStatus = async () => {
      try {
        const response = await api.post('/auth/confirm', { code });
        console.log('📡 Статус подтверждения:', response.data);

        if (response.data.token) {
          console.log('✅ Вход подтвержден');
          setAuthToken(response.data.token);
          return response.data;
        }

        // Если нет токена, продолжаем проверять
        return new Promise((resolve) => {
          setTimeout(() => resolve(checkStatus()), 2000);
        });
      } catch (error) {
        // Обрабатываем все ошибки как "код еще не подтвержден"
        if (error.response?.status === 400 || error.response?.status === 401) {
          console.log('⏳ Код еще не подтвержден, продолжаем проверять...');
          return new Promise((resolve) => {
            setTimeout(() => resolve(checkStatus()), 2000);
          });
        }
        console.error('🚫 Ошибка при проверке статуса:', error.response?.data || error.message);
        throw error;
      }
    };

    return checkStatus();
  }

  async getCurrentUser() {
    try {
      console.log('👤 Запрос информации о текущем пользователе');
      const response = await api.get('/auth/me');
      console.log('📨 Получена информация о пользователе:', response.data);
      return response.data;
    } catch (error) {
      console.error('🚫 Ошибка при получении информации о пользователе:', error.response?.data || error.message);
      throw error;
    }
  }

  logout() {
    console.log('👋 Выход из системы');
    setAuthToken(null);
    // Можно добавить дополнительную логику очистки данных
  }
}

export default new AuthService(); 