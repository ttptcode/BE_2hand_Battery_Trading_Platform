/* eslint-disable react/prop-types */

import { Layout, Menu } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LineChartOutlined,
  LogoutOutlined,
  CalendarOutlined,
  BranchesOutlined,
  CaretRightOutlined,
  CaretLeftOutlined,
  DollarOutlined
} from "@ant-design/icons";
import { useState, useEffect } from "react";

const { Sider } = Layout;

const Sidebar = ({ collapsed, toggleCollapsed, theme }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeKey, setActiveKey] = useState(location.pathname);

  // Lấy thông tin admin từ localStorage
  const adminUser = JSON.parse(localStorage.getItem("adminUser"));
  const userRole = adminUser?.role || "Admin";

  useEffect(() => {
    setActiveKey(location.pathname);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("adminUser");
    navigate("/admin/login");
  };

  // Menu items cho admin (có tất cả quyền)
  const adminMenuItems = [
    {
      key: "/admin",
      icon: <LineChartOutlined className="text-lg" />,
      label: <Link to="/admin" className="text-inherit hover:text-inherit">Dashboard</Link>,
    },
    {
      key: "/admin/PaymentsManagement",
      icon: <DollarOutlined className="text-lg" />,
      label: <Link to="/admin/PaymentsManagement" className="text-inherit hover:text-inherit">Quản lý doanh thu</Link>,
    },
    {
      key: "/admin/plans",
      icon: <CalendarOutlined className="text-lg" />,
      label: <Link to="/admin/plans" className="text-inherit hover:text-inherit">Quản lý Gói</Link>,
    },
    {
      key: "/admin/item-types",
      icon: <BranchesOutlined className="text-lg" />,
      label: <Link to="/admin/item-types" className="text-inherit hover:text-inherit">Quản lý Loại Sản Phẩm</Link>,
    },
    {
      key: "logout",
      icon: <LogoutOutlined className="text-lg" />,
      label: "Đăng xuất",
      danger: true,
      onClick: handleLogout,
    },
  ];

  // Menu items cho các role khác (không phải admin)
  const otherRoleMenuItems = [
    {
      key: "logout",
      icon: <LogoutOutlined className="text-lg" />,
      label: "Đăng xuất",
      danger: true,
      onClick: handleLogout,
    },
  ];

  // Chọn menu items dựa trên role
  const menuItems = userRole === "Admin" ? adminMenuItems : otherRoleMenuItems;

  const isDark = theme === "dark";

  return (
    <div className="relative">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={280}
        className={`
          fixed left-0 top-0 h-screen z-50 shadow-xl transition-all duration-300 ease-in-out
          border-r
          ${isDark 
            ? 'bg-gray-900 border-gray-700' 
            : 'bg-white border-gray-200'
          }
        `}
      >
        {/* Logo Section */}
        <div 
          className={`
            p-5 border-b transition-all duration-300
            ${isDark 
              ? 'border-gray-700 bg-gray-800' 
              : 'border-gray-200 bg-gray-50'
            }
          `}
        >
          <div className={`transition-all duration-300 ${collapsed ? "w-12 h-12 mx-auto" : "w-full"}`}>
            {collapsed ? (
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 border-2 border-white/10">
                <span className="text-xl font-bold text-white">E</span>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br from-blue-500 to-blue-600">
                  <span className="text-lg font-bold text-white">E</span>
                </div>
                <div>
                  <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-blue-600'}`}>
                    EV Trading
                  </div>
                  <div className={`
                    text-xs font-medium mt-1 px-2 py-1 rounded-full text-center
                    ${isDark 
                      ? 'bg-blue-500/20 text-blue-300' 
                      : 'bg-blue-100 text-blue-600'
                    }
                  `}>
                    {userRole === "Admin" ? "Quản trị viên" : userRole}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="h-[calc(100vh-80px)] overflow-auto custom-scrollbar">
          <Menu
            theme={isDark ? "dark" : "light"}
            mode="inline"
            selectedKeys={[activeKey]}
            items={menuItems}
            className={`
              border-0 bg-transparent font-medium text-[15px] p-2
              [&_.ant-menu-item]:rounded-xl
              [&_.ant-menu-item]:mx-2
              [&_.ant-menu-item]:my-1
              [&_.ant-menu-item]:h-12
              [&_.ant-menu-item]:flex
              [&_.ant-menu-item]:items-center
              [&_.ant-menu-item]:transition-all
              [&_.ant-menu-item]:duration-200
              [&_.ant-menu-item]:ease-out
              
              /* Light theme */
              ${!isDark && `
                [&_.ant-menu-item:not(.ant-menu-item-selected):hover]:bg-blue-50
                [&_.ant-menu-item:not(.ant-menu-item-selected):hover]:translate-x-1
                [&_.ant-menu-item-selected]:bg-blue-50/60
                [&_.ant-menu-item-selected]:border-l-2
                [&_.ant-menu-item-selected]:border-l-blue-500
                [&_.ant-menu-item-selected]:text-blue-600
                [&_.ant-menu-item-selected]:font-semibold
              `}
              
              /* Dark theme */
              ${isDark && `
                [&_.ant-menu-item:not(.ant-menu-item-selected):hover]:bg-blue-500/20
                [&_.ant-menu-item:not(.ant-menu-item-selected):hover]:translate-x-1
                [&_.ant-menu-item-selected]:bg-blue-500/10
                [&_.ant-menu-item-selected]:border-l-2
                [&_.ant-menu-item-selected]:border-l-blue-500
                [&_.ant-menu-item-selected]:text-blue-400
                [&_.ant-menu-item-selected]:font-semibibold
              `}
              
              /* Logout item */
              [&_.ant-menu-item:last-child]:mt-auto
              [&_.ant-menu-item-dangerous:hover]:bg-red-500
              [&_.ant-menu-item-dangerous:hover]:text-white
            `}
          />
        </div>

        {/* Collapse Toggle Button */}
        <div className="absolute -right-3 top-20 z-10 transition-all duration-300">
          <button
            onClick={toggleCollapsed}
            className="
              w-6 h-6 rounded-full flex items-center justify-center shadow-lg border-0 cursor-pointer 
              transition-all duration-200 hover:scale-110 bg-blue-500 text-white text-xs
              hover:bg-blue-600 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            "
          >
            {collapsed ? <CaretRightOutlined /> : <CaretLeftOutlined />}
          </button>
        </div>
      </Sider>
    </div>
  );
};

export default Sidebar;