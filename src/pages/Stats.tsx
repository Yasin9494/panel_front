import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Select, 
  DatePicker, 
  Statistic, 
  Spin,
  Empty,
  message,
} from 'antd';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  SwapOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { statsAPI } from '../services/api';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface StatsData {
  totalVolume: number;
  totalTransactions: number;
  averageAmount: number;
  successRate: number;
  volumeByType: {
    deposit: number;
    withdrawal: number;
    exchange: number;
  };
  transactionsByStatus: {
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    cancelled: number;
  };
  chartData: Array<{
    date: string;
    volume: number;
    transactions: number;
  }>;
}

const Stats: React.FC = () => {
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('week');
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<StatsData | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data: response } = await statsAPI.getOverview(period);
      setData(response);
    } catch (error) {
      message.error('Ошибка при загрузке статистики');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [period]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!data) {
    return <Empty description="Нет данных" />;
  }

  return (
    <div>
      {/* Фильтры */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col>
            <Select
              value={period}
              onChange={setPeriod}
              style={{ width: 200 }}
            >
              <Option value="day">За день</Option>
              <Option value="week">За неделю</Option>
              <Option value="month">За месяц</Option>
              <Option value="year">За год</Option>
            </Select>
          </Col>
          <Col>
            <RangePicker
              onChange={(dates) => {
                if (dates) {
                  setDateRange([
                    dates[0]?.toISOString() || '',
                    dates[1]?.toISOString() || '',
                  ]);
                } else {
                  setDateRange(null);
                }
              }}
            />
          </Col>
        </Row>
      </Card>

      {/* Основные показатели */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Общий объем"
              value={data.totalVolume}
              precision={2}
              prefix={<DollarOutlined />}
              suffix="USDT"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Всего транзакций"
              value={data.totalTransactions}
              prefix={<SwapOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Средняя сумма"
              value={data.averageAmount}
              precision={2}
              prefix={<DollarOutlined />}
              suffix="USDT"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Успешность"
              value={data.successRate}
              precision={2}
              prefix={data.successRate >= 95 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              suffix="%"
              valueStyle={{ color: data.successRate >= 95 ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Графики */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Объем транзакций по типу">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { name: 'Пополнение', value: data.volumeByType.deposit },
                { name: 'Вывод', value: data.volumeByType.withdrawal },
                { name: 'Обмен', value: data.volumeByType.exchange },
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" name="Объем (USDT)" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Статус транзакций">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { name: 'Ожидает', value: data.transactionsByStatus.pending },
                { name: 'В обработке', value: data.transactionsByStatus.processing },
                { name: 'Завершено', value: data.transactionsByStatus.completed },
                { name: 'Ошибка', value: data.transactionsByStatus.failed },
                { name: 'Отменено', value: data.transactionsByStatus.cancelled },
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#82ca9d" name="Количество" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* График динамики */}
      <Card title="Динамика транзакций" style={{ marginTop: 24 }}>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data.chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="volume"
              stroke="#8884d8"
              name="Объем (USDT)"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="transactions"
              stroke="#82ca9d"
              name="Количество транзакций"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

export default Stats;
