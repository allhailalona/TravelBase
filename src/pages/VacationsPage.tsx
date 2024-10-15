import { useEffect, useState } from 'react'
import { message, Pagination } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useGeneralContext } from '../context/GeneralContext'
import AdminCard from '../comps/AdminCard'
import UserCard from '../comps/UserCard'
import { UserRole, Vacation }  from '../../types'

export default function VacationsPage(): JSX.Element {
  const { setVacations, vacations } = useGeneralContext()
  const [role, setRole] = useState<UserRole>(undefined)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Number of vacations per page

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

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  // Slice the vacations array to get only the items for the current page
  const currentVacations = vacations?.slice(indexOfFirstItem, indexOfLastItem);

  // Handle page change in pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Render appropriate card based on user role
  const renderVacationCard = (vacation: Vacation) => {
    if (role === 'admin') {
      return <AdminCard key={vacation.vacation_id} vacation={vacation} />;
    } else {
      return <UserCard key={vacation.vacation_id} vacation={vacation} />;
    }
  };

  return (
    <div className="container mx-auto px-4">
      <p className="text-lg font-bold my-4">User is {role}</p>
      {vacations && vacations.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {currentVacations.map(renderVacationCard)}
          </div>
          <div className="mt-8 flex justify-center">
            <Pagination
              current={currentPage}
              total={vacations.length}
              pageSize={itemsPerPage}
              onChange={handlePageChange}
              showSizeChanger={false}
            />
          </div>
        </>
      ) : (
        <p>No vacations available or loading...</p>
      )}
    </div>
  );
} 