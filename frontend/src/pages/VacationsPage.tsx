import React, { useState, useEffect } from "react";
import { Pagination, Button } from "antd";
import { useNavigate } from "react-router-dom";
import { useGeneralContext } from "../context/GeneralContext";
import { useVacationFilters } from "../hooks n custom funcs/useVacationFilters";
import FilterControls from "../components/FilterControls";
import AdminCard from "../components/AdminCard";
import UserCard from "../components/UserCard";
import { Vacation, Follower } from "../../../types";

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
  
        setVacations(data.updatedVacations);
        setFollowers(data.followers);
        userId.current = data.userId;
        username.current = data.username;
        
        console.log('hello vac page ard calling verify userrole')
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
    <div className="px-8 bg-gray-800">
    {/* Display user role */}
      {/* Render filter controls for user role */}
      {userRole === "user" && (
        <div className='flex flex-row gap-2 items-center'>
          <Button onClick={logOut} size='large' className='font-bold'>Log Out</Button>
          <FilterControls
            sortOrder={sortOrder}
            filterType={filterType}
            toggleSortOrder={toggleSortOrder}
            setFilterType={setFilterType}
          />
          <h2 className='font-bold text-white text-xl'>Welcome {username.current}!</h2>
        </div>
      )}

      {/* Render Add button for admin role */}
      {userRole === "admin" && (
        <div className="flex flex-row gap-3 items-center">
          <Button onClick={logOut} size='large' className='font-bold'>Log Out</Button>
          <button
            onClick={() => navigate("/vacations/add")}
            className="bg-white p-2 my-2 rounded-lg font-bold"
          >
            Add A Vacation
          </button>
          <button
            onClick={() => navigate("/vacations/stats")}
            className="bg-white p-2 my-2 rounded-lg font-bold"
          >
            Stats
          </button>
          <h2 className='font-bold text-white text-xl flex justify-end'>Welcome {username.current}!</h2>
        </div>
      )}

      {/* Render vacations according to user role */}
      {vacations && vacations.length > 0 ? (
        <>
          {/* Grid layout for vacation cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {currentVacations.map(renderVacationCard)} {/* Map vacations here */}
          </div>

          {/* Pagination component */}
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
