import React from "react";
import { Menu } from "antd";
import { NavLink, useLocation } from "react-router-dom";
import {
  DashboardOutlined,
  TableOutlined,
  UserOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

function Sidenav({ color }) {
  const { pathname } = useLocation();
  const page = pathname.replace("/", "");

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const role = user?.roleId;

  return (
    <Menu theme="dark" mode="inline" style={{ background: "#001529" }}>
      {/* Role 1 sidebar (Clerk) */}
      {(role === 1 || role === "1") && (
        <>
          <Menu.Item key="1" icon={<DashboardOutlined />}>
            <NavLink to="/dashboard">
              <span className="label">Dashboard</span>
            </NavLink>
          </Menu.Item>

          <Menu.Item key="8" icon={<FileTextOutlined />}>
            <NavLink to="/all-applications">
              <span className="label">View Applications</span>
            </NavLink>
          </Menu.Item>

          <Menu.Item key="3" icon={<UserOutlined />}>
            <NavLink to="/profile">
              <span className="label">Users</span>
            </NavLink>
          </Menu.Item>

          <Menu.Item key="4" icon={<FileTextOutlined />}>
            <NavLink to="/reports">
              <span className="label">Reports</span>
            </NavLink>
          </Menu.Item>

          <Menu.Item key="5" icon={<TableOutlined />}>
            <NavLink to="/renew">
              <span className="label">Application Renewal</span>
            </NavLink>
          </Menu.Item>
        </>
      )}

      {/* Role 2 sidebar (Approver) */}
      {(role === 2 || role === "2") && (
        <>
          <Menu.Item key="2" icon={<TableOutlined />}>
            <NavLink to="/tables">
              <span className="label">Approve Applications</span>
            </NavLink>
          </Menu.Item>

          <Menu.Item key="6" icon={<FileTextOutlined />}>
            <NavLink to="/reports">
              <span className="label">Reports</span>
            </NavLink>
          </Menu.Item>
        </>
      )}

      {/* Role 3 sidebar (Final Approver) */}
      {(role === 3 || role === "3") && (
        <>
          <Menu.Item key="6" icon={<FileTextOutlined />}>
            <NavLink to="/reports">
              <span className="label">Reports</span>
            </NavLink>
          </Menu.Item>

          <Menu.Item key="7" icon={<TableOutlined />}>
            <NavLink to="/finalApproval">
              <span className="label">Final Approval</span>
            </NavLink>
          </Menu.Item>
        </>
      )}
    </Menu>
  );
}

export default Sidenav;
