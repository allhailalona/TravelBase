import { useState, useEffect } from 'react';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useGeneralContext } from '../context/GeneralContext';
import { UserRole, Vacation } from '../../types';

/**
 * This custom hook has been expanded and now includes THREE options: 
 *  1. fetch all vacations - the address is /vacations/fetch
 *  2. fetch a single vacation - the address is /vacations/fetch/:id
 *  3. return user role after successful tokens authentication
*/
export const useAuthAndData = (mode: 'none' | 'single' | 'all', id?: number) => {
  const { setVacations } = useGeneralContext();
  const [role, setRole] = useState<UserRole>(undefined);
  const [singleVacation, setSingleVacation] = useState<Vacation | undefined>(undefined)
  const navigate = useNavigate();

  console.log('welcome to custom hook', mode, id)

  useEffect(() => {
    const fetchData = async () => {
      const accessToken = localStorage.getItem('accessToken');
      let endpoint
      if (mode === 'none') { // No data is to be fetched
        endpoint = 'http://localhost:3000/user-role' 
      } else if (mode === 'single') {
        console.log('editing mode request id is', id)
        // I'm quite sure it's not necessary to encode the URL when the data passed is of such a small volume
        endpoint = `http://localhost:3000/vacations/fetch?id=${id}`
      } else if (mode === 'all') {
        console.log('fetching all vacations') 
        endpoint = 'http://localhost:3000/vacations/fetch'
      }

      console.log('endpoint is', endpoint)
      const res = await fetch(endpoint, {
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
          return fetchData(); // Retry after refreshing tokens
        } else {
          // Handle other errors
          message.error('Something Went Wrong, Please Login Again!');
          navigate('/login');
          throw new Error(`Error in fetching data: ${errorData || 'unknown error'}`);
        }
      }

      // Process successful response
      const data = await res.json();

      // Update vacations states accordingly
      if (mode === 'all') setVacations(data.vacations);
      if (mode === 'single') setSingleVacation(data.vacations)
      
      // The role is always relevant!
      setRole(data.role);
    };

    fetchData();
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

  return { role, singleVacation };
};