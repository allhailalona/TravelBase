import { Link, useNavigate } from "react-router-dom";
import { Form, Input, Button, message } from "antd"
import { useGeneralContext } from '../context/GeneralContext'
import { User } from "../../types";

export default function RegisterationPage(): JSX.Element {
  const navigate = useNavigate();
  const { username, userId } = useGeneralContext()

  const handleRegisteration = async (values: User) => {
    try {
      console.log("Registration data:", values);
      const res = await fetch("http://localhost:3000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
  
      if (!res.ok) {
        throw new Error(`Unkonwn error occured in registeration page`)
      }

      const data = await res.json();

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);

      username.current = `Welcome newcomer, ${data.username}`

      message.success("Registeration Successful");
      navigate("/vacations/fetch");
    } catch (err) {
      console.error('registeration was NOT successful', err)
      message.error('Unknown error occured please try again!')
    }

  };

  return (
    <div className="glass w-[30%] h-full p-12 flex justify-center items-center flex-col">
      <Form
        onFinish={handleRegisteration}
        className="w-full p-4 flex bg-white rounded-xl justify-center flex-col"
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

        {/* First Name Field */}
        <Form.Item
          label={<span className="font-bold">First Name</span>}
          name="firstName"
          rules={[
            { required: true, message: "Please enter your first name!" },
            {
              min: 2,
              message: "First name must be at least 2 characters long!",
            },
            {
              pattern: /^[A-Za-z]+$/,
              message: "First name can only contain English letters!",
            },
          ]}
        >
          <Input
            placeholder="Enter your first name"
            className="font-bold border-2 border-black"
          />
        </Form.Item>

        {/* Last Name Field */}
        <Form.Item
          label={<span className="font-bold">Last Name</span>}
          name="lastName"
          rules={[
            { required: true, message: "Please enter your last name!" },
            {
              min: 2,
              message: "Last name must be at least 2 characters long!",
            },
            {
              pattern: /^[A-Za-z]+$/,
              message: "Last name can only contain English letters!",
            },
          ]}
        >
          <Input
            placeholder="Enter your last name"
            className="font-bold border-2 border-black"
          />
        </Form.Item>

        {/* Submit Button */}
        <Form.Item className="flex flex-row gap-4">
          <Link
            to="/login"
            className="mx-4 font-bold text-md text-blue-500 hover:text-blue-500 hover:underline"
          >
            Already have an account? Login here
          </Link>
          <Button type="primary" htmlType="submit">
            Register
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
