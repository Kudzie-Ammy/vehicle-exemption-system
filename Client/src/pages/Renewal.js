import React, { useEffect, useState } from "react";
import { Table, Button, message, Typography, Modal } from "antd";
import axios from "axios";
import moment from "moment";

const RenewApplications = () => {
  const [applications, setApplications] = useState([]);
  const [renewedId, setRenewedId] = useState(null);
  const [renewedApps, setRenewedApps] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/applications"
      );
      if (response.data.status) {
        const filteredApps = response.data.data.filter((app) => {
          const isExpired =
            app.expiryDate && new Date(app.expiryDate) < new Date();

          return isExpired;
        });
        setApplications(filteredApps);
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      message.error("Failed to fetch applications.");
    }
  };

  const handleRenew = async (id) => {
    try {
      const response = await axios.post(
        `http://localhost:8000/api/applications/${id}/renew`
      );
      if (response.data.status) {
        message.success("Application marked for renewal.");
        setRenewedId(id);

        setTimeout(() => {
          setApplications((prev) => prev.filter((app) => app.id !== id));
          setRenewedId(null); // reset
        }, 2000); // remove after 2 seconds
      } else {
        message.error(response.data.message);
      }
    } catch (err) {
      console.error("Renew Error:", err);
      message.error("Failed to renew application.");
    }
  };

  const handleReject = async (id) => {
    try {
      const response = await axios.post(
        `http://localhost:8000/api/applications/${id}/rejectRenewal`
      );
      if (response.data.status) {
        message.success("Application rejected.");
        setApplications((prev) => prev.filter((app) => app.id !== id));
      } else {
        message.error(response.data.message);
      }
    } catch (err) {
      console.error("Reject Error:", err);
      message.error("Failed to reject application renewal.");
    }
  };

  const showModal = (application) => {
    setSelectedApplication(application);
    setIsModalVisible(true);
  };

  const columns = [
    { title: "First Name", dataIndex: "firstName" },
    { title: "Last Name", dataIndex: "lastName" },
    {
      title: "Status",
      dataIndex: "status",
      render: (status, record) => {
        const isExpired =
          record.expiryDate && new Date(record.expiryDate) < new Date();
        if (isExpired) {
          return (
            <span style={{ color: "red", fontWeight: "bold" }}>Expired</span>
          );
        }
        return <span style={{ color: "#555" }}>{status}</span>;
      },
    },
    {
      title: "Expiry Date",
      dataIndex: "expiryDate",
      render: (date) => (date ? moment(date).format("DD/MMM/YYYY") : "N/A"),
    },
    {
      title: "View",
      key: "view",
      render: (_, record) => (
        <Button type="default" onClick={() => showModal(record)}>
          View
        </Button>
      ),
    },
    {
      title: "Actions",
      render: (_, record) => {
        if (renewedId === record.id) {
          return (
            <span style={{ color: "green", fontWeight: "bold" }}>Renewed</span>
          );
        }
        return (
          <div style={{ display: "flex", gap: 8 }}>
            <Button type="primary" onClick={() => handleRenew(record.id)}>
              Renew
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div style={{ margin: 20 }}>
      <Typography.Title level={3}>Applications for Renewal</Typography.Title>
      <Table
        columns={columns}
        dataSource={applications}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
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
            <p>
              <strong>Expiry Date:</strong>{" "}
              {selectedApplication.expiryDate
                ? moment(selectedApplication.expiryDate).format("DD/MMM/YYYY")
                : "N/A"}
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
    </div>
  );
};

export default RenewApplications;
