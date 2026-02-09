import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  message,
  Modal,
  List,
  Select,
} from "antd";
import axios from "axios";

const { Title } = Typography;
const { Option } = Select;

const Profile = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState("");
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/getUsers");
        if (response.data && response.data.status && isMounted) {
          setUsers(response.data.data);
        }
      } catch (error) {
        if (isMounted) {
          message.error("Error fetching users: " + error.message);
        }
      }
    };
    const fetchRoles = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/getroles");
        // Make sure data exists and is an array
        if (response.data && Array.isArray(response.data.data)) {
          setRoles(response.data.data);
        } else {
          setRoles([]);
          console.error("Roles fetch failed:", response.data);
        }
      } catch (error) {
        setRoles([]);
        message.error("Error fetching roles: " + error.message);
      }
    };

    fetchUsers();
    fetchRoles();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (values) => {
    try {
      const response = await axios.post("http://localhost:8000/api/addUser", {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        roleId: values.roleId,
      });
      if (response.data.status) {
        message.success("User created! Email sent for password setup.");
        setUsers([
          ...users,
          {
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            roleId: values.roleId,
          },
        ]);
        resetForm();
        setIsModalVisible(false);
      } else {
        message.error("Failed to create user: " + response.data.message);
      }
    } catch (error) {
      message.error("An error occurred: " + error.message);
    }
  };

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setRoleId("");
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleRowClick = (user) => {
    setSelectedUser(user);
  };

  const handleCloseUserDetails = () => {
    setSelectedUser(null);
  };

  return (
    <>
      <Card>
        <Title level={4}>User Management</Title>
        <Button type="primary" onClick={showModal}>
          Create New User
        </Button>
        <Modal
          title="Create New User"
          open={isModalVisible}
          onCancel={handleCancel}
          footer={null}
          width="60%"
        >
          <Form onFinish={handleSubmit} layout="vertical">
            <Form.Item
              label="First Name"
              name="firstName"
              rules={[
                { required: true, message: "Please input the first name!" },
              ]}
            >
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </Form.Item>
            <Form.Item
              label="Last Name"
              name="lastName"
              rules={[
                { required: true, message: "Please input the last name!" },
              ]}
            >
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </Form.Item>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                {
                  required: true,
                  type: "email",
                  message: "Please input a valid email!",
                },
              ]}
            >
              <Input value={email} onChange={(e) => setEmail(e.target.value)} />
            </Form.Item>
            <Form.Item
              label="Role"
              name="roleId"
              rules={[{ required: true, message: "Please select a role!" }]}
            >
              <Select
               
                onChange={(value) => setRoleId(value)}
                placeholder="Select a role"
              >
                {roles.map((role) => (
                  <Option key={role.id} value={role.id}>
                    {role.roleName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Create User
              </Button>
            </Form.Item>
          </Form>
        </Modal>
        <List
          header={<div>List of Users</div>}
          variant
          dataSource={users}
          renderItem={(user) => (
            <List.Item
              onClick={() => handleRowClick(user)}
              style={{
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>
                {user.firstName} {user.lastName} - {user.email}
              </span>

              <span
                style={{
                  marginLeft: 10,
                  color: user.passwordSet ? "green" : "red",
                }}
              >
                {user.passwordSet ? "✓ Password Set" : "✗ Pending"}
              </span>
            </List.Item>
          )}
        />
      </Card>

      <Modal
        title="User Details"
        open={!!selectedUser}
        onCancel={handleCloseUserDetails}
        footer={null}
      >
        {selectedUser && (
          <div>
            <p>
              <strong>First Name:</strong> {selectedUser.firstName}
            </p>
            <p>
              <strong>Last Name:</strong> {selectedUser.lastName}
            </p>
            <p>
              <strong>Email:</strong> {selectedUser.email}
            </p>
            <p>
              <strong>Role ID:</strong> {selectedUser.roleId}
            </p>
          </div>
        )}
      </Modal>
    </>
  );
};

export default Profile;
