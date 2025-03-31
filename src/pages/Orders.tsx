import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Tag, 
  Button, 
  Space, 
  message, 
  Typography,
  Statistic,
  Row,
  Col,
  Tooltip,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  DollarOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import axios from '../api/axios';
import { useAuthContext } from '../contexts/AuthContext';

const { Title } = Typography;

interface Order {
  id: number;
  external_id: string;
  amount_rub: number;
  amount_usd: number;
  commission_usd: number;
  status: 'pending' | 'assigned' | 'processing' | 'completed' | 'failed' | 'cancelled';
  payment_confirmed_at: string | null;
  expires_at: string;
  card: {
    number: string;
    bank: string;
  };
  merchant: {
    name: string;
  };
}

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    available: 0,
    processing: 0,
    completed: 0,
    totalEarned: 0,
  });
  const { user } = useAuthContext();

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/api/trader/orders');
      setOrders(response.data.orders);
      setStats(response.data.stats);
    } catch (error) {
      message.error('Ошибка при загрузке заказов');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Обновляем список каждые 30 секунд
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleAcceptOrder = async (orderId: number) => {
    try {
      await axios.post(`/api/trader/orders/${orderId}/accept`);
      message.success('Заказ принят в обработку');
      fetchOrders();
    } catch (error) {
      message.error('Ошибка при принятии заказа');
    }
  };

  const handleConfirmPayment = async (orderId: number) => {
    try {
      await axios.post(`/api/trader/orders/${orderId}/confirm`);
      message.success('Оплата подтверждена');
      fetchOrders();
    } catch (error) {
      message.error('Ошибка при подтверждении оплаты');
    }
  };

  const getStatusTag = (status: Order['status']) => {
    const statusConfig = {
      pending: { color: 'gold', text: 'Ожидает', icon: <ClockCircleOutlined /> },
      assigned: { color: 'processing', text: 'Принят', icon: <LoadingOutlined /> },
      processing: { color: 'processing', text: 'В обработке', icon: <LoadingOutlined /> },
      completed: { color: 'success', text: 'Завершен', icon: <CheckCircleOutlined /> },
      failed: { color: 'error', text: 'Ошибка', icon: <CloseCircleOutlined /> },
      cancelled: { color: 'default', text: 'Отменен', icon: <CloseCircleOutlined /> },
    };

    const config = statusConfig[status];
    return (
      <Tag icon={config.icon} color={config.color}>
        {config.text}
      </Tag>
    );
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'external_id',
      key: 'external_id',
      width: 120,
    },
    {
      title: 'Сумма (РУБ)',
      dataIndex: 'amount_rub',
      key: 'amount_rub',
      render: (amount: number) => (
        <span style={{ fontWeight: 'bold' }}>
          ₽{amount.toFixed(2)}
        </span>
      ),
    },
    {
      title: 'Сумма (USD)',
      dataIndex: 'amount_usd',
      key: 'amount_usd',
      render: (amount: number) => (
        <span style={{ fontWeight: 'bold' }}>
          ${amount.toFixed(2)}
        </span>
      ),
    },
    {
      title: 'Комиссия',
      dataIndex: 'commission_usd',
      key: 'commission_usd',
      render: (amount: number) => (
        <span style={{ color: '#52c41a' }}>
          ${amount.toFixed(2)}
        </span>
      ),
    },
    {
      title: 'Карта',
      dataIndex: 'card',
      key: 'card',
      render: (card: Order['card']) => (
        <Tooltip title={card.bank}>
          {card.number}
        </Tooltip>
      ),
    },
    {
      title: 'Мерчант',
      dataIndex: ['merchant', 'name'],
      key: 'merchant',
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (status: Order['status']) => getStatusTag(status),
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_: any, record: Order) => {
        if (record.status === 'pending') {
          return (
            <Button 
              type="primary"
              onClick={() => handleAcceptOrder(record.id)}
            >
              Принять
            </Button>
          );
        }
        if (record.status === 'processing') {
          return (
            <Button 
              type="primary"
              onClick={() => handleConfirmPayment(record.id)}
              icon={<CheckCircleOutlined />}
            >
              Подтвердить оплату
            </Button>
          );
        }
        return null;
      },
    },
  ];

  return (
    <div>
      <Title level={2}>Заказы</Title>
      
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Доступно заказов"
              value={stats.available}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="В обработке"
              value={stats.processing}
              prefix={<LoadingOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Выполнено сегодня"
              value={stats.completed}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Заработано сегодня"
              value={stats.totalEarned}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Всего ${total} заказов`,
          }}
        />
      </Card>
    </div>
  );
};

export default Orders; 