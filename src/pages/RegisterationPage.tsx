import { Link, useNavigate } from 'react-router-dom'
import { Form, Input, Button, message } from 'antd'
import { UserAuthForms } from '../../types'

export default function RegisterationPage(): JSX.Element {
  const handleRegisteration = async (values: UserAuthForms) => {
    console.log('Registration data:', values)
    // Make sure there isn't already a user with this email
    const res = await fetch('http://localhost:3000/register', {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json'
      }, 
      body: JSON.stringify(values)
    })

    // Remove else please
    if (!res.ok) {
      if (res.status === 409) {
        message.error('Registration Failed: Email already exists');
        throw new Error(
          `Error in regsiteration request: Email already exists in DB}`
        )
      } 
      const errorData = await res.json()
      message.error('An Unknown Error Occured Please Contact Developer');
      throw new Error(
        `Error in regsiteration request ${errorData || 'unknown error'}`
      )
    } else {
      console.log('request was successful')
      message.success('Registeration Successful')
      // Create token Before navigation!
      // Redirect to /user/vacations and pop a sucess notification
    }
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