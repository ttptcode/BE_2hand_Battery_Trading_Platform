/* eslint-disable react/prop-types */

import React, { useState } from "react";
import { Layout, Button } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';

const { Header } = Layout;
const AdminHeader = ({ collapsed, toggleCollapsed, adminUser, theme }) => {
  const isDark = theme === "dark";
  const [/* deprecatedShowReset */] = useState(false);

  const handleMenuClick = () => {
    toggleCollapsed();
  };

  return (
    <Header
      className={`
        px-4 flex items-center backdrop-blur-lg
        ${isDark 
          ? 'bg-gray-900 border-gray-700 text-gray-200' 
          : 'bg-white border-gray-200 text-gray-800'
        }
        border-b
      `}
    >
      <div className={`font-semibold ml-10 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
        Xin chào, <span className="font-bold">{adminUser?.fullName || "System Admin"} </span> !
      </div>
    </Header>
  );
};

export default AdminHeader;