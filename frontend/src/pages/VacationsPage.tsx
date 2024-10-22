import React, { useState, useEffect } from "react";
import { Pagination, Button } from "antd";
import { useNavigate } from "react-router-dom";
import { useGeneralContext } from "../context/GeneralContext";
import { authAndData } from "../hooks n custom funcs/authAndData";
import { useVacationFilters } from "../hooks n custom funcs/useVacationFilters";
import FilterControls from "../comps/FilterControls";
import AdminCard from "../comps/AdminCard";
import UserCard from "../comps/UserCard";
import { Vacation, Follower } from "../../../types";

export default function VacationsPage(): JSX.Element {
  const navigate = useNavigate();
  const { vacations, setVacations, followers, setFollowers, userRole, userId, username } = useGeneralContext();

  // Separate cleanup effect that runs first
  useEffect(() => {
    localStorage.removeItem("sortOrder");
    localStorage.removeItem("filterType");
  }, []); // Empty dependency array ensures it runs once on mount

  // Fetch vacation data and user role
  useEffect(() => {
    const fetchData = async () => {
      const data = await authAndData("all");
      console.log("user name is", data);
      setVacations(data.vacations);
      setFollowers(data.followers);
      userRole.current = data.role;
      userId.current = data.userId;
      username.current = data.username
      console.log('updated username to ', data.username)
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
    vacations,
    userRole.current,
    userId.current,
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

  /* 
    Since this project is relatively small, certain compromises are made to save time and improve performance over security and privacy
    * A more secure yet cumbersome and more intensive approach would be to perform the functions below in the backend, so the entire followers data 
      is not present in the front
    * The isUserFollowingVacation function, has a copy in useVacationFilters.tsx, moving the func to a seperate file would be overcomplication
  */
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

  function isUserFollowingVacation(
    userId: number,
    vacationId: number,
    followers: Array<{ user_id: number; vacation_id: number }>,
  ): boolean {
    console.log(
      `Checking if user ${userId} is following vacation ${vacationId}`,
    );

    const isFollowing = followers.some(
      (follower) =>
        Number(follower.user_id) === Number(userId) &&
        Number(follower.vacation_id) === Number(vacationId),
    );

    return isFollowing;
  }

  // Render appropriate card based on user role
  const renderVacationCard = (vacation: Vacation) => {
    return userRole.current === "admin" ? (
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

  const logOut = () => {
    localStorage.clear()
    navigate('/login')
  }

  return (
    <div className="px-8 bg-gray-800">
      {/* Display user role */}
      {/* Render filter controls for user role */}
      {userRole.current === "user" && (
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
      {userRole.current === "admin" && (
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
      {vacations && vacations.length > 0 ? (
        <>
          {/* Grid layout for vacation cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {currentVacations.map(renderVacationCard)}
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
