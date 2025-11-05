import React, { useState, useEffect } from "react";
import { Layout, Button } from "antd";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../../components/Admin/Sidebar";
import AdminHeader from "../../components/Admin/Header";
import { authService } from "../../services";
import { BulbOutlined, BulbFilled } from "@ant-design/icons";
import { m } from "framer-motion";

const { Content } = Layout;

const AdminPage = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("adminTheme") || "light");
  const adminUser = JSON.parse(localStorage.getItem("adminUser"));

  useEffect(() => {
    localStorage.setItem("adminTheme", theme);
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  const handleThemeToggle = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const handleLogout = async () => {
    try {
      // Sử dụng authService để logout
      await authService.logout();
      
      // Clear tất cả localStorage
      localStorage.clear();
      
      // Navigate về trang login
      navigate("/admin/login");
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
      
      // Vẫn clear localStorage và navigate về login khi có lỗi
      localStorage.clear();
      navigate("/admin/login");
    }
  };

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  // Style cho dark/light mode
  const isDark = theme === "dark";
  const layoutStyle = {
    marginLeft: collapsed ? 50 : 250,
    transition: "all 0.2s",
    background: isDark ? "#181818" : "#f5f5f5",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
  };
  const contentStyle = {
    paddingLeft: 24,
    flex: 1,
    background: isDark ? "#111827" : "#f5f5f5",
    borderRadius: 8,
    color: isDark ? "#fff" : "#000",
    overflowY: "auto",
    height: "calc(100vh - 88px)",
    transition: "all 0.2s",
  };

  return (
    <Layout className={`h-screen overflow-hidden ${isDark ? "dark-mode" : ""}`}>
      <Sidebar
        handleLogout={handleLogout}
        collapsed={collapsed}
        toggleCollapsed={toggleCollapsed}
        theme={theme} 
      />
      <Layout style={layoutStyle}>
        <AdminHeader
          collapsed={collapsed}
          toggleCollapsed={toggleCollapsed}
          adminUser={adminUser}
          theme={theme}
          style={{
            position: "sticky",
            top: 0,
            zIndex: 1,
            width: "100%"
          }}
        />
        <div style={{ position: "absolute", top: "2%", right: "2%", zIndex: 10 }}>
          <Button
            shape="circle"
            size="large"
            onClick={handleThemeToggle}
            icon={isDark ? <BulbFilled /> : <BulbOutlined />}
            title={isDark ? "Chuyển sang Light Mode" : "Chuyển sang Dark Mode"}
          />
        </div>
        <Content style={contentStyle}>
          <Outlet context={{ theme }}/>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminPage;
