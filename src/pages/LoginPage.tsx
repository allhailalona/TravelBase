import { Link } from 'react-router-dom'
import { Form, Input, Button } from 'antd'

export default function LoginPage(): JSX.Element {
  const handleLogin = async () => {
    console.log('hello from handleLogin')
  }
  
  return (
    <div className='w-[30%] h-full p-12 border-2 border-red-500 flex justify-center items-center flex-col'>
      <Form
        onFinish={handleLogin}
        className='w-full p-4 border-2 border-green-500 flex justify-center flex-col'
      >
        {/* Email Field */}
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Please enter your email!' },
            { type: 'email', message: 'Please enter a valid email!' }
          ]}
        >
          <Input placeholder='Enter your email' />
        </Form.Item>

        {/* Password Field */}
        <Form.Item
          label="Password"
          name="password"
          rules={[
            { required: true, message: 'Please enter your password!' },
            { min: 4, message: 'Password must be at least 4 characters long!' }
          ]}
        >
          <Input.Password placeholder='Enter your password'/>
        </Form.Item>

        {/* Submit Button */}
        <Form.Item className='flex justify-end'>
          <Button type="primary" htmlType="submit">
            Login
          </Button>
        </Form.Item>
      </Form>
      <Link to="/register" className="text-blue-500 hover:underline">
        Don't have an account? Register here
      </Link>
    </div>
  )
}