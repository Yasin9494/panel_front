import React, { useState, useEffect } from 'react';
import {
  Card,
  Tabs,
  Typography,
  Button,
  Input,
  Space,
  message,
  Alert,
  Divider,
  Tooltip,
  Switch,
} from 'antd';
import {
  CopyOutlined,
  ApiOutlined,
  CodeOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import axios from '../api/axios';
import { useAuthContext } from '../contexts/AuthContext';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;

interface ApiKeys {
  public_key: string;
  secret_key: string;
  webhook_url: string;
  is_test_mode: boolean;
}

const Integration: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    public_key: '',
    secret_key: '',
    webhook_url: '',
    is_test_mode: true,
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuthContext();

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      const response = await axios.get('/api/merchant/integration');
      setApiKeys(response.data);
    } catch (error) {
      message.error('Ошибка при загрузке данных интеграции');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success('Скопировано в буфер обмена');
  };

  const handleWebhookUrlChange = async (url: string) => {
    try {
      await axios.post('/api/merchant/integration/webhook', { url });
      message.success('URL вебхука обновлен');
      fetchApiKeys();
    } catch (error) {
      message.error('Ошибка при обновлении URL вебхука');
    }
  };

  const handleTestModeToggle = async (enabled: boolean) => {
    try {
      await axios.post('/api/merchant/integration/test-mode', { enabled });
      message.success(`Тестовый режим ${enabled ? 'включен' : 'выключен'}`);
      fetchApiKeys();
    } catch (error) {
      message.error('Ошибка при изменении режима');
    }
  };

  const handleRegenerateKeys = async () => {
    try {
      await axios.post('/api/merchant/integration/regenerate');
      message.success('Ключи успешно обновлены');
      fetchApiKeys();
    } catch (error) {
      message.error('Ошибка при обновлении ключей');
    }
  };

  return (
    <div>
      <Title level={2}>Интеграция</Title>

      <Alert
        message="Тестовый режим"
        description={
          <Space direction="vertical">
            <Text>
              В тестовом режиме все операции выполняются в песочнице. 
              Используйте этот режим для отладки интеграции.
            </Text>
            <Switch
              checked={apiKeys.is_test_mode}
              onChange={handleTestModeToggle}
              checkedChildren="Тестовый режим"
              unCheckedChildren="Боевой режим"
            />
          </Space>
        }
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Tabs defaultActiveKey="keys">
        <TabPane
          tab={
            <span>
              <ApiOutlined />
              API Ключи
            </span>
          }
          key="keys"
        >
          <Card>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <Text strong>Публичный ключ</Text>
                <Space>
                  <Input.Password
                    value={apiKeys.public_key}
                    readOnly
                    style={{ width: 400 }}
                  />
                  <Tooltip title="Скопировать">
                    <Button
                      icon={<CopyOutlined />}
                      onClick={() => handleCopy(apiKeys.public_key)}
                    />
                  </Tooltip>
                </Space>
              </div>

              <div>
                <Text strong>Секретный ключ</Text>
                <Space>
                  <Input.Password
                    value={apiKeys.secret_key}
                    readOnly
                    style={{ width: 400 }}
                  />
                  <Tooltip title="Скопировать">
                    <Button
                      icon={<CopyOutlined />}
                      onClick={() => handleCopy(apiKeys.secret_key)}
                    />
                  </Tooltip>
                </Space>
              </div>

              <Alert
                message="Важно!"
                description="Никогда не передавайте секретный ключ третьим лицам и не используйте его на клиентской стороне."
                type="warning"
                showIcon
              />

              <Button
                type="primary"
                danger
                onClick={handleRegenerateKeys}
              >
                Перегенерировать ключи
              </Button>
            </Space>
          </Card>
        </TabPane>

        <TabPane
          tab={
            <span>
              <SettingOutlined />
              Настройки вебхуков
            </span>
          }
          key="webhook"
        >
          <Card>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <Text strong>URL вебхука</Text>
                <Space>
                  <Input
                    value={apiKeys.webhook_url}
                    placeholder="https://your-domain.com/webhook"
                    style={{ width: 400 }}
                    onChange={(e) => handleWebhookUrlChange(e.target.value)}
                  />
                </Space>
              </div>

              <Alert
                message="Информация"
                description={
                  <div>
                    <p>На этот URL будут отправляться уведомления о:</p>
                    <ul>
                      <li>Новых платежах</li>
                      <li>Изменении статуса платежа</li>
                      <li>Открытии споров</li>
                      <li>Разрешении споров</li>
                    </ul>
                  </div>
                }
                type="info"
                showIcon
              />
            </Space>
          </Card>
        </TabPane>

        <TabPane
          tab={
            <span>
              <CodeOutlined />
              Документация
            </span>
          }
          key="docs"
        >
          <Card>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <Title level={4}>Быстрый старт</Title>
              <Paragraph>
                1. Добавьте наш скрипт на вашу страницу:
              </Paragraph>
              <Input.TextArea
                value={`<script src="https://api.payment-panel.com/widget.js"></script>`}
                readOnly
                autoSize
              />
              
              <Paragraph>
                2. Инициализируйте виджет:
              </Paragraph>
              <Input.TextArea
                value={`<script>
  const widget = new PaymentWidget({
    publicKey: '${apiKeys.public_key}',
    amount: 1000, // сумма в рублях
    orderId: 'ORDER-123', // ID заказа в вашей системе
  });
</script>`}
                readOnly
                autoSize
              />

              <Divider />

              <Button type="link" href="/docs" target="_blank">
                Полная документация
              </Button>
            </Space>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Integration; 