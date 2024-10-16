import { useState } from 'react'
import { Pagination } from 'antd'
import { useGeneralContext } from '../context/GeneralContext'
import { useVacationData } from '../hooks/useVacation'
import { useVacationFilters } from '../hooks/useVacationFilters'
import FilterControls from '../comps/FilterControls'
import AdminCard from '../comps/AdminCard'
import UserCard from '../comps/UserCard'
import { Vacation } from '../../types'

export default function VacationsPage(): JSX.Element {
  // Fetch vacation data and user role
  const { role } = useVacationData()

  // Access vacations from the general context
  const { vacations } = useGeneralContext()

  // Apply filters and sorting to vacations
  const {
    filteredAndSortedVacations,
    sortOrder,
    showNotBegun,
    showActive,
    setShowNotBegun,
    setShowActive,
    toggleSortOrder
  } = useVacationFilters(vacations, role)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Number of items to display per page

  // Get vacations for the current page
  const currentVacations = filteredAndSortedVacations.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  // Handle page change in pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Render appropriate card based on user role
  const renderVacationCard = (vacation: Vacation) => {
    return role === 'admin' 
      ? <AdminCard key={vacation.vacation_id} vacation={vacation} />
      : <UserCard key={vacation.vacation_id} vacation={vacation} />;
  };

  return (
    <div className="container mx-auto px-4">
      {/* Display user role */}
      <p className="text-lg font-bold my-4">User is {role}</p>
      {vacations && vacations.length > 0 ? (
        <>
          {/* Render filter controls for user role */}
          {role === 'user' && (
            <FilterControls
              sortOrder={sortOrder}
              showNotBegun={showNotBegun}
              showActive={showActive}
              toggleSortOrder={toggleSortOrder}
              setShowNotBegun={setShowNotBegun}
              setShowActive={setShowActive}
            />
          )}
          
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
        // Display when no vacations are available or still loading
        <p>No vacations available or loading...</p>
      )}
    </div>
  );
}