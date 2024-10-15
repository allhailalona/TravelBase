import { useEffect, useState } from 'react'
import { message, Pagination, Checkbox } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useGeneralContext } from '../context/GeneralContext'
import AdminCard from '../comps/AdminCard'
import UserCard from '../comps/UserCard'
import { UserRole, Vacation }  from '../../types'

export default function VacationsPage(): JSX.Element {
  // Context and state management
  const { setVacations, vacations } = useGeneralContext()
  const [role, setRole] = useState<UserRole>(undefined)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Sorting state (only for users)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filter states (only for users)
  const [showNotBegun, setShowNotBegun] = useState(false);
  const [showActive, setShowActive] = useState(false);

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

  // Apply filters and sorting
  const filteredAndSortedVacations = vacations
  ? vacations.filter(vacation => {
      // Get current date and vacation dates
      const now = new Date();
      const startDate = new Date(vacation.starting_date);
      const endDate = new Date(vacation.ending_date);

      // Apply filters based on checkbox states
      if (showNotBegun && !showActive) {
        // Show only vacations that have not begun yet
        return startDate > now;
      } else if (!showNotBegun && showActive) {
        // Show only vacations that are currently active
        return startDate <= now && endDate >= now;
      } else if (showNotBegun && showActive) {
        // Show vacations that either haven't begun or are currently active
        return startDate > now || (startDate <= now && endDate >= now);
      }
      // If no filters are applied, show all vacations
      return true;
    }).sort((a, b) => {
      // Only apply sorting for user role
      if (role === 'user') {
        const dateA = new Date(a.starting_date).getTime();
        const dateB = new Date(b.starting_date).getTime();
        // Sort ascending or descending based on sortOrder
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      }
      // For admin role, maintain original order
      return 0;
    })
  : []; // If vacations is null/undefined, return empty array

  // Get the vacations for the current page
  const currentVacations = filteredAndSortedVacations.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

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
          {role === 'user' && (
            <div className="mb-4">
              <button 
                onClick={toggleSortOrder}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-4"
              >
                Sort by Date {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
              <Checkbox 
                checked={showNotBegun}
                onChange={e => setShowNotBegun(e.target.checked)}
              >
                Show only vacations that have not begun
              </Checkbox>
              <Checkbox 
                checked={showActive}
                onChange={e => setShowActive(e.target.checked)}
              >
                Show only currently active vacations
              </Checkbox>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {currentVacations.map(renderVacationCard)}
          </div>
          <div className="mt-8 flex justify-center">
            <Pagination
              current={currentPage}
              total={filteredAndSortedVacations.length}
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