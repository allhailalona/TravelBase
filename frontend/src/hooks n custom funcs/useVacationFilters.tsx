import { useState, useMemo, useEffect, useRef } from "react";
import { Vacation, Follower } from "../../../types";

export const useVacationFilters = (
  vacations: Vacation[],
  role: string,
  userId: number,
  followers: Follower[],
) => {
  // Default values instead of reading from localStorage initially
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [filterType, setFilterType] = useState<"all" | "notBegun" | "active" | "followed">("all");

  // Only save to localStorage for user role
  useEffect(() => {
    if (role === "user") {
      localStorage.setItem("sortOrder", sortOrder);
    }
  }, [sortOrder, role]);

  useEffect(() => {
    if (role === "user") {
      localStorage.setItem("filterType", filterType);
    }
  }, [filterType, role]);


  // Helper function to check if user is following a vacation
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

    console.log(
      `User ${userId} is ${isFollowing ? "" : "not "}following vacation ${vacationId}`,
    );
    return isFollowing;
  }

  // Apply filters and sorting to vacations
  const filteredAndSortedVacations = useMemo(() => {
    if (!vacations) return [];

    // Filter vacations based on filterType
    const filtered = vacations.filter((vacation) => {
      const now = new Date();
      const startDate = new Date(vacation.starting_date);
      const endDate = new Date(vacation.ending_date);

      switch (filterType) {
        case "notBegun":
          return startDate > now;
        case "active":
          return startDate <= now && endDate >= now;
        case "followed":
          return isUserFollowingVacation(
            userId,
            vacation.vacation_id,
            followers,
          );
        default:
          return true;
      }
    });

    // Sort vacations based on sortOrder (only for user role)
    const sorted = filtered.sort((a, b) => {
      if (role === "user") {
        const dateA = new Date(a.starting_date).getTime();
        const dateB = new Date(b.starting_date).getTime();
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      }
      return 0;
    });

    return sorted;
  }, [vacations, filterType, sortOrder, role, userId, followers]);

  // Function to toggle sort order
  const toggleSortOrder = () =>
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));

  return {
    filteredAndSortedVacations,
    sortOrder,
    filterType,
    setFilterType,
    toggleSortOrder,
  };
};
