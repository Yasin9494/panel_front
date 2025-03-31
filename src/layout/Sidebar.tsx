import React from 'react';
import { Layout, Menu, theme } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import {
  DashboardOutlined,
  SwapOutlined,
  BarChartOutlined,
  SettingOutlined,
  UserOutlined,
  WalletOutlined,
  TeamOutlined,
  ApiOutlined,
  ShopOutlined,
  SafetyCertificateOutlined,
  DislikeOutlined,
  BankOutlined,
  CodeOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
}

// Определяем пункты меню для каждой роли
const getMenuItems = (role: string) => {
  // Специфичные пункты для каждой роли
  const roleSpecificItems = {
    admin: [
      {
        key: '/dashboard',
        icon: <DashboardOutlined />,
        label: 'Дашборд',
      },
      {
        key: '/transactions',
        icon: <SwapOutlined />,
        label: 'Транзакции',
      },
      {
        key: '/merchants',
        icon: <ShopOutlined />,
        label: 'Мерчанты',
      },
      {
        key: '/traders',
        icon: <TeamOutlined />,
        label: 'Трейдеры',
      },
      {
        key: '/disputes',
        icon: <DislikeOutlined />,
        label: 'Споры',
      },
      {
        key: '/stats',
        icon: <BarChartOutlined />,
        label: 'Статистика',
      },
      {
        key: '/users',
        icon: <UserOutlined />,
        label: 'Пользователи',
      },
      {
        key: '/security',
        icon: <SafetyCertificateOutlined />,
        label: 'Безопасность',
      },
      {
        key: '/settings',
        icon: <SettingOutlined />,
        label: 'Настройки',
      },
    ],
    manager: [
      {
        key: '/dashboard',
        icon: <DashboardOutlined />,
        label: 'Дашборд',
      },
      {
        key: '/transactions',
        icon: <SwapOutlined />,
        label: 'Транзакции',
      },
      {
        key: '/merchants',
        icon: <ShopOutlined />,
        label: 'Мерчанты',
      },
      {
        key: '/traders',
        icon: <TeamOutlined />,
        label: 'Трейдеры',
      },
      {
        key: '/disputes',
        icon: <DislikeOutlined />,
        label: 'Споры',
      },
      {
        key: '/stats',
        icon: <BarChartOutlined />,
        label: 'Статистика',
      },
    ],
    merchant: [
      {
        key: '/dashboard',
        icon: <DashboardOutlined />,
        label: 'Дашборд',
      },
      {
        key: '/transactions',
        icon: <SwapOutlined />,
        label: 'Транзакции',
      },
      {
        key: '/integration',
        icon: <CodeOutlined />,
        label: 'Интеграция',
      },
      {
        key: '/widget',
        icon: <ApiOutlined />,
        label: 'Виджет',
      },
      {
        key: '/disputes',
        icon: <DislikeOutlined />,
        label: 'Споры',
      },
      {
        key: '/balance',
        icon: <WalletOutlined />,
        label: 'Баланс',
      },
      {
        key: '/withdrawals',
        icon: <BankOutlined />,
        label: 'Выводы',
      },
      {
        key: '/settings',
        icon: <SettingOutlined />,
        label: 'Настройки',
      },
    ],
    trader: [
      {
        key: '/dashboard',
        icon: <DashboardOutlined />,
        label: 'Дашборд',
      },
      {
        key: '/orders',
        icon: <ShopOutlined />,
        label: 'Заказы',
      },
      {
        key: '/disputes',
        icon: <DislikeOutlined />,
        label: 'Споры',
      },
      {
        key: '/balance',
        icon: <WalletOutlined />,
        label: 'Баланс',
      },
      {
        key: '/cards',
        icon: <BankOutlined />,
        label: 'Карты',
      },
      {
        key: '/settings',
        icon: <SettingOutlined />,
        label: 'Настройки',
      },
    ],
  };

  return roleSpecificItems[role as keyof typeof roleSpecificItems] || [];
};

const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthContext();
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const menuItems = getMenuItems(user?.role || '');

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        background: colorBgContainer,
        borderRight: '1px solid #f0f0f0',
      }}
    >
      <div style={{ 
        height: '60px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        borderBottom: '1px solid #f0f0f0',
        background: '#fff',
        padding: '0 16px'
      }}>
        <h2 style={{ 
          margin: 0, 
          fontSize: collapsed ? '16px' : '18px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {collapsed ? 'PP' : 'Processing Panel'}
        </h2>
      </div>
      <Menu
        theme="light"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
        style={{
          borderRight: 0,
        }}
      />
    </Sider>
  );
};

export default Sidebar;
