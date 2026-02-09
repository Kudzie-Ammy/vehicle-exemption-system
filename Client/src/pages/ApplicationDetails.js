// src/pages/ApplicationDetails.js
import React, { useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import {
  Card,
  Typography,
  Button,
  message,
  Spin,
  Select,
  Modal,
  Row,
  Col,
  Divider,
  Empty,
} from "antd";
import axios from "axios";

const { Title, Text } = Typography;
const { Option } = Select;
const { confirm } = Modal;

const rejectReasons = [
  "Mismatch in personal details",
  "Invalid or expired proof of residence",
  "Incomplete document submission",
  "Invalid vehicle registration details",
  "Unverified War Veteran/Senior Citizen ID",
];

const ApplicationDetails = () => {
  const { id } = useParams();
  const history = useHistory();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplicationDetails();
  }, []);

  const fetchApplicationDetails = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/applications/${id}`
      );

      const data = response.data;

      if (data && data.id) {
        // 🔹 Normalize fields and parse document details
        const normalized = {
          id: data.id,
          salutation: data.salutation,
          firstName: data.firstName,
          lastName: data.lastName,
          address: data.address,
          cell: data.cell,
          nationalId: data.nationalId,
          vehicleRegNo: data.vehicleRegNo,
          type: data.type, // <-- Application type (e.g. War Veteran)
          status: data.status,
          notes: data.notes,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          approvedBy: data.approvedBy,
          finalApprovedBy: data.finalApprovedBy,
          rejectedBy: data.rejectedBy,
          expiryDate: data.expiryDate,
          isRenewal: data.isRenewal,
          renewalCount: data.renewalCount,
          // 🔹 Parse multiple document paths + types
          documents: data.documentUrls
            ? data.documentUrls.split(",").map((path, index) => ({
                filePath: path.trim(),
                type: data.documentTypes
                  ? data.documentTypes.split(",")[index]?.trim() || "Document"
                  : "Document",
              }))
            : [],
        };

        setApplication(normalized);
      } else {
        message.error("Application not found.");
      }
    } catch (error) {
      console.error("❌ Error fetching application details:", error);
      message.error("Failed to fetch application details.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = () => {
    confirm({
      title: "Confirm Approval",
      content: "Are you sure you want to approve this application?",
      okText: "Yes, Approve",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const user = JSON.parse(localStorage.getItem("user"));
          const userId = user ? user.id : null;

          await axios.post("http://localhost:8000/api/approveApplication", {
            id,
            userId,
          });

          message.success("Application approved successfully!");
          history.push("/view-applications");
        } catch (error) {
          console.error(error);
          message.error("Error approving application.");
        }
      },
    });
  };

  const handleReject = () => {
    let selectedReason = null;

    confirm({
      title: "Reject Application",
      content: (
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
      ),
      okText: "Reject",
      cancelText: "Cancel",
      onOk: async () => {
        if (!selectedReason) {
          message.warning("Please select a reason before rejecting.");
          return Promise.reject();
        }

        try {
          const user = JSON.parse(localStorage.getItem("user"));
          const userId = user ? user.id : null;

          await axios.post("http://localhost:8000/api/rejectApplication", {
            id,
            userId,
            reason: selectedReason,
          });

          message.success("Application rejected!");
          history.push("/view-applications");
        } catch (error) {
          console.error(error);
          message.error("Error rejecting application.");
        }
      },
    });
  };

  if (loading)
    return (
      <Spin size="large" style={{ display: "block", margin: "120px auto" }} />
    );

  if (!application)
    return (
      <Text type="danger" style={{ display: "block", textAlign: "center" }}>
        Application not found.
      </Text>
    );

  return (
    <div
      style={{
        background: "#f5f7fa",
        minHeight: "100vh",
        padding: "40px 60px",
      }}
    >
      <Button
        type="link"
        onClick={() => history.goBack()}
        style={{ marginBottom: 20 }}
      >
        ← Back to Applications
      </Button>

      <Card
        bordered={false}
        style={{
          borderRadius: 12,
          boxShadow: "0 4px 25px rgba(0,0,0,0.1)",
          padding: 30,
          background: "#fff",
        }}
      >
        <Title level={3} style={{ color: "#1677ff", marginBottom: 25 }}>
          Application Details
        </Title>

        <Row gutter={[24, 16]}>
          <Col xs={24} sm={12}>
            <Text strong>Salutation: </Text> {application.salutation || "—"}
          </Col>
          <Col xs={24} sm={12}>
            <Text strong>First Name: </Text> {application.firstName || "—"}
          </Col>
          <Col xs={24} sm={12}>
            <Text strong>Last Name: </Text> {application.lastName || "—"}
          </Col>
          <Col xs={24} sm={12}>
            <Text strong>Address: </Text> {application.address || "—"}
          </Col>
          <Col xs={24} sm={12}>
            <Text strong>Cell Number: </Text> {application.cell || "—"}
          </Col>
          <Col xs={24} sm={12}>
            <Text strong>National ID: </Text> {application.nationalId || "—"}
          </Col>
          <Col xs={24} sm={12}>
            <Text strong>Vehicle Reg No: </Text>{" "}
            {application.vehicleRegNo || "—"}
          </Col>
          <Col xs={24} sm={12}>
            <Text strong>Type: </Text> {application.type || "—"}
          </Col>
          <Col xs={24} sm={12}>
            <Text strong>Status: </Text>{" "}
            <span
              style={{
                color:
                  application.status === "Approved"
                    ? "green"
                    : application.status === "Rejected"
                    ? "red"
                    : application.status === "finalApproved"
                    ? "blue"
                    : "#faad14",
                fontWeight: 600,
              }}
            >
              {application.status}
            </span>
          </Col>

          {application.notes && (
            <Col span={24}>
              <Text strong>Rejection Reason: </Text> {application.notes}
            </Col>
          )}
        </Row>

        <Divider />

        <Title level={4} style={{ marginBottom: 16 }}>
          Uploaded Documents
        </Title>

        {application.documents && application.documents.length > 0 ? (
          application.documents.map((doc, index) => {
            const displayName = doc.type || `Document ${index + 1}`;
            return (
              <Card
                key={index}
                type="inner"
                title={displayName}
                style={{
                  marginBottom: 25,
                  borderRadius: 10,
                  boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                }}
              >
                <iframe
                  src={`http://localhost:8000/${doc.filePath}`}
                  style={{
                    width: "100%",
                    height: "520px",
                    border: "none",
                    borderRadius: "8px",
                  }}
                  title={displayName}
                />
              </Card>
            );
          })
        ) : (
          <Empty
            description={<span>No documents uploaded yet.</span>}
            style={{ marginTop: 40 }}
          />
        )}

        <Divider />

        <div style={{ textAlign: "right", marginTop: 30 }}>
          <Button
            type="primary"
            size="large"
            onClick={handleApprove}
            style={{
              marginRight: 10,
              borderRadius: 6,
              background: "linear-gradient(90deg,#1677ff,#69b1ff)",
              boxShadow: "0 3px 6px rgba(0,0,0,0.2)",
            }}
          >
            Approve
          </Button>
          <Button
            danger
            size="large"
            style={{
              borderRadius: 6,
              background: "linear-gradient(90deg,#ff4d4f,#ff7875)",
              color: "white",
              boxShadow: "0 3px 6px rgba(0,0,0,0.2)",
            }}
            onClick={handleReject}
          >
            Reject
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ApplicationDetails;
