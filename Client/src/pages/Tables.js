import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Table,
  Button,
  Avatar,
  Typography,
  Modal,
  message,
  Select,
  Input,
  Layout,
} from "antd";
import { LogoutOutlined } from "@ant-design/icons";
import axios from "axios";
import logo from "../assets/images/cityparkinglogo.png";
import { useHistory } from "react-router-dom";

const { Title } = Typography;
const { Search } = Input;
const { Header, Content } = Layout;
const { confirm } = Modal;
const { Option } = Select;

const Tables = () => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [disabledButtons, setDisabledButtons] = useState([]);
  const [actionStatus, setActionStatus] = useState({});
  const history = useHistory();

  useEffect(() => {
    fetchApplications();
  }, []);
  const fetchApplications = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/applications",
      );

      if (response.data.status) {
        // Step 1: Filter pending applications
        const pending = response.data.data.filter(
          (app) => app.status === "Pending",
        );

        // Step 2: Group by application id
        const grouped = Object.values(
          pending.reduce((acc, app) => {
            if (!acc[app.id]) {
              acc[app.id] = {
                ...app,
                documents: [],
              };
            }

            // Add document info
            if (app.documentUrl) {
              acc[app.id].documents.push({
                documentUrl: app.documentUrl,
              });
            }

            return acc;
          }, {}),
        );

        // Step 3: Save to state
        setApplications(grouped);
        setFilteredApplications(grouped);
        localStorage.setItem("inProgressApps", JSON.stringify(grouped));
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      message.error("Failed to fetch applications");
    }
  };

  const handleSearch = (value) => {
    const filteredData = applications.filter((application) =>
      [
        application.firstName,
        application.lastName,
        application.vehicleRegNo,
        application.status,
      ].some((field) => field.toLowerCase().includes(value.toLowerCase())),
    );
    setFilteredApplications(filteredData);
  };

  const showModal = (application) => {
    setSelectedApplication(application);
    setIsModalVisible(true);
  };

  const handleApprove = (id) => {
    confirm({
      title: "Confirm Approval",
      content: "Are you sure you want to approve this application?",
      okText: "Yes, Approve",
      cancelText: "Cancel",
      onOk: async () => {
        setDisabledButtons((prev) => [...prev, id]);
        setActionStatus((prev) => ({ ...prev, [id]: "Approved" }));

        try {
          const userId = JSON.parse(localStorage.getItem("user")).id;

          await axios.post(`http://localhost:8000/api/approveApplication`, {
            id,
            userId,
          });

          const updated = filteredApplications.filter((app) => app.id !== id);
          setFilteredApplications(updated);
          localStorage.setItem("inProgressApps", JSON.stringify(updated));

          message.success("Application approved successfully!");
          fetchApplications();
        } catch (error) { 
          message.error("Error approving application: " + error.message);
          setDisabledButtons((prev) => prev.filter((btnId) => btnId !== id));
          setActionStatus((prev) => ({ ...prev, [id]: null }));
        }
      },
    });
  };

  const rejectReasons = [
    "Mismatch in personal details",
    "Invalid or expired proof of residence",
    "Incomplete document submission",
    "Invalid vehicle registration details",
    "Unverified War Veteran/Senior Citizen ID",
  ];

  const handleReject = (id) => {
    let selectedReason = null;

    // Create a modal with custom content (including Select)
    const modal = Modal.confirm({
      title: "Confirm Rejection",
      content: (
        <div>
          <p>Are you sure you want to reject this application?</p>
          <Select
            style={{ width: "100%" }}
            placeholder="Select rejection reason"
            onChange={(value) => (selectedReason = value)}
          >
            {rejectReasons.map((reason, i) => (
              <Option key={i} value={reason}>
                {reason}
              </Option>
            ))}
          </Select>
        </div>
      ),
      okText: "Yes, Reject",
      cancelText: "Cancel",
      onOk: async () => {
        if (!selectedReason) {
          message.warning("Please select a rejection reason.");
          return Promise.reject(); // keeps modal open
        }

        setDisabledButtons((prev) => [...prev, id]);
        setActionStatus((prev) => ({ ...prev, [id]: "Rejected" }));

        try {
          const userId = JSON.parse(localStorage.getItem("user")).id;

          await axios.post(`http://localhost:8000/api/rejectApplication`, {
            id,
            userId,
            reason: selectedReason, // send reason to backend
          });

          const updated = filteredApplications.filter((app) => app.id !== id);
          setFilteredApplications(updated);
          localStorage.setItem("inProgressApps", JSON.stringify(updated));

          message.success("Application rejected!");
          fetchApplications();
        } catch (error) {
          message.error("Error rejecting application: " + error.message);
          setDisabledButtons((prev) => prev.filter((btnId) => btnId !== id));
          setActionStatus((prev) => ({ ...prev, [id]: null }));
        }
      },
    });
  };

  const columns = [
    {
      title: "First Name",
      dataIndex: "firstName",
      key: "firstName",
      render: (text) => (
        <Avatar.Group>
          <div className="avatar-info">
            <Title level={5}>{text}</Title>
          </div>
        </Avatar.Group>
      ),
    },
    {
      title: "Last Name",
      dataIndex: "lastName",
      key: "lastName",
      render: (text) => (
        <Avatar.Group>
          <div className="avatar-info">
            <Title level={5}>{text}</Title>
          </div>
        </Avatar.Group>
      ),
    },
    {
      title: "Vehicle Reg No",
      dataIndex: "vehicleRegNo",
      key: "vehicleRegNo",
    },
    {
      title: "Action",
      key: "action",
      render: (text, record) => (
        <Button
          type="link"
          onClick={() => history.push(`/applications/${record.id}`)}
        >
          View
        </Button>
      ),
    },

    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text) => <span>{text}</span>,
    },
  ];

  return (
    <Layout>
      <div className="tabled">
        <Row gutter={[24, 0]}>
          <Col xs="24" xl={24}>
            <Card
              className="criclebox tablespace mb-24"
              title="Applications List"
            >
              <Row justify="end" style={{ marginBottom: 16 }}>
                <Col>
                  <Search
                    placeholder="Type here to search"
                    onSearch={handleSearch}
                    enterButton
                    style={{ width: 300 }}
                  />
                </Col>
              </Row>
              <div className="table-responsive">
                <Table
                  columns={columns}
                  dataSource={filteredApplications}
                  pagination={false}
                  className="ant-border-space"
                />
              </div>
            </Card>
          </Col>
        </Row>
      </div>

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
            {selectedApplication.documentUrl && (
              <p>
                <strong>Document:</strong>{" "}
                <a
                  href={`http://localhost:8000/${selectedApplication.documentUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Document
                </a>
              </p>
            )}
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default Tables;
