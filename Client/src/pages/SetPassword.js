import React, { useState, useEffect } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { Card, Form, Input, Button, message } from "antd";
import axios from "axios";

const SetPassword = () => {
  const history = useHistory();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const token = query.get("token");

  const [loading, setLoading] = useState(false);

  // ✅ Check if token is missing
  useEffect(() => {
    if (!token) {
      message.error("Invalid or missing token!");
      history.push("/login");
    }
  }, [token, history]);

  const onFinish = async (values) => {
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:8000/api/set-password", {
        token,
        newPassword: values.newPassword,
      });

      message.success(res.data.message || "Password set successfully!");
      history.push("/login");
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to set password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <Card title="Set Your Password" style={{ width: 400 }}>
        <Form onFinish={onFinish} layout="vertical">
          {/* New Password */}
          <Form.Item
            label="New Password"
            name="newPassword"
            rules={[
              { required: true, message: "Please enter a password" },
              {
                min: 6,
                message: "Password must be at least 6 characters long",
              },
            ]}
          >
            <Input.Password />
          </Form.Item>

          {/* Confirm Password */}
          <Form.Item
            label="Confirm Password"
            name="confirmPassword"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Please confirm your password" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject("Passwords do not match!");
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>

          {/* Submit */}
          <Button type="primary" htmlType="submit" block loading={loading}>
            Create Password
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default SetPassword;
