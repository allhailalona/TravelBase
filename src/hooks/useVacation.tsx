import { useState, useEffect } from 'react';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useGeneralContext } from '../context/GeneralContext';
import { UserRole } from '../../types';

/**
 * Custom hook to manage vacation data fetching and authentication
 * @returns {Object} An object containing the user's role
 */
export const useVacationData = () => {
  const { setVacations } = useGeneralContext();
  const [role, setRole] = useState<UserRole>(undefined);
  const navigate = useNavigate();

  useEffect(() => {
    /**
     * Fetches vacation data from the server
     * Handles authentication errors and token refreshing
     */
    const fetchVacationData = async () => {
      const accessToken = localStorage.getItem('accessToken');
      const res = await fetch('http://localhost:3000/vacations', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!res.ok) {
        const errorData = await res.json();
        if (res.status === 401) {
          // Handle expired access token
          console.log('Access token has expired');
          message.loading('Your access token has expired. Please wait while the system generates a new one...');
          await refreshTokens();
          return fetchVacationData(); // Retry after refreshing tokens
        } else {
          // Handle other errors
          message.error('Something Went Wrong, Please Login Again!');
          navigate('/login');
          throw new Error(`Error in fetching vacations: ${errorData || 'unknown error'}`);
        }
      }

      // Process successful response
      const data = await res.json();
      setVacations(data.vacations);
      setRole(data.role);
    };

    fetchVacationData();
  }, []); // Empty dependency array ensures this effect runs once on mount

  /**
   * Refreshes authentication tokens
   * Handles various error scenarios during token refresh
   */
  const refreshTokens = async () => {
    const res = await fetch('http://localhost:3000/refresh-tokens', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('refreshToken')}`
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      if (res.status === 401) {
        // Handle expired refresh token
        localStorage.clear();
        message.destroy();
        message.error('The Session Has Expired! Please login.');
        navigate('/login');
        throw new Error(`Session has expired: ${errorData}`);
      } else {
        // Handle other refresh token errors
        message.destroy();
        message.error('An Unknown Error Has Occurred While Refreshing Tokens!');
        navigate('/login');
        throw new Error(`Error in refresh-token request: ${errorData}`);
      }
    }

    // Update tokens in local storage
    const data = await res.json();
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    
    // Notify user of successful token refresh
    message.destroy();
    message.success('New Tokens Were Created Successfully! Repeating Original Request...');
  };

  return { role };
};