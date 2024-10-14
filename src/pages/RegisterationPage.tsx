import { Link } from 'react-router-dom'
import { Form, Input, Button } from 'antd'

export default function RegisterationPage(): JSX.Element {
  const handleRegisteration = async (values: any) => {
    console.log('Registration data:', values)
  }
  
  return (
    <div className='w-[30%] h-full p-12 border-2 border-red-500 flex justify-center items-center flex-col'>
      <Form
        onFinish={handleRegisteration}
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

     {/* First Name Field */}
     <Form.Item
          label="First Name"
          name="firstName"
          rules={[
            { required: true, message: 'Please enter your first name!' },
            { min: 2, message: 'First name must be at least 2 characters long!' },
            { 
              pattern: /^[A-Za-z]+$/, 
              message: 'First name can only contain English letters!' 
            }
          ]}
        >
          <Input placeholder='Enter your first name'/>
        </Form.Item>

        {/* Last Name Field */}
        <Form.Item
          label="Last Name"
          name="lastName"
          rules={[
            { required: true, message: 'Please enter your last name!' },
            { min: 2, message: 'Last name must be at least 2 characters long!' },
            { 
              pattern: /^[A-Za-z]+$/, 
              message: 'Last name can only contain English letters!' 
            }
          ]}
        >
          <Input placeholder='Enter your last name'/>
        </Form.Item>

        {/* Submit Button */}
        <Form.Item className='flex justify-end'>
          <Button type="primary" htmlType="submit">
            Register
          </Button>
        </Form.Item>
      </Form>

      <Link to="/login" className="text-blue-500 hover:underline">
        Already have an account? Login here
      </Link>
    </div>
  )
}