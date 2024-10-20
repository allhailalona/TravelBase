import { useState, useMemo } from 'react';
import { Vacation } from '../../types';

export const useVacationFilters = (vacations: Vacation[], role: string) => {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterType, setFilterType] = useState<'all' | 'notBegun' | 'active'>('all');

  const filteredAndSortedVacations = useMemo(() => {
    if (!vacations) return [];

    return vacations.filter(vacation => {
      const now = new Date();
      const startDate = new Date(vacation.starting_date);
      const endDate = new Date(vacation.ending_date);

      switch (filterType) {
        case 'notBegun':
          return startDate > now;
        case 'active':
          return startDate <= now && endDate >= now;
        default:
          return true;
      }
    }).sort((a, b) => {
      if (role === 'user') {
        const dateA = new Date(a.starting_date).getTime();
        const dateB = new Date(b.starting_date).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      }
      return 0;
    });
  }, [vacations, filterType, sortOrder, role]);

  const toggleSortOrder = () => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');

  return {
    filteredAndSortedVacations,
    sortOrder,
    filterType,
    setFilterType,
    toggleSortOrder
  };
};