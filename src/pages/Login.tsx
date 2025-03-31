import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Alert, Result } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import authService from '../services/authService';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [confirmationId, setConfirmationId] = useState<string | null>(null);

  const handleSubmit = async (values: { token: string }) => {
    try {
      setLoading(true);
      console.log('🎯 Начало процесса входа');
      const result = await authService.login(values.token);
      console.log('📦 Результат входа:', result);

      if (result.token && result.user) {
        console.log('🎉 Успешный вход, сохранение данных');
        await login(result.token, result.user);
        message.success('Вход выполнен успешно');
        navigate('/dashboard');
      } else {
        message.error('Неожиданный ответ от сервера');
      }
    } catch (error: any) {
      console.error('💥 Ошибка при входе:', error);
      message.error(error.response?.data?.error || 'Ошибка при входе');
    } finally {
      setLoading(false);
    }
  };

  // Если ожидаем подтверждение через Telegram
  if (confirmationId) {
    return (
      <div style={{ 
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#f0f2f5'
      }}>
        <Result
          status="info"
          title="Подтверждение через Telegram"
          subTitle="Пожалуйста, подтвердите вход в вашем Telegram"
          extra={[
            <Button 
              key="cancel" 
              onClick={() => {
                console.log('🚫 Отмена процесса входа');
                setConfirmationId(null);
              }}
            >
              Отменить
            </Button>
          ]}
        />
      </div>
    );
  }

  return (
    <div style={{ 
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#f0f2f5'
    }}>
      <Card 
        title="Вход в систему" 
        style={{ 
          width: 400,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}
      >
        <Form
          name="login"
          onFinish={handleSubmit}
          layout="vertical"
        >
          <Form.Item
            name="token"
            label="Токен доступа"
            rules={[
              { required: true, message: 'Пожалуйста, введите токен' },
              { min: 32, message: 'Токен должен содержать минимум 32 символа' }
            ]}
          >
            <Input.Password 
              placeholder="Введите ваш токен доступа" 
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              block
              size="large"
            >
              Войти
            </Button>
          </Form.Item>

          <Alert
            message="Важно"
            description="После ввода токена вам потребуется подтвердить вход через Telegram"
            type="info"
            showIcon
          />
        </Form>
      </Card>
    </div>
  );
};

export default Login; 