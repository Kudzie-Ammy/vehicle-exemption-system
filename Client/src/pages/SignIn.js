import React, { useState } from "react";
import { Form, Input, Button, Typography, Switch, message } from "antd";
import axios from "axios";
import { useHistory } from "react-router-dom";
import "../assets/styles/auth.css";
import logo from "../assets/images/cityparkinglogo.png";

const { Title, Text } = Typography;

const SignIn = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const history = useHistory();

  const onFinish = async () => {
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8000/api/login", {
        email,
        password,
      });

      // Handle password setup requirement
      if (res.data?.requirePasswordSetup) {
        message.warning("Please check your email and set your password first.");
        history.push("/set-password");
        return;
      }

      // Extract correct backend response
      const { token, user } = res.data.data;

      if (!token || !user) {
        message.error("Unexpected server response.");
        return;
      }

      // Store login session
      localStorage.setItem("authToken", token);
      localStorage.setItem("user", JSON.stringify(user));
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Redirect by role
      const role = user.roleId;
      if (role === 1) history.push("/dashboard");
      else if (role === 2) history.push("/tables");
      else if (role === 3) history.push("/finalApproval");
      else if (role === 4) history.push("/clientDashboard");
      else message.warning("Unauthorized role");
    } catch (error) {
      console.error("Login error:", error);

      if (error.response?.data?.requirePasswordSetup) {
        message.warning("Please set your password using the email link.");
        history.push("/set-password");
      } else {
        message.error("Incorrect email or password.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="logo-section">
          <img src={logo} alt="City Parking Logo" className="auth-logo" />
          <Title level={3} style={{ color: "#cc3300", marginTop: 10 }}>
            City Parking
          </Title>
          <Text style={{ color: "#666" }}>Vehicle Exemption Checklist</Text>
        </div>

        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Please input your email!" },
              { type: "email", message: "Enter a valid email!" },
            ]}
          >
            <Input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Item>

          <div className="remember-section">
            <Switch size="small" defaultChecked={false} />{" "}
            <span>Remember me</span>
          </div>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="signin-btn"
              loading={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </Button>
          </Form.Item>
        </Form>

        <p className="footer-text">© 2025 City Parking</p>
      </div>
    </div>
  );
};

export default SignIn;
