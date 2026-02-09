// MainLayout.jsx - improved header + sidebar visuals
import React, { useState, useEffect } from "react";
import { Layout, Button, Badge, Dropdown, Menu } from "antd";
import { useHistory } from "react-router-dom";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  BellOutlined,
} from "@ant-design/icons";
import Sidenav from "./Sidenav";
import logo from "../../assets/images/cityparkinglogo.png";
import axios from "axios";

const { Sider, Header, Content } = Layout;

const MainLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const history = useHistory();

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  // Redirect to login if no user is found
  useEffect(() => {
    if (!user) {
      localStorage.removeItem("user");
      history.push("/sign-in");
    }
  }, [user, history]);

  useEffect(() => {
    fetchExpiredApplications();
    // optionally poll or use websockets for realtime notifications
  }, []);

  const fetchExpiredApplications = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/applications");
      const data = response?.data;
      let apps = [];
      if (Array.isArray(data)) apps = data;
      else if (data?.data && Array.isArray(data.data)) apps = data.data;

      const expiredApps = apps.filter((app) => app.expiryDate && new Date(app.expiryDate) < new Date());
      setNotificationCount(expiredApps.length);
      setNotifications(expiredApps);
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  };

  const menu = (
    <Menu>
      {notifications.length === 0 ? (
        <Menu.Item disabled>No Notifications</Menu.Item>
      ) : (
        notifications.map((notification) => (
          <Menu.Item key={notification.id}>
            <div style={{ fontSize: 12 }}>
              <strong>Application ID:</strong> {notification.id} <br />
              <strong>Expiry:</strong> {new Date(notification.expiryDate).toLocaleDateString()}
            </div>
          </Menu.Item>
        ))
      )}
    </Menu>
  );

  // Prevent rendering until user verified (redirect will happen)
  if (!user) return null;

  return (
    <Layout style={{ minHeight: "100vh", background: "#0f172a" }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={220}
        style={{
          background: "#0b1220", /* softer than pure #001529 */
          boxShadow: "2px 0 8px rgba(2,6,23,0.08)",
        }}
      >
        <div style={{
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start",
          padding: collapsed ? "0" : "0 16px",
        }}>
         
        </div>

        <Sidenav color="#2563eb" collapsed={collapsed} />
      </Sider>

      <Layout>
        <Header
          style={{
            display: "flex",
            alignItems: "center",
            padding: "0 20px",
            background: "linear-gradient(90deg, #0f172a 0%, #1f2937 100%)",
            boxShadow: "0 2px 6px rgba(2,6,23,0.08)",
            zIndex: 10,
          }}
        >
          <Button
            type="text"
            onClick={() => setCollapsed(!collapsed)}
            style={{ color: "white", fontSize: 18 }}
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          />

          <div style={{ marginLeft: 12, display: "flex", alignItems: "center", gap: 12 }}>
            <img src={logo} alt="logo" style={{ width: 36, height: 36, borderRadius: 6 }} />
            <div style={{ color: "white", fontWeight: 700, letterSpacing: 0.2 }}>City Parking</div>
          </div>

          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
            <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight">
              <a onClick={(e) => e.preventDefault()}>
                <Badge count={notificationCount} offset={[0, 6]}>
                  <BellOutlined style={{ fontSize: 20, color: "white", cursor: "pointer" }} />
                </Badge>
              </a>
            </Dropdown>

            <Button
              ghost
              icon={<LogoutOutlined />}
              style={{ color: "white", borderColor: "rgba(255,255,255,0.12)" }}
              onClick={() => {
                localStorage.removeItem("user");
                history.push("/sign-in");
              }}
            >
              Log Out
            </Button>
          </div>
        </Header>

        <Content
          style={{
            margin: 24,
            padding: 24,
            minHeight: 280,
            background: "#fff",
            borderRadius: 12,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
