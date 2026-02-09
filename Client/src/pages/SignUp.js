import React, { useState, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import {
  Layout,
  Menu,
  Button,
  Typography,
  Card,
  Form,
  Input,
  Checkbox,
} from "antd";
import axios from "axios";

const { Title } = Typography;
const { Header, Content } = Layout;

const SignUp = () => {
  const [firstName, setFirstname] = useState("");
  const [middleName, setMiddlename] = useState("");
  const [lastName, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [vpassword, setVpassword] = useState("");
  const [error, setError] = useState("");
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [departmentId, setDepartmentId] = useState("");
  const [roles, setRoles] = useState([]);
  const [roleId, setRoleId] = useState("");

  const history = useHistory();

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/departments"
        );
        if (response.data.status) {
          setDepartments(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };

    const fetchRoles = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/roles");
        if (response.data.status) {
          setRoles(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    };

    fetchDepartments();
    fetchRoles();
  }, []);

  const onFinish = (e) => {
    if (password !== vpassword) {
      setError("Passwords do not match.");
      return;
    }

    axios
      .post("http://localhost:8000/api/register", {
        firstName,
        middleName,
        lastName,
        email,
        password,
        roleId,
      })
      .then((res) => {
        const { status, data } = res.data;
        if (!status) {
          setError(data);
        } else {
          setError("");
          setRegistrationSuccess(true);
          history.push("/login");
        }
      })
      .catch((error) => {
        setError("An error occurred. Please try again.");
      });
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <>
      <div className="layout-default ant-layout layout-sign-up">
        <Header>
          <div className="header-col header-brand">
            <h5>Vehicle Exemption Checklist</h5>
          </div>
          <div className="header-col header-nav">
            <Menu mode="horizontal" defaultSelectedKeys={["1"]}>
              <Menu.Item key="3">
                <Link to="/sign-up">
                  <span> Sign Up</span>
                </Link>
              </Menu.Item>
              <Menu.Item key="4">
                <Link to="/sign-in">
                  <span> Sign In</span>
                </Link>
              </Menu.Item>
            </Menu>
          </div>
        </Header>

        <Content className="p-0">
          <div className="sign-up-header">
            <div className="content">
              <Title>Sign Up</Title>
            </div>
          </div>

          <Card
            className="card-signup header-solid h-full ant-card pt-0"
            variant="false"
          >
            <p className="text-center my-25 font-semibold text-muted"></p>
            <Form
              name="basic"
              initialValues={{ remember: true }}
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              className="row-col"
            >
              <Form.Item
                name="FirstName"
                value={firstName}
                onChange={(e) => setFirstname(e.target.value)}
                rules={[
                  { required: true, message: "Please input your username!" },
                ]}
              >
                <Input placeholder="FirstName" />
              </Form.Item>
              <Form.Item
                name="MiddleName"
                rules={[
                  {
                    required: false,
                    message: "Please input your middlename!",
                  },
                ]}
                value={middleName}
                onChange={(e) => setMiddlename(e.target.value)}
              >
                <Input placeholder="MiddleName" />
              </Form.Item>
              <Form.Item
                name="LastName"
                value={lastName}
                onChange={(e) => setLastname(e.target.value)}
                rules={[
                  { required: true, message: "Please input your lastname!" },
                ]}
              >
                <Input placeholder="LastName" />
              </Form.Item>

              <Form.Item
                name="email"
                rules={[
                  { required: true, message: "Please input your email!" },
                ]}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              >
                <Input placeholder="Email" />
              </Form.Item>
              <Form.Item
                name="password"
                rules={[
                  { required: true, message: "Please input your password!" },
                ]}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              >
                <Input placeholder="Password" />
              </Form.Item>
              <Form.Item
                name="VerifyPassword"
                rules={[
                  { required: true, message: "Please verify your password!" },
                ]}
                value={vpassword}
                onChange={(e) => setVpassword(e.target.value)}
              >
                <Input placeholder="VerifyPassword" />
              </Form.Item>

              <Form.Item name="remember" valuePropName="checked"></Form.Item>

              <Form.Item>
                <Button
                  style={{ width: "100%" }}
                  type="primary"
                  htmlType="submit"
                >
                  SIGN UP
                </Button>
              </Form.Item>
            </Form>
            <p className="font-semibold text-muted text-center">
              Already have an account?{" "}
              <Link to="/sign-in" className="font-bold text-dark">
                Sign In
              </Link>
            </p>
          </Card>
        </Content>
      </div>
    </>
  );
};

export default SignUp;
