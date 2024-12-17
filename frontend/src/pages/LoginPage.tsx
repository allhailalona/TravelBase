import { Link, useNavigate } from "react-router-dom";
import { Form, Input, Button, message } from "antd";
import { useGeneralContext } from '../context/GeneralContext'
import { User } from "../../types";

export default function LoginPage(): JSX.Element {
  const navigate = useNavigate();
  const { username, userId } = useGeneralContext()

  const handleLogin = async (values: User) => {
    try {
      const params = new URLSearchParams(values as Record<string, string>);
      const url = `http://localhost:3000/login?${params.toString()}`;
      console.log('url is', url)
  
      const res = await fetch(url, { method: "GET" });
  
      // The error handling here is intentionally vague as instructed to increase security
      if (!res.ok) {
        throw new Error(`Error in login request`);
      }
  
      const data = await res.json();
      
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);

      username.current = `Welcome back, ${data.username}` // Use welcome back for logins

      message.success("Login Successful");
      navigate("/vacations/fetch");
    } catch (err) {
      console.error('err in handleLogin in login page', err)
      message.error("Something Went Wrong, Try Again!");
    }
  };

  return (
    <div className="glass w-[30%] h-full p-12 border-2 border-red-500 flex justify-center items-center flex-col relative z-20">
      <Form
        onFinish={handleLogin}
        className="w-full p-4 flex justify-center flex-col bg-white rounded-lg"
      >
        {/* Email Field */}
        <Form.Item
          label={<span className="font-bold">Email</span>}
          name="email"
          rules={[
            { required: true, message: "Please enter your email!" },
            { type: "email", message: "Please enter a valid email!" },
          ]}
        >
          <Input
            placeholder="Enter your email"
            className="font-bold border-2 border-black"
          />
        </Form.Item>

        {/* Password Field */}
        <Form.Item
          label={<span className="font-bold">Password</span>}
          name="password"
          rules={[
            { required: true, message: "Please enter your password!" },
            { min: 4, message: "Password must be at least 4 characters long!" },
          ]}
        >
          <Input.Password
            placeholder="Enter your password"
            className="font-bold border-2 border-black"
          />
        </Form.Item>

        {/* Submit Button and Register Link */}
        <Form.Item className="mb-0">
          <div className="flex justify-between items-center">
            <Link
              to="/register"
              className="font-bold text-blue-500 hover:underline"
            >
              Don't have an account? Register here
            </Link>
            <Button type="primary" htmlType="submit">
              Login
            </Button>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
}
