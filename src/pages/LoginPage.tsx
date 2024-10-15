import { Link, useNavigate } from 'react-router-dom'
import { Form, Input, Button, message } from 'antd'
import { useGeneralContext } from '../context/GeneralContext'
import { User } from '../../types'

export default function LoginPage(): JSX.Element {
  const navigate = useNavigate()
  const { setUser } = useGeneralContext()

  const handleLogin = async (values: User) => {
    console.log('login values are', values)

    const params = new URLSearchParams(values as Record<string, string>)
    const url = `http://localhost:3000/login?${params.toString()}`

    const res = await fetch(url, {method: 'GET'})

    // The error handling here is intentionally vague as instructed to increase security
    if (!res.ok) {
      message.error('Something Went Wrong, Try Again!')
      throw new Error(
        `Error in login request`
      )
    }
    
    const data = await res.json()
    console.log('data returned is', data)
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    setUser(data) // Store user in context

    // Done!
    message.success('Login Successful')
    navigate('/vacations')
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