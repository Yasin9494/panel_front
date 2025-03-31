import React, { useState } from 'react';
import { Card, Input, Button, Switch, Form, message, Modal } from 'antd';
import { CopyOutlined, EditOutlined } from '@ant-design/icons';

const Settings: React.FC = () => {
  const [form] = Form.useForm();
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    telegram: true,
  });

  // Telegram ID state
  const [telegramId, setTelegramId] = useState('@ivan123'); // Текущий Telegram ID
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTelegramId, setNewTelegramId] = useState('');
  const [confirmKey, setConfirmKey] = useState('');

  // Функция генерации ключа подтверждения
  const generateConfirmKey = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  // Открытие попапа смены Telegram ID
  const showTelegramModal = () => {
    const key = generateConfirmKey();
    setConfirmKey(key);
    setIsModalOpen(true);
  };

  // Закрытие попапа
  const handleCancel = () => {
    setIsModalOpen(false);
    setNewTelegramId('');
    setConfirmKey('');
  };

  // Сохранение Telegram ID (должно быть подтверждено через бота)
  const handleConfirmTelegramId = () => {
    if (!newTelegramId) {
      message.warning('Введите новый Telegram ID!');
      return;
    }
    message.info(`Отправьте в бота ключ: ${confirmKey}`);
    handleCancel();
  };

  // Сохранение настроек
  const handleSave = (values: any) => {
    console.log('Сохранённые данные:', values, { twoFAEnabled, notifications });
    message.success('Настройки успешно сохранены!');
  };

  return (
    <div style={{ padding: '10px 20px', marginTop: '60px', maxWidth: '600px', margin: 'auto' }}>
      <Card title="Настройки профиля">
        <Form form={form} layout="vertical" onFinish={handleSave}>
          {/* Основные настройки */}
          <Form.Item label="Имя" name="name" initialValue="Иван Иванов">
            <Input placeholder="Введите ваше имя" />
          </Form.Item>
          <Form.Item label="Email" name="email" initialValue="ivan@example.com">
            <Input type="email" placeholder="Введите email" />
          </Form.Item>

          {/* Telegram ID */}
          <Card title="Привязка Telegram">
            <p>Текущий Telegram ID: <strong>{telegramId}</strong></p>
            <Button type="primary" icon={<EditOutlined />} onClick={showTelegramModal}>
              Изменить Telegram ID
            </Button>
            <p style={{ marginTop: '10px', fontSize: '14px', color: 'gray' }}>
              Чтобы сменить ID, введите новый Telegram ID, после чего в боте отправьте сгенерированный ключ.
            </p>
          </Card>

          {/* Безопасность */}
          <Card title="Безопасность" style={{ marginTop: '15px' }}>
            <p>Двухфакторная аутентификация (2FA):</p>
            <Switch checked={twoFAEnabled} onChange={setTwoFAEnabled} />
          </Card>

          {/* Уведомления */}
          <Card title="Настройки уведомлений" style={{ marginTop: '15px' }}>
            <p>Email уведомления:</p>
            <Switch checked={notifications.email} onChange={(checked) => setNotifications({ ...notifications, email: checked })} />
            <p>SMS уведомления:</p>
            <Switch checked={notifications.sms} onChange={(checked) => setNotifications({ ...notifications, sms: checked })} />
            <p>Telegram уведомления:</p>
            <Switch checked={notifications.telegram} onChange={(checked) => setNotifications({ ...notifications, telegram: checked })} />
          </Card>

          <Button type="primary" htmlType="submit" style={{ marginTop: '15px' }}>
            Сохранить изменения
          </Button>
        </Form>
      </Card>

      {/* Попап смены Telegram ID */}
      <Modal title="Изменение Telegram ID" open={isModalOpen} onOk={handleConfirmTelegramId} onCancel={handleCancel}>
        <Input 
          placeholder="Введите новый Telegram ID" 
          style={{ marginBottom: '10px' }} 
          value={newTelegramId} 
          onChange={(e) => setNewTelegramId(e.target.value)} 
        />
        {confirmKey && (
          <div>
            <p>Отправьте этот ключ в бота:</p>
            <Input value={confirmKey} readOnly />
            <Button 
              icon={<CopyOutlined />} 
              style={{ marginTop: '5px' }} 
              onClick={() => {
                navigator.clipboard.writeText(confirmKey);
                message.success('Ключ скопирован!');
              }}
            >
              Копировать ключ
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Settings;
