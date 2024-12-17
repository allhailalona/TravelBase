import { useState, useEffect } from "react";
import { Pagination, Button } from "antd";
import { useNavigate } from "react-router-dom";
import { useGeneralContext } from "../context/GeneralContext";
import { useVacationFilters } from "../hooks n custom funcs/useVacationFilters";
import FilterControls from "../components/FilterControls";
import AdminCard from "../components/AdminCard";
import UserCard from "../components/UserCard";
import { Vacation, Follower } from "../../types";

export default function VacationsPage(): JSX.Element {
  const navigate = useNavigate();
  const { vacations, setVacations,
        followers, setFollowers,
        userId, username, 
        userRole,
        verifyUserRole 
        } = useGeneralContext();

  // Reset filters and sorters
  useEffect(() => {
    localStorage.removeItem("sortOrder");
    localStorage.removeItem("filterType");
  }, []); 

  // Fetch data then update userRole
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('fetching data in vacationsPage useEffect')
        const res = await fetch('http://localhost:3000/vacations/fetch', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            _at: localStorage.getItem('accessToken'),
            _rt: localStorage.getItem('refreshToken')
          })
        });    
  
        if (!res.ok) throw new Error('Cannot load vacations page');
  
        const data = await res.json();
        console.log('hello from vacations/fetch call in useEffect from data is', data)
  
        // userId is saved here everytime the the component is loaded so following mechanism works
        // react refs, as well as other hooks are RESET on page reload, and since this func is running on every reload we make sure userId is ALWAYS present and always true to the backend
        userId.current = data.userId
        setVacations(data.updatedVacations);
        setFollowers(data.followers);

        await verifyUserRole();
        
      } catch (err) {
        console.error('Error in VacationsPage fetch:', err);
        throw err;
      }
    };
    fetchData();
  }, []);

  // Apply filters and sorting to vacations
  const {
    filteredAndSortedVacations,
    sortOrder,
    filterType,
    setFilterType,
    toggleSortOrder,
  } = useVacationFilters(
    userId.current,
    vacations,
    followers,
  );

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Number of items to display per page

  // Get vacations for the current page
  const currentVacations = filteredAndSortedVacations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Handle page change in pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  function countFollowers(followers: Follower[], targetVacationId: number) {
    return followers.reduce((count, follower) => {
      // If the vacation_id matches the target, increment the count
      if (follower.vacation_id === targetVacationId) {
        return count + 1;
      }
      // Otherwise, just return the current count
      return count;
    }, 0); // Start the count at 0
  }

  /* 
    The project prioritizes performance and simplicity over security.
    Functions like `isUserFollowingVacation` are handled on the frontend to save time,
    avoiding complexity by keeping them in `useVacationFilters.tsx`.
  */
  function isUserFollowingVacation(
    userId: number,
    vacationId: number,
    followers: Array<{ user_id: number; vacation_id: number }>,
  ): boolean {
    const isFollowing = followers.some(
      (follower) =>
        Number(follower.user_id) === Number(userId) &&
        Number(follower.vacation_id) === Number(vacationId),
    );

    return isFollowing;
  }

  const logOut = () => {
    localStorage.clear()
    navigate('/login')
  }

  // Render appropriate card based on user role
  const renderVacationCard = (vacation: Vacation) => {
    return userRole === "admin" ? (
      <AdminCard key={vacation.vacation_id} vacation={vacation} />
    ) : (
      <UserCard
        key={vacation.vacation_id}
        vacation={vacation}
        totalFollowers={countFollowers(followers, vacation.vacation_id)}
        isUserFollowingVacation={isUserFollowingVacation(
          userId.current,
          vacation.vacation_id,
          followers,
        )}
      />
    );
  };

  return (
    <div className="px-8 min-h-screen bg-gray-900">
      {/* User Navigation Bar */}
      {userRole === "user" && (
        <div className='flex flex-row justify-between items-center py-6'>
          <div className='flex items-center gap-4'>
            <Button 
              onClick={logOut} 
              className='bg-red-500 hover:bg-red-600 text-white border-none px-6 py-2 h-auto font-semibold'
            >
              Log Out
            </Button>
            <FilterControls
              sortOrder={sortOrder}
              filterType={filterType}
              toggleSortOrder={toggleSortOrder}
              setFilterType={setFilterType}
            />
          </div>
          <h2 className='text-white text-xl font-bold'>
            <span className="text-emerald-400">{username.current}</span>
          </h2>
        </div>
      )}
  
      {/* Admin Navigation Bar */}
      {userRole === "admin" && (
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center gap-4">
            <Button 
              onClick={logOut} 
              className='bg-red-500 hover:bg-red-600 text-white border-none px-6 py-2 h-auto font-bold text-xl'
            >
              Log Out
            </Button>
            <button
              onClick={() => navigate("/vacations/add")}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold text-xl
                        transition-all duration-200 shadow-lg"
            >
              Add Vacation
            </button>
            <button
              onClick={() => navigate("/vacations/stats")}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-bold text-xl
                        transition-all duration-200 shadow-lg"
            >
              View Stats
            </button>
          </div>
          <h2 className='text-white text-xl font-bold'>
            <span className="text-purple-400">{username.current}</span>
          </h2>
        </div>
      )}
  
      {vacations && vacations.length > 0 ? (
        <div className="pb-24"> {/* Increased padding to account for fixed pagination */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentVacations.map(renderVacationCard)}
          </div>

          {/* Fixed Pagination */}
          <div className="fixed bottom-0 left-0 right-0 py-4 bg-gray-900/80 backdrop-blur-sm border-t border-gray-800">
            <div className="flex justify-center">
              <Pagination
                current={currentPage}
                total={filteredAndSortedVacations.length}
                pageSize={itemsPerPage}
                onChange={handlePageChange}
                showSizeChanger={false}
                className="custom-pagination"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-400 text-xl">No vacations available or loading...</p>
        </div>
      )}
    </div>
  );
}
