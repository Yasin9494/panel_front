import React from 'react';
import { Layout, Menu, Button, Space, Badge, Dropdown, Avatar } from 'antd';
import type { MenuProps } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useAuthContext } from '../contexts/AuthContext';

const { Header: AntHeader } = Layout;

interface HeaderProps {
  collapsed: boolean;
  onCollapse: (value: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ collapsed, onCollapse }) => {
  const navigate = useNavigate();
  const { logout } = useAuthContext();

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Профиль',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Настройки',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Выйти',
      onClick: () => {
        logout();
        navigate('/login');
      },
    },
  ];

  const notificationItems: MenuProps['items'] = [
    {
      key: '1',
      label: 'Новая транзакция #12345',
    },
    {
      key: '2',
      label: 'Обновление системы',
    },
  ];

  return (
    <AntHeader style={{ 
      padding: 0, 
      background: '#fff',
      position: 'fixed',
      top: 0,
      right: 0,
      left: collapsed ? 80 : 200,
      zIndex: 1000,
      transition: 'all 0.2s',
      borderBottom: '1px solid #f0f0f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '60px',
    }}>
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={() => onCollapse(!collapsed)}
        style={{
          fontSize: '16px',
          width: 60,
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      />
      
      <Space style={{ marginRight: 24 }}>
        <Dropdown menu={{ items: notificationItems }} placement="bottomRight">
          <Badge count={2} size="small">
            <Button type="text" icon={<BellOutlined />} />
          </Badge>
        </Dropdown>
        
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <Space style={{ cursor: 'pointer', padding: '0 24px' }}>
            <Avatar icon={<UserOutlined />} />
            <span style={{ display: collapsed ? 'none' : 'inline' }}>Администратор</span>
          </Space>
        </Dropdown>
      </Space>
    </AntHeader>
  );
};

export default Header;
