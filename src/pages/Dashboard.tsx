import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Button, Space, Statistic, Row, Col, Spin } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import axios from 'axios';

interface Request {
  id: number;
  type: 'deposit' | 'withdrawal';
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  userId: number;
}

interface RequestStats {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

const Dashboard: React.FC = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [stats, setStats] = useState<RequestStats>({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const response = await axios.get('/api/requests');
      setRequests(response.data.items);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/requests/stats');
      const statsData = response.data.stats.reduce((acc: any, curr: any) => {
        acc[curr.status] = parseInt(curr.count);
        return acc;
      }, {});
      setStats({
        pending: statsData.pending || 0,
        approved: statsData.approved || 0,
        rejected: statsData.rejected || 0,
        total: response.data.total,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchRequests(), fetchStats()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const handleStatusUpdate = async (id: number, status: 'approved' | 'rejected') => {
    try {
      await axios.patch(`/api/requests/${id}/status`, { status });
      fetchRequests();
      fetchStats();
    } catch (error) {
      console.error('Error updating request status:', error);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Тип',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === 'deposit' ? 'green' : 'red'}>
          {type === 'deposit' ? 'Пополнение' : 'Вывод'}
        </Tag>
      ),
    },
    {
      title: 'Сумма',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number, record: Request) => `${amount} ${record.currency}`,
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors = {
          pending: 'gold',
          approved: 'green',
          rejected: 'red',
        };
        const labels = {
          pending: 'Ожидает',
          approved: 'Одобрено',
          rejected: 'Отклонено',
        };
        return <Tag color={colors[status as keyof typeof colors]}>{labels[status as keyof typeof labels]}</Tag>;
      },
    },
    {
      title: 'Дата',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_: any, record: Request) => (
        record.status === 'pending' && (
          <Space>
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => handleStatusUpdate(record.id, 'approved')}
            >
              Одобрить
            </Button>
            <Button
              danger
              icon={<CloseOutlined />}
              onClick={() => handleStatusUpdate(record.id, 'rejected')}
            >
              Отклонить
            </Button>
          </Space>
        )
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Всего заявок"
              value={stats.total}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Ожидают"
              value={stats.pending}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Одобрено"
              value={stats.approved}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Отклонено"
              value={stats.rejected}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Последние заявки" style={{ marginTop: 16 }}>
        <Table
          columns={columns}
          dataSource={requests}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Всего ${total} заявок`,
          }}
        />
      </Card>
    </div>
  );
};

export default Dashboard;
