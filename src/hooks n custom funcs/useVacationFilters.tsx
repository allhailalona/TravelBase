import { useState, useMemo } from 'react';
import { Vacation } from '../../types';

export const useVacationFilters = (vacations: Vacation[], role: string) => {
  // State for sorting order (ascending or descending)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // States for filtering options
  const [showNotBegun, setShowNotBegun] = useState(false);
  const [showActive, setShowActive] = useState(false);

  // Memoized computation of filtered and sorted vacations
  const filteredAndSortedVacations = useMemo(() => {
    return vacations
      ? vacations.filter(vacation => {
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
  }, [vacations, showNotBegun, showActive, sortOrder, role]);

  // Function to toggle sort order
  const toggleSortOrder = () => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');

  // Return all necessary states and functions
  return {
    filteredAndSortedVacations,
    sortOrder,
    showNotBegun,
    showActive,
    setShowNotBegun,
    setShowActive,
    toggleSortOrder
  };
};