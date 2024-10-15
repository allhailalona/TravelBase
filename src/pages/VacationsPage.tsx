import { useEffect, useState } from 'react'
import { message } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useGeneralContext } from '../context/GeneralContext'
import { UserRole }  from '../../types'

export default function VacationsPage(): JSX.Element {
  const { setVacations } = useGeneralContext()
  const [role, setRole] = useState<UserRole>(undefined)

  const navigate = useNavigate()

  // Make sure an unauthorized user hasn't attempted login by inputting address directly
  useEffect(() => {
    // Since useEffect cannot be async, we use a helper function
    const helperFunc = async () => {
      const accessToken = localStorage.getItem('accessToken'); // Get token from localStorage and pass to server.ts
      console.log('accessToken is', accessToken)
      const res = await fetch('http://localhost:3000/vacations', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}` // A more secure approach to send tokens to server instead of as a URL query
        }
      });

      if (!res.ok) {
        const errorData = await res.json()
        if (res.status === 401) { 
          console.log('accessToken has expired')
          message.loading('Your access token has expired. Please wait while the system generates a new one...')

          // Making a new request with the localStorage refreshToken included
          const res = await fetch('http://localhost:3000/refresh-tokens', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('refreshToken')}`
            },
          });          

          if (!res.ok) {
            if (res.status === 401) { // If the refresh token does not exist redirect to login
              localStorage.clear() // For now we only have tokens in localStoreage so clearing is fine...
              message.destroy()
              message.error('The Session Has Expired! Please login.');
              navigate('/login')
              throw new Error (
                `Session has expired: ${errorData}`
              )
            } else { // This is a truly unknown error, not an intentionally vague error handling
              message.destroy()
              message.error('An Unknown Error Has Occured While Refreshing Tokens!'); 
              navigate('/login')
              throw new Error (
                `Error in refresh-token in useEffect request ${errorData}`
              )
            }
          }

          const data = await res.json()

          // Overwrite localStorage
          localStorage.setItem('accessToken', data.accessToken)
          localStorage.setItem('refreshToken', data.refreshToken)
          
          // This is a nice way to simulate loading.
          message.destroy()
          message.success('New Tokens Were Created Successfully! Repeating Original Request...')
          helperFunc()
        } else { // Either the token does not exist either it's invalid
          message.error('Something Went Wrong, Please Login Again!');
          navigate('/login')
          throw new Error (
            `Error in fetching vacations in useEffect request ${errorData || 'unknown error'}`
          )
        }
      }

      const data = await res.json()
      setVacations(data.vacations) // Update context state
      setRole(data.role)
    }

    helperFunc()
  }, [])
  return (
    <div>
      user is {role}
    </div>
  )
}