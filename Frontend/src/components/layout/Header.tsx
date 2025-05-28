import React from 'react';
import { Layout, Avatar, Dropdown, Space } from 'antd';
import type { MenuProps } from 'antd';
import { User, CaretDown } from 'phosphor-react';

const { Header: AntHeader } = Layout;

export default function Header(): React.ReactNode {
  const userMenuItems: MenuProps['items'] = [
    { key: 'profile', label: 'Профиль' },
    { key: 'logout', label: 'Выйти' }
  ];
  
  return (
    <AntHeader style={{ 
      background: '#fff', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'flex-end', 
      padding: '0 16px'
    }}>
      <Dropdown menu={{ items: userMenuItems }}>
        <Space style={{ cursor: 'pointer' }}>
          <Avatar icon={<User size={16} weight="regular" />} />
          <span>Администратор</span>
          <CaretDown size={14} weight="regular" />
        </Space>
      </Dropdown>
    </AntHeader>
  );
}
