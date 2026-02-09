import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Table,
  Button,
  message,
  Input,
  Layout,
  Space,
  Modal,
  Select,
  Avatar,
  Typography,
} from "antd";
import axios from "axios";

const { confirm } = Modal;
const { Search } = Input;
const { Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

const rejectReasons = [
  "Mismatch in personal details",
  "Invalid or expired proof of residence",
  "Incomplete document submission",
  "Invalid vehicle registration details",
  "Unverified War Veteran/Senior Citizen ID",
];

const FinalApproval = () => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loadingAll, setLoadingAll] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  /* ================= FETCH & GROUP (SAME AS ROLE 2) ================= */
  const fetchApplications = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/applications",
      );

      if (response.data.status) {
        const approved = response.data.data.filter(
          (app) => app.status === "Approved" && !app.finalApprovedBy,
        );

        const grouped = Object.values(
          approved.reduce((acc, app) => {
            if (!acc[app.id]) {
              acc[app.id] = {
                ...app,
                documents: [],
              };
            }

            if (app.documentUrl) {
              acc[app.id].documents.push({
                documentUrl: app.documentUrl,
              });
            }

            return acc;
          }, {}),
        );

        setApplications(grouped);
        setFilteredApplications(grouped);
      }
    } catch {
      message.error("Failed to fetch applications");
    }
  };

  /* ================= SEARCH ================= */
  const handleSearch = (value) => {
    const v = value.toLowerCase();
    setFilteredApplications(
      applications.filter((app) =>
        [app.firstName, app.lastName, app.vehicleRegNo, app.status].some((f) =>
          f?.toLowerCase().includes(v),
        ),
      ),
    );
  };

  /* ================= FINAL APPROVE SINGLE ================= */
  const handleFinalApprove = (id) => {
    confirm({
      title: "Confirm Final Approval",
      content: "Are you sure you want to finally approve this application?",
      onOk: async () => {
        try {
          const userId = JSON.parse(localStorage.getItem("user")).id;
          await axios.put(`http://localhost:8000/api/final-approve/${id}`, {
            userId,
          });
          message.success("Application finally approved");
          fetchApplications();
        } catch {
          message.error("Final approval failed");
        }
      },
    });
  };

  /* ================= FINAL APPROVE ALL (FIXED) ================= */
  const handleApproveAll = () => {
    confirm({
      title: "Approve All Applications",
      content: `Approve ${filteredApplications.length} applications?`,
      onOk: async () => {
        setLoadingAll(true);
        try {
          const userId = JSON.parse(localStorage.getItem("user")).id;
          const ids = filteredApplications.map((app) => app.id);

          await axios.put("http://localhost:8000/api/finalApproveAll", {
            userId,
            ids,
          });

          message.success("All applications finally approved");
          fetchApplications();
        } catch {
          message.error("Approve all failed");
        } finally {
          setLoadingAll(false);
        }
      },
    });
  };

  /* ================= REJECT SINGLE ================= */
  const handleReject = (id) => {
    let reason = null;

    Modal.confirm({
      title: "Reject Application",
      content: (
        <Select
          style={{ width: "100%" }}
          placeholder="Select rejection reason"
          onChange={(v) => (reason = v)}
        >
          {rejectReasons.map((r) => (
            <Option key={r} value={r}>
              {r}
            </Option>
          ))}
        </Select>
      ),
      onOk: async () => {
        if (!reason) return message.warning("Select a rejection reason");

        try {
          const userId = JSON.parse(localStorage.getItem("user")).id;
          await axios.post("http://localhost:8000/api/rejectApplication", {
            id,
            userId,
            reason,
          });
          message.success("Application rejected");
          fetchApplications();
        } catch {
          message.error("Rejection failed");
        }
      },
    });
  };

  /* ================= REJECT ALL ================= */
  const handleRejectAll = () => {
    let reason = null;

    Modal.confirm({
      title: "Reject All Applications",
      content: (
        <Select
          style={{ width: "100%" }}
          placeholder="Select rejection reason"
          onChange={(v) => (reason = v)}
        >
          {rejectReasons.map((r) => (
            <Option key={r} value={r}>
              {r}
            </Option>
          ))}
        </Select>
      ),
      onOk: async () => {
        if (!reason) return message.warning("Select a rejection reason");

        try {
          const userId = JSON.parse(localStorage.getItem("user")).id;
          const ids = filteredApplications.map((app) => app.id);

          await axios.post("http://localhost:8000/api/rejectAll", {
            ids,
            userId,
            reason,
          });

          message.success("All applications rejected");
          fetchApplications();
        } catch {
          message.error("Reject all failed");
        }
      },
    });
  };

  /* ================= TABLE ================= */
  const columns = [
    {
      title: "First Name",
      dataIndex: "firstName",
      render: (t) => <Title level={5}>{t}</Title>,
    },
    {
      title: "Last Name",
      dataIndex: "lastName",
      render: (t) => <Title level={5}>{t}</Title>,
    },
    { title: "Vehicle Reg No", dataIndex: "vehicleRegNo" },
    { title: "Status", dataIndex: "status" },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            onClick={() => {
              setSelectedApplication(record);
              setIsModalVisible(true);
            }}
          >
            View
          </Button>
          <Button type="primary" onClick={() => handleFinalApprove(record.id)}>
            Final Approve
          </Button>
          <Button danger onClick={() => handleReject(record.id)}>
            Reject
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Content style={{ padding: 24 }}>
      <Row justify="space-between">
        <Col>
          <h2>Final Approval</h2>
        </Col>
        <Col>
          <Space>
            <Search
              placeholder="Search"
              onSearch={handleSearch}
              style={{ width: 300 }}
            />
            <Button danger onClick={handleRejectAll}>
              Reject All
            </Button>
            <Button
              type="primary"
              loading={loadingAll}
              onClick={handleApproveAll}
            >
              Approve All
            </Button>
          </Space>
        </Col>
      </Row>

      <Card style={{ marginTop: 16 }}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={filteredApplications}
          pagination={false}
          className="ant-border-space"
        />
      </Card>

      {/* ================= MODAL (IDENTICAL TO ROLE 2) ================= */}
      <Modal
        title="Application Details"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        {selectedApplication && (
          <div>
            <p>
              <strong>First Name:</strong> {selectedApplication.firstName}
            </p>
            <p>
              <strong>Last Name:</strong> {selectedApplication.lastName}
            </p>
            <p>
              <strong>Vehicle Reg No:</strong>{" "}
              {selectedApplication.vehicleRegNo}
            </p>
            <p>
              <strong>Status:</strong> {selectedApplication.status}
            </p>

            {selectedApplication.documents?.length > 0 && (
              <div>
                <strong>Documents:</strong>
                <ul>
                  {selectedApplication.documents.map((doc, i) => (
                    <li key={i}>
                      <a
                        href={`http://localhost:8000/${doc.documentUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Document {i + 1}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Modal>
    </Content>
  );
};

export default FinalApproval;
