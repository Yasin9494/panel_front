import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Input,
  Card,
  Row,
  Col,
  message,
  Tag,
  Space,
  Select,
  Form,
  Tooltip,
  Popconfirm,
  Statistic,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  WalletOutlined,
  CopyOutlined,
  QrcodeOutlined,
  SwapOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { walletAPI, Wallet } from '../services/api';

const { Option } = Select;

const Wallets: React.FC = () => {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isTransferModalVisible, setIsTransferModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [transferForm] = Form.useForm();

  const fetchWallets = async () => {
    setLoading(true);
    try {
      const { data } = await walletAPI.getAll();
      setWallets(data);
    } catch (error) {
      message.error('Ошибка при загрузке кошельков');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  const handleAddWallet = async (values: any) => {
    try {
      await walletAPI.create(values);
      message.success('Кошелёк успешно добавлен');
      setIsModalVisible(false);
      form.resetFields();
      fetchWallets();
    } catch (error) {
      message.error('Ошибка при создании кошелька');
    }
  };

  const handleDeleteWallet = async (id: string) => {
    try {
      await walletAPI.delete(id);
      message.success('Кошелёк удалён');
      fetchWallets();
    } catch (error) {
      message.error('Ошибка при удалении кошелька');
    }
  };

  const handleTransfer = async (values: any) => {
    try {
      // Временное решение для демонстрации
      message.success('Перевод выполнен успешно');
      setIsTransferModalVisible(false);
      transferForm.resetFields();
      fetchWallets();
    } catch (error) {
      message.error('Ошибка при выполнении перевода');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success('Скопировано в буфер обмена');
  };

  const columns = [
    {
      title: 'Название',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <Space>
          <WalletOutlined />
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: 'Тип',
      dataIndex: 'type',
      key: 'type',
      render: (type: Wallet['type']) => {
        const typeLabels = {
          fiat: 'Фиат',
          crypto: 'Крипто',
        };
        return typeLabels[type];
      },
    },
    {
      title: 'Валюта',
      dataIndex: 'currency',
      key: 'currency',
    },
    {
      title: 'Адрес',
      dataIndex: 'address',
      key: 'address',
      render: (address: string) => (
        address ? (
          <Space>
            <span>{`${address.slice(0, 6)}...${address.slice(-4)}`}</span>
            <Tooltip title="Копировать адрес">
              <Button
                type="text"
                icon={<CopyOutlined />}
                onClick={() => copyToClipboard(address)}
              />
            </Tooltip>
            <Tooltip title="Показать QR-код">
              <Button
                type="text"
                icon={<QrcodeOutlined />}
                onClick={() => message.info('QR-код будет добавлен позже')}
              />
            </Tooltip>
          </Space>
        ) : '-'
      ),
    },
    {
      title: 'Баланс',
      dataIndex: 'balance',
      key: 'balance',
      render: (balance: number, record: Wallet) => (
        <span style={{ fontWeight: 'bold' }}>
          {balance.toFixed(2)} {record.currency}
        </span>
      ),
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (status: Wallet['status']) => {
        const statusColors = {
          active: 'green',
          inactive: 'orange',
          blocked: 'red',
        };
        const statusLabels = {
          active: 'Активен',
          inactive: 'Неактивен',
          blocked: 'Заблокирован',
        };
        return (
          <Tag color={statusColors[status]}>
            {statusLabels[status]}
          </Tag>
        );
      },
    },
    {
      title: 'Действия',
      key: 'action',
      render: (_: unknown, record: Wallet) => (
        <Space>
          <Tooltip title="Перевести">
            <Button
              type="primary"
              icon={<SwapOutlined />}
              onClick={() => {
                setIsTransferModalVisible(true);
                transferForm.setFieldsValue({ fromWallet: record.id });
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Удалить кошелёк?"
            description="Это действие нельзя отменить"
            icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
            onConfirm={() => handleDeleteWallet(record.id)}
          >
            <Button
              danger
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Статистика */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Всего кошельков"
              value={wallets.length}
              prefix={<WalletOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Общий баланс (USDT)"
              value={wallets.reduce((sum, wallet) => 
                wallet.currency === 'USDT' ? sum + wallet.balance : sum, 0
              )}
              precision={2}
              prefix="$"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Активные кошельки"
              value={wallets.filter(w => w.status === 'active').length}
              suffix={`/ ${wallets.length}`}
            />
          </Card>
        </Col>
      </Row>

      {/* Таблица кошельков */}
      <Card
        title="Мои кошельки"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalVisible(true)}
          >
            Добавить кошелёк
          </Button>
        }
        style={{ marginTop: 16 }}
      >
        <Table
          columns={columns}
          dataSource={wallets}
          rowKey="id"
          loading={loading}
        />
      </Card>

      {/* Модальное окно добавления кошелька */}
      <Modal
        title="Добавить кошелёк"
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
          onFinish={handleAddWallet}
        >
          <Form.Item
            name="name"
            label="Название"
            rules={[{ required: true, message: 'Введите название кошелька' }]}
          >
            <Input placeholder="Введите название кошелька" />
          </Form.Item>

          <Form.Item
            name="type"
            label="Тип"
            rules={[{ required: true, message: 'Выберите тип кошелька' }]}
          >
            <Select>
              <Option value="fiat">Фиатный</Option>
              <Option value="crypto">Криптовалютный</Option>
            </Select>
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
              <Option value="BTC">BTC</Option>
              <Option value="ETH">ETH</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="address"
            label="Адрес"
          >
            <Input placeholder="Введите адрес кошелька (для криптовалют)" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Модальное окно перевода */}
      <Modal
        title="Перевод между кошельками"
        open={isTransferModalVisible}
        onOk={() => transferForm.submit()}
        onCancel={() => {
          setIsTransferModalVisible(false);
          transferForm.resetFields();
        }}
      >
        <Form
          form={transferForm}
          layout="vertical"
          onFinish={handleTransfer}
        >
          <Form.Item
            name="fromWallet"
            label="Откуда"
            rules={[{ required: true, message: 'Выберите кошелёк отправителя' }]}
          >
            <Select>
              {wallets.map(wallet => (
                <Option key={wallet.id} value={wallet.id}>
                  {wallet.name} ({wallet.balance} {wallet.currency})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="toWallet"
            label="Куда"
            rules={[{ required: true, message: 'Выберите кошелёк получателя' }]}
          >
            <Select>
              {wallets.map(wallet => (
                <Option key={wallet.id} value={wallet.id}>
                  {wallet.name} ({wallet.currency})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="amount"
            label="Сумма"
            rules={[{ required: true, message: 'Введите сумму перевода' }]}
          >
            <Input type="number" min={0} step="0.01" placeholder="Введите сумму" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Wallets;
