import React, { useEffect, useState } from "react";
import {
  Button,
  Table,
  Typography,
  message,
  Modal,
  Row,
  Col,
  Input,
  Select,
  Tag,
  Tooltip,
} from "antd";
import axios from "axios";
import { useHistory } from "react-router-dom";
import moment from "moment";

const { Option } = Select;

/* 🔥 SAME STATUS COLORS AS DASHBOARD */
const STATUS_COLORS = {
  approved: "#10B981",
  pending: "#3B82F6",
  rejected: "#EF4444",
  finalapproved: "#8B5CF6",
  expired: "#F43F5E",
  dueSoon: "#F59E0B",
};

const ViewApplications = () => {
  const [applications, setApplications] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [sortOrder, setSortOrder] = useState("descend");

  const history = useHistory();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/applications"
      );

      if (response.data.status) {
        const data = response.data.data;
        setApplications(data);
        applyFilters(data, searchText, sortOrder);
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      message.error("Failed to fetch applications.");
    }
  };

  const handleCreateApplicationClick = () => {
    history.push("/vehicles");
  };

  const handleRowClick = (application) => {
    setSelectedApplication(application);
  };

  const handleCloseApplicationDetails = () => {
    setSelectedApplication(null);
  };

  const handleSearch = (value) => {
    setSearchText(value);
    applyFilters(applications, value, sortOrder);
  };

  const handleSortOrderChange = (value) => {
    const order = value === "asc" ? "ascend" : "descend";
    setSortOrder(order);
    applyFilters(applications, searchText, order);
  };

  const applyFilters = (data, search, order) => {
    let filtered = [...data];

    if (search) {
      filtered = filtered.filter((app) =>
        [app.firstName, app.lastName, app.vehicleRegNo, app.cell]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(search.toLowerCase()))
      );
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return order === "ascend" ? dateA - dateB : dateB - dateA;
    });

    setFilteredData(filtered);
  };

  /* ✅ UNIFORM STATUS TAG (MATCHES DASHBOARD) */
  const renderStatusTag = (status) => {
    const normalized = status?.toLowerCase();
    const color = STATUS_COLORS[normalized] || "#CBD5E1";

    const label =
      normalized === "finalapproved" ? "Final Approved" : status || "-";

    return (
      <Tag color={color} style={{ color: "#1e293b", fontWeight: 600 }}>
        {label}
      </Tag>
    );
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 70,
      align: "center",
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "Applicant",
      key: "name",
      width: 220,
      ellipsis: true,
      render: (_, record) => {
        const name = `${record.salutation || ""} ${record.firstName || ""} ${
          record.lastName || ""
        }`.trim();

        return (
          <Tooltip title={name}>
            <span>{name || "-"}</span>
          </Tooltip>
        );
      },
    },
    {
      title: "Vehicle Reg No",
      dataIndex: "vehicleRegNo",
      key: "vehicleRegNo",
      width: 160,
      ellipsis: true,
      sorter: (a, b) =>
        (a.vehicleRegNo || "").localeCompare(b.vehicleRegNo || ""),
      render: (text) => (
        <Tooltip title={text}>
          <span>{text || "-"}</span>
        </Tooltip>
      ),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: 160,
      ellipsis: true,
      sorter: (a, b) => (a.type || "").localeCompare(b.type || ""),
      render: (text) => (
        <Tooltip title={text}>
          <span>{text || "-"}</span>
        </Tooltip>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 150,
      align: "center",
      sorter: (a, b) => (a.status || "").localeCompare(b.status || ""),
      render: renderStatusTag,
    },
    {
      title: "Cell",
      dataIndex: "cell",
      key: "cell",
      width: 150,
      ellipsis: true,
      sorter: (a, b) => (a.cell || "").localeCompare(b.cell || ""),
      render: (text) => (
        <Tooltip title={text}>
          <span>{text || "-"}</span>
        </Tooltip>
      ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      sortOrder,
      render: (text) => (text ? moment(text).format("YYYY-MM-DD HH:mm") : "-"),
    },
  ];

  return (
    <div style={{ margin: 20 }}>
      <Typography.Title level={2}>
        Vehicle Exemption Applications
      </Typography.Title>

      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col>
          <Button type="primary" onClick={handleCreateApplicationClick}>
            Create New Application
          </Button>
        </Col>

        <Col>
          <Input
            placeholder="Search by Name, Reg No, or Cell"
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 300 }}
          />
        </Col>

        <Col>
          <Select
            value={sortOrder === "ascend" ? "asc" : "desc"}
            style={{ width: 180 }}
            onChange={handleSortOrderChange}
          >
            <Option value="desc">Most Recent First</Option>
            <Option value="asc">Oldest First</Option>
          </Select>
        </Col>
      </Row>

      <Table
        dataSource={filteredData}
        columns={columns}
        rowKey="id"
        tableLayout="fixed"
        scroll={{ x: 1100 }}
        pagination={{ pageSize: 10 }}
        onRow={(record) => ({
          onClick: () => handleRowClick(record),
        })}
      />

      <Modal
        title="Application Details"
        open={!!selectedApplication}
        onCancel={handleCloseApplicationDetails}
        footer={null}
      >
        {selectedApplication && (
          <>
            <p>
              <strong>Salutation:</strong> {selectedApplication.salutation}
            </p>
            <p>
              <strong>First Name:</strong> {selectedApplication.firstName}
            </p>
            <p>
              <strong>Last Name:</strong> {selectedApplication.lastName}
            </p>
            <p>
              <strong>Address:</strong> {selectedApplication.address}
            </p>
            <p>
              <strong>Cell:</strong> {selectedApplication.cell}
            </p>
            <p>
              <strong>Vehicle Reg No:</strong>{" "}
              {selectedApplication.vehicleRegNo}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              {renderStatusTag(selectedApplication.status)}
            </p>
          </>
        )}
      </Modal>
    </div>
  );
};

export default ViewApplications;
