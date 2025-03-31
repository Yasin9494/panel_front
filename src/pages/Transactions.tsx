import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Card, 
  Button, 
  Space, 
  Tag, 
  DatePicker, 
  Select, 
  Input,
  Modal,
  Form,
  InputNumber,
  message,
} from 'antd';
import type { TablePaginationConfig } from 'antd/es/table';
import type { FilterValue, SorterResult } from 'antd/es/table/interface';
import {
  PlusOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { transactionAPI, Transaction } from '../services/api';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface TableParams {
  pagination?: TablePaginationConfig;
  sortField?: string;
  sortOrder?: string;
  filters?: Record<string, FilterValue | null>;
}

const statusColors = {
  pending: 'orange',
  processing: 'blue',
  completed: 'green',
  failed: 'red',
  cancelled: 'gray',
};

const statusIcons = {
  pending: <ClockCircleOutlined />,
  processing: <SyncOutlined spin />,
  completed: <CheckCircleOutlined />,
  failed: <CloseCircleOutlined />,
  cancelled: <CloseCircleOutlined />,
};

const Transactions: React.FC = () => {
  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 10,
    },
  });
  const [filters, setFilters] = useState({
    status: undefined as Transaction['status'] | undefined,
    type: undefined as Transaction['type'] | undefined,
    dateRange: undefined as [string, string] | undefined,
    search: '',
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: response } = await transactionAPI.getAll({
        page: tableParams.pagination?.current,
        limit: tableParams.pagination?.pageSize,
        status: filters.status,
        type: filters.type,
        startDate: filters.dateRange?.[0],
        endDate: filters.dateRange?.[1],
      });
      setData(response.items);
      setTableParams({
        ...tableParams,
        pagination: {
          ...tableParams.pagination,
          total: response.total,
        },
      });
    } catch (error) {
      message.error('Ошибка при загрузке транзакций');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [JSON.stringify(tableParams), JSON.stringify(filters)]);

  const handleTableChange = (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<Transaction> | SorterResult<Transaction>[],
  ) => {
    const params: TableParams = {
      pagination,
      filters,
    };

    if (!Array.isArray(sorter) && sorter.field && sorter.order) {
      params.sortField = sorter.field.toString();
      params.sortOrder = sorter.order;
    }

    setTableParams(params);
  };

  const handleCreateTransaction = async (values: any) => {
    try {
      await transactionAPI.create(values);
      message.success('Транзакция создана успешно');
      setIsModalVisible(false);
      form.resetFields();
      fetchData();
    } catch (error) {
      message.error('Ошибка при создании транзакции');
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 200,
      render: (text: string) => <a>{text}</a>,
    },
    {
      title: 'Тип',
      dataIndex: 'type',
      width: 120,
      render: (type: Transaction['type']) => {
        const typeLabels = {
          deposit: 'Пополнение',
          withdrawal: 'Вывод',
          exchange: 'Обмен',
        };
        return typeLabels[type];
      },
    },
    {
      title: 'Сумма',
      dataIndex: 'amount',
      width: 120,
      render: (amount: number, record: Transaction) => (
        <span style={{ 
          color: record.type === 'withdrawal' ? '#ff4d4f' : '#52c41a',
          fontWeight: 'bold',
        }}>
          {record.type === 'withdrawal' ? '-' : '+'}{amount} {record.currency}
        </span>
      ),
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      width: 150,
      render: (status: Transaction['status']) => (
        <Tag icon={statusIcons[status]} color={statusColors[status]}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Дата создания',
      dataIndex: 'createdAt',
      width: 200,
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: 'Действия',
      key: 'action',
      width: 200,
      render: (_: unknown, record: Transaction) => (
        <Space size="middle">
          {record.status === 'pending' && (
            <>
              <Button 
                type="primary" 
                size="small"
                onClick={() => transactionAPI.approve(record.id)}
              >
                Подтвердить
              </Button>
              <Button 
                danger 
                size="small"
                onClick={() => transactionAPI.reject(record.id, 'Отклонено оператором')}
              >
                Отклонить
              </Button>
            </>
          )}
          {record.status === 'processing' && (
            <Button 
              type="primary" 
              size="small"
              onClick={() => transactionAPI.approve(record.id)}
            >
              Завершить
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card title="Транзакции" extra={
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
        >
          Создать транзакцию
        </Button>
      }>
        {/* Фильтры */}
        <Space style={{ marginBottom: 16 }}>
          <Select
            style={{ width: 200 }}
            placeholder="Статус"
            allowClear
            onChange={(value) => setFilters({ ...filters, status: value })}
          >
            <Option value="pending">Ожидает</Option>
            <Option value="processing">В обработке</Option>
            <Option value="completed">Завершено</Option>
            <Option value="failed">Ошибка</Option>
            <Option value="cancelled">Отменено</Option>
          </Select>

          <Select
            style={{ width: 200 }}
            placeholder="Тип"
            allowClear
            onChange={(value) => setFilters({ ...filters, type: value })}
          >
            <Option value="deposit">Пополнение</Option>
            <Option value="withdrawal">Вывод</Option>
            <Option value="exchange">Обмен</Option>
          </Select>

          <RangePicker
            onChange={(dates) => {
              if (dates) {
                setFilters({
                  ...filters,
                  dateRange: [
                    dates[0]?.toISOString() || '',
                    dates[1]?.toISOString() || '',
                  ],
                });
              } else {
                setFilters({ ...filters, dateRange: undefined });
              }
            }}
          />

          <Input
            placeholder="Поиск по ID"
            prefix={<SearchOutlined />}
            style={{ width: 200 }}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </Space>

        <Table
          columns={columns}
          rowKey="id"
          dataSource={data}
          pagination={tableParams.pagination}
          loading={loading}
          onChange={handleTableChange}
        />
      </Card>

      <Modal
        title="Создать транзакцию"
        open={isModalVisible}
        onOk={() => form.submit()}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateTransaction}
        >
          <Form.Item
            name="type"
            label="Тип транзакции"
            rules={[{ required: true, message: 'Выберите тип транзакции' }]}
          >
            <Select>
              <Option value="deposit">Пополнение</Option>
              <Option value="withdrawal">Вывод</Option>
              <Option value="exchange">Обмен</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="amount"
            label="Сумма"
            rules={[{ required: true, message: 'Введите сумму' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              precision={2}
              placeholder="Введите сумму"
            />
          </Form.Item>

          <Form.Item
            name="currency"
            label="Валюта"
            rules={[{ required: true, message: 'Выберите валюту' }]}
          >
            <Select>
              <Option value="USD">USD</Option>
              <Option value="EUR">EUR</Option>
              <Option value="RUB">RUB</Option>
              <Option value="USDT">USDT</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="Описание"
          >
            <Input.TextArea rows={4} placeholder="Введите описание транзакции" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Transactions; 