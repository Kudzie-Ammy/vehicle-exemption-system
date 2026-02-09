import React, { useState } from "react";
import {
  Layout,
  Row,
  Col,
  Card,
  Input,
  Button,
  Typography,
  Form,
  Select,
  Upload,
  message,
  Radio,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";
import { useHistory } from "react-router-dom";

const { Title, Text } = Typography;
const { Option } = Select;

export default function VehicleExemptionChecklist({ userId }) {
  const history = useHistory();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [customerInfo, setCustomerInfo] = useState({
    salutation: "",
    vehicleRegNo: "",
    firstName: "",
    lastName: "",
    nationalId: "",
    address: "",
    cell: "",
    role: "",
    vehicleRegBook: false,
    driversLicence: false,
    warVetId: false,
    proofOfResidence: false,
  });

  const [uploadedFiles, setUploadedFiles] = useState({
    vehicleRegBook: null,
    driversLicence: null,
    warVetId: null,
    proofOfResidence: null,
    additional: [],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (e) => {
    const selectedRole = e.target.value;

    if (selectedRole === "War Veteran") {
      setCustomerInfo({
        ...customerInfo,
        role: selectedRole,
        vehicleRegBook: true,
        driversLicence: true,
        warVetId: true,
        proofOfResidence: true,
      });
    } else if (selectedRole === "Senior Citizen") {
      setCustomerInfo({
        ...customerInfo,
        role: selectedRole,
        vehicleRegBook: true,
        driversLicence: true,
        warVetId: false,
        proofOfResidence: true,
      });
    } else {
      setCustomerInfo({
        ...customerInfo,
        role: "",
        vehicleRegBook: false,
        driversLicence: false,
        warVetId: false,
        proofOfResidence: false,
      });
    }
  };

  const handleSelectChange = (value) => {
    setCustomerInfo((prev) => ({ ...prev, salutation: value }));
  };

  const handleUpload = (key, file) => {
    setUploadedFiles((prev) => ({ ...prev, [key]: file }));
  };

  const handleRemove = (key) => {
    if (key === "additional") {
      setUploadedFiles((prev) => ({ ...prev, additional: [] }));
    } else {
      setUploadedFiles((prev) => ({ ...prev, [key]: null }));
    }
  };

  const handleAdditionalUpload = (file) => {
    setUploadedFiles((prev) => ({
      ...prev,
      additional: [...prev.additional, file],
    }));
  };

  const handleSubmit = async () => {
    const {
      salutation,
      vehicleRegNo,
      firstName,
      lastName,
      nationalId,
      address,
      cell,
      role,
    } = customerInfo;

    // 1️⃣ Required text fields
    if (
      !salutation ||
      !vehicleRegNo ||
      !firstName ||
      !lastName ||
      !nationalId ||
      !address ||
      !cell ||
      !role
    ) {
      message.error("Please fill in all required fields.");
      return;
    }

    // 2️⃣ Determine which documents are required based on role
    const requiredDocsMap = {
      vehicleRegBook: "Vehicle Registration Book",
      driversLicence: "Driver’s Licence",
      warVetId: "War Veteran ID",
      proofOfResidence: "Proof of Residence",
    };

    const requiredKeys = [];
    if (customerInfo.vehicleRegBook) requiredKeys.push("vehicleRegBook");
    if (customerInfo.driversLicence) requiredKeys.push("driversLicence");
    if (customerInfo.warVetId) requiredKeys.push("warVetId");
    if (customerInfo.proofOfResidence) requiredKeys.push("proofOfResidence");

    // 3️⃣ Check which required documents are missing
    const missingFiles = requiredKeys.filter((key) => !uploadedFiles[key]);
    if (missingFiles.length > 0) {
      const missingNames = missingFiles.map((key) => requiredDocsMap[key]);
      message.error(
        `Please upload the following required document(s): ${missingNames.join(
          ", "
        )}`
      );
      return;
    }

    // 4️⃣ Prepare FormData
    const formData = new FormData();
    requiredKeys.forEach((key) => formData.append("files", uploadedFiles[key]));
    uploadedFiles.additional.forEach((file) => formData.append("files", file));

    formData.append("type", role);
    formData.append("salutation", salutation);
    formData.append("vehicleRegNo", vehicleRegNo);
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("address", address);
    formData.append("cell", cell);
    formData.append("nationalId", nationalId);

    setIsSubmitting(true);

    try {
      const response = await axios.post(
        "http://localhost:8000/api/documents",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.status === 201) {
        message.success("Application and documents submitted successfully!");
        history.push("/all-applications");
      }
    } catch (error) {
      console.error("Submission error:", error);
      message.error("Error during submission: " + error.message);
    } finally {
      setIsSubmitting(false);
      setUploadedFiles({
        vehicleRegBook: null,
        driversLicence: null,
        warVetId: null,
        proofOfResidence: null,
        additional: [],
      });
    }
  };

  return (
    <Layout style={{ padding: "10px" }}>
      <Card>
        <Title level={4} align="center">
          Vehicle Exemption Checklist Form
        </Title>
        <Form layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Salutation" required>
                <Select
                  value={customerInfo.salutation}
                  onChange={handleSelectChange}
                  placeholder="Select Salutation"
                >
                  <Option value="Mr">Mr</Option>
                  <Option value="Ms">Ms</Option>
                  <Option value="Mrs">Mrs</Option>
                  <Option value="Miss">Miss</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Vehicle Reg. No." required>
                <Input
                  name="vehicleRegNo"
                  value={customerInfo.vehicleRegNo}
                  onChange={handleChange}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="First Name" required>
                <Input
                  name="firstName"
                  value={customerInfo.firstName}
                  onChange={handleChange}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Last Name" required>
                <Input
                  name="lastName"
                  value={customerInfo.lastName}
                  onChange={handleChange}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="National ID Number" required>
                <Input
                  name="nationalId"
                  value={customerInfo.nationalId}
                  onChange={handleChange}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Cellphone Number" required>
                <Input
                  name="cell"
                  value={customerInfo.cell}
                  onChange={handleChange}
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="Address" required>
                <Input
                  name="address"
                  value={customerInfo.address}
                  onChange={handleChange}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Select Role" required>
            <Radio.Group value={customerInfo.role} onChange={handleRoleChange}>
              <Radio value="War Veteran">War Veteran</Radio>
              <Radio value="Senior Citizen">Senior Citizen</Radio>
            </Radio.Group>
          </Form.Item>

          <Text strong>Eligibility Requirements</Text>
          <Title level={5}>Upload Required Documents</Title>

          {customerInfo.vehicleRegBook && (
            <Form.Item label="Vehicle Registration Book (PDF)" required>
              <Upload
                beforeUpload={(file) => {
                  handleUpload("vehicleRegBook", file);
                  return false;
                }}
                accept="application/pdf"
                showUploadList={false}
              >
                <Button icon={<UploadOutlined />}>Upload Reg Book</Button>
              </Upload>
              {uploadedFiles.vehicleRegBook && (
                <div>
                  <Text>{uploadedFiles.vehicleRegBook.name}</Text>
                  <Button
                    type="link"
                    danger
                    onClick={() => handleRemove("vehicleRegBook")}
                  >
                    Remove
                  </Button>
                </div>
              )}
            </Form.Item>
          )}

          {customerInfo.driversLicence && (
            <Form.Item label="Driver’s Licence (PDF)" required>
              <Upload
                beforeUpload={(file) => {
                  handleUpload("driversLicence", file);
                  return false;
                }}
                accept="application/pdf"
                showUploadList={false}
              >
                <Button icon={<UploadOutlined />}>
                  Upload Driver’s Licence
                </Button>
              </Upload>
              {uploadedFiles.driversLicence && (
                <div>
                  <Text>{uploadedFiles.driversLicence.name}</Text>
                  <Button
                    type="link"
                    danger
                    onClick={() => handleRemove("driversLicence")}
                  >
                    Remove
                  </Button>
                </div>
              )}
            </Form.Item>
          )}

          {customerInfo.warVetId && (
            <Form.Item label="War Veteran ID (PDF)" required>
              <Upload
                beforeUpload={(file) => {
                  handleUpload("warVetId", file);
                  return false;
                }}
                accept="application/pdf"
                showUploadList={false}
              >
                <Button icon={<UploadOutlined />}>Upload War Vet ID</Button>
              </Upload>
              {uploadedFiles.warVetId && (
                <div>
                  <Text>{uploadedFiles.warVetId.name}</Text>
                  <Button
                    type="link"
                    danger
                    onClick={() => handleRemove("warVetId")}
                  >
                    Remove
                  </Button>
                </div>
              )}
            </Form.Item>
          )}

          {customerInfo.proofOfResidence && (
            <Form.Item label="Proof of Residence (PDF)" required>
              <Upload
                beforeUpload={(file) => {
                  handleUpload("proofOfResidence", file);
                  return false;
                }}
                accept="application/pdf"
                showUploadList={false}
              >
                <Button icon={<UploadOutlined />}>
                  Upload Proof of Residence
                </Button>
              </Upload>
              {uploadedFiles.proofOfResidence && (
                <div>
                  <Text>{uploadedFiles.proofOfResidence.name}</Text>
                  <Button
                    type="link"
                    danger
                    onClick={() => handleRemove("proofOfResidence")}
                  >
                    Remove
                  </Button>
                </div>
              )}
            </Form.Item>
          )}

          <Form.Item label="Upload Additional Documents (Optional)">
            <Upload
              beforeUpload={(file) => {
                handleAdditionalUpload(file);
                return false;
              }}
              multiple
              accept="application/pdf"
              showUploadList={false}
            >
              <Button icon={<UploadOutlined />}>
                Upload Additional Documents
              </Button>
            </Upload>
            {uploadedFiles.additional.map((file, idx) => (
              <div key={idx}>
                <Text>{file.name}</Text>
                <Button
                  type="link"
                  danger
                  onClick={() => {
                    setUploadedFiles((prev) => ({
                      ...prev,
                      additional: prev.additional.filter((_, i) => i !== idx),
                    }));
                  }}
                >
                  Remove
                </Button>
              </div>
            ))}
          </Form.Item>

          <Form.Item>
            <Row gutter={16}>
              <Col>
                <Button
                  type="primary"
                  htmlType="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </Button>
              </Col>
              <Col>
                <Button type="default" danger onClick={() => history.goBack()}>
                  Cancel
                </Button>
              </Col>
            </Row>
          </Form.Item>
        </Form>
      </Card>
    </Layout>
  );
}
