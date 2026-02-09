import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  Row,
  Col,
  Select,
  DatePicker,
  Table,
  Tag,
  Typography,
  Button,
  Empty,
  Tooltip as AntTooltip,
} from "antd";
import {
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CrownOutlined,
} from "@ant-design/icons";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { motion } from "framer-motion";
import moment from "moment";
import axios from "axios";
import CountUp from "react-countup";
import { useHistory } from "react-router-dom";
import "../assets/styles/dashboard.css";

const { Option } = Select;
const { Title } = Typography;

const STATUS_COLORS = {
  approved: "#10B981",
  pending: "#3B82F6",
  rejected: "#EF4444",
  finalapproved: "#8B5CF6",
  expired: "#F43F5E",
  dueSoon: "#F59E0B",
};

const Dashboard = () => {
  const [applications, setApplications] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [status, setStatus] = useState("All");
  const [counts, setCounts] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    finalapproved: 0,
    expired: 0,
    dueSoon: 0,
  });

  const history = useHistory();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/applications");
        let data = res.data?.data || res.data || [];
        setApplications(data);
        setFilteredData(data);
        calculateCounts(data);
      } catch (error) {
        console.error("Error fetching applications:", error);
      }
    };
    fetchApplications();
  }, []);

  const calculateCounts = (data) => {
    const normalize = (s) => (s ? s.trim().toLowerCase() : "");
    const approved = data.filter(
      (a) => normalize(a.status) === "approved"
    ).length;
    const pending = data.filter(
      (a) => normalize(a.status) === "pending"
    ).length;
    const rejected = data.filter(
      (a) => normalize(a.status) === "rejected"
    ).length;
    const finalapproved = data.filter(
      (a) =>
        normalize(a.status) === "finalapproved" ||
        normalize(a.status) === "final approved"
    ).length;

    const today = moment();
    const expired = data.filter(
      (a) => a.expiryDate && moment(a.expiryDate).isBefore(today)
    ).length;
    const dueSoon = data.filter(
      (a) =>
        a.expiryDate &&
        moment(a.expiryDate).isAfter(today) &&
        moment(a.expiryDate).isBefore(moment().add(30, "days"))
    ).length;

    setCounts({
      total: data.length,
      approved,
      pending,
      rejected,
      finalapproved,
      expired,
      dueSoon,
    });
  };

  useEffect(() => {
    const normalize = (s) => (s ? s.trim().toLowerCase() : "");
    let filtered = [...applications];

    if (status !== "All") {
      filtered = filtered.filter((a) => {
        const appStatus = normalize(a.status);
        if (status === "expired")
          return a.expiryDate && moment(a.expiryDate).isBefore(moment());
        if (status === "dueSoon")
          return (
            a.expiryDate &&
            moment(a.expiryDate).isAfter(moment()) &&
            moment(a.expiryDate).isBefore(moment().add(30, "days"))
          );
        return appStatus === normalize(status);
      });
    }

    setFilteredData(filtered);
  }, [applications, status]);

  const monthlyData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const month = moment()
        .subtract(5 - i, "months")
        .format("MMM");
      const count = filteredData.filter(
        (app) => app.createdAt && moment(app.createdAt).format("MMM") === month
      ).length;
      return { month, count };
    });
  }, [filteredData]);

  const pieData = [
    { name: "approved", label: "Approved", value: counts.approved },
    { name: "pending", label: "Pending", value: counts.pending },
    { name: "rejected", label: "Rejected", value: counts.rejected },
    {
      name: "finalapproved",
      label: "Final Approved",
      value: counts.finalapproved,
    },
    { name: "expired", label: "Expired", value: counts.expired },
    { name: "dueSoon", label: "Due for Expiry", value: counts.dueSoon },
  ];

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 80 },
    {
      title: "Applicant",
      key: "name",
      render: (_, record) =>
        `${record.salutation || ""} ${record.firstName || ""} ${
          record.lastName || ""
        }`.trim() || "-",
    },
    { title: "Vehicle Reg No", dataIndex: "vehicleRegNo", key: "vehicleRegNo" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const color = STATUS_COLORS[status?.toLowerCase()] || "#CBD5E1";
        const label =
          status?.toLowerCase() === "finalapproved"
            ? "Final Approved"
            : status || "-";
        return (
          <Tag color={color} style={{ color: "#1e293b", fontWeight: 600 }}>
            {label}
          </Tag>
        );
      },
    },
    {
      title: "Date Submitted",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => (text ? moment(text).format("YYYY-MM-DD") : "-"),
    },
  ];

  const tooltips = {
    total: "All applications submitted in the system.",
    pending: "Applications waiting for approval.",
    approved: "Applications approved by Role 2.",
    rejected: "Applications rejected by approvers.",
    finalapproved: "Applications approved by the final approver (Role 3).",
    expired: "Applications whose expiry date has already passed.",
    dueSoon: "Applications expiring within the next 30 days.",
  };

  return (
    <div className="dashboard-container">
      <Title level={3} style={{ color: "#0f172a", marginBottom: 16 }}>
        Vehicle Exemption Dashboard
      </Title>

      {/* Top bar */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Button type="primary" onClick={() => history.push("/vehicles")}>
            Create New Application
          </Button>
        </Col>
        <Col>
          <Select
            defaultValue="All"
            style={{ width: 220 }}
            onChange={setStatus}
          >
            <Option value="All">All Applications</Option>
            <Option value="approved">Approved</Option>
            <Option value="pending">Pending</Option>
            <Option value="rejected">Rejected</Option>
            <Option value="finalapproved">Final Approved</Option>
            <Option value="expired">Expired</Option>
            <Option value="dueSoon">Due for Expiry</Option>
          </Select>
        </Col>
      </Row>

      {/* Summary cards */}
      <Row gutter={[24, 24]} justify="start" style={{ marginBottom: 24 }}>
        {/* Row 1 */}
        {[
          {
            title: "Total Applications",
            value: counts.total,
            color: "#FBBF24",
            icon: <FileTextOutlined />,
            key: "total",
          },
          {
            title: "Pending",
            value: counts.pending,
            color: "#3B82F6",
            icon: <ClockCircleOutlined />,
            key: "pending",
          },
          {
            title: "Approved",
            value: counts.approved,
            color: "#10B981",
            icon: <CheckCircleOutlined />,
            key: "approved",
          },
          {
            title: "Rejected",
            value: counts.rejected,
            color: "#EF4444",
            icon: <CloseCircleOutlined />,
            key: "rejected",
          },
        ].map((card, idx) => (
          <Col key={idx} xs={24} sm={12} md={12} lg={6}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
            >
              <AntTooltip title={tooltips[card.key]} placement="top">
                <Card
                  bordered={false}
                  className="summary-card"
                  style={{ background: card.color }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <div
                      style={{
                        background: "rgba(255,255,255,0.8)",
                        padding: 10,
                        borderRadius: 8,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {card.icon}
                    </div>
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontWeight: 600 }}>{card.title}</div>
                      <div style={{ fontSize: 20 }}>
                        <CountUp
                          end={card.value}
                          duration={1.3}
                          separator=","
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </AntTooltip>
            </motion.div>
          </Col>
        ))}
      </Row>

      <Row gutter={[24, 24]} justify="start" style={{ marginBottom: 40 }}>
        {/* Row 2 */}
        {[
          {
            title: "Final Approved",
            value: counts.finalapproved,
            color: "#8B5CF6",
            icon: <CrownOutlined />,
            key: "finalapproved",
          },
          {
            title: "Expired",
            value: counts.expired,
            color: "#F43F5E",
            icon: <CloseCircleOutlined />,
            key: "expired",
          },
          {
            title: "Due for Expiry",
            value: counts.dueSoon,
            color: "#F59E0B",
            icon: <ClockCircleOutlined />,
            key: "dueSoon",
          },
        ].map((card, idx) => (
          <Col key={idx} xs={24} sm={12} md={12} lg={6}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
            >
              <AntTooltip title={tooltips[card.key]} placement="top">
                <Card
                  bordered={false}
                  className="summary-card"
                  style={{ background: card.color }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <div
                      style={{
                        background: "rgba(255,255,255,0.8)",
                        padding: 10,
                        borderRadius: 8,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {card.icon}
                    </div>
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontWeight: 600 }}>{card.title}</div>
                      <div style={{ fontSize: 20 }}>
                        <CountUp
                          end={card.value}
                          duration={1.3}
                          separator=","
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </AntTooltip>
            </motion.div>
          </Col>
        ))}
      </Row>

      {/* Charts */}
      <Row gutter={[24, 24]}>
        <Col xs={24} md={16}>
          <Card
            title="Applications (Last 6 Months)"
            style={{ borderRadius: 12 }}
          >
            {monthlyData.length === 0 ? (
              <Empty description="No data" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="count"
                    fill="#3B82F6"
                    animationDuration={1000}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card
            title="Application Status Breakdown"
            style={{ borderRadius: 12 }}
          >
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="label"
                  outerRadius={90}
                  label
                  animationDuration={900}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={STATUS_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            {/* Color-coded legend below pie chart */}
            <div className="legend-row">
              {pieData.map((entry, i) => (
                <div
                  key={i}
                  style={{ display: "flex", alignItems: "center", gap: 6 }}
                >
                  <span
                    className="legend-color"
                    style={{ backgroundColor: STATUS_COLORS[entry.name] }}
                  ></span>
                  <span className="legend-label">{entry.label}</span>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Applications Table */}
      <Card
        title="Applications List"
        style={{ marginTop: 40, borderRadius: 12 }}
        bodyStyle={{ padding: 0 }}
      >
        <Table
          dataSource={filteredData}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default Dashboard;
