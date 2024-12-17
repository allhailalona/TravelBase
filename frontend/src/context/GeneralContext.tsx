import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useRef,
  useEffect
} from "react";
import { io, Socket } from 'socket.io-client';
import type {
  Vacation,
  Follower,
  UserRole,
  GeneralContext,
} from "../../types";

const GeneralContext = createContext<GeneralContext | undefined>(undefined);

export function GeneralProvider({ children }: { children: ReactNode }) {
  const [vacations, setVacations] = useState<Vacation[] | undefined>(undefined);
  const [followers, setFollowers] = useState<Follower[] | undefined>(undefined);
  const [userRole, setUserRole] = useState<UserRole | undefined>(undefined)

  const username = useRef<string | undefined>(undefined)
  const userId = useRef<string | undefined>(undefined)

  // Initialize socket connection
  const socket = React.useRef<Socket>(io('http://localhost:3000')).current;

  useEffect(() => {
    socket.on('tokenRefresh', ({ newAccessToken }) => {
      console.log('hello from socket.io in front about to update accessToken')
      localStorage.setItem('accessToken', newAccessToken);
    });

    return () => {
      socket.off('tokenRefresh');
    };
  }, []);

  const verifyUserRole = async (): Promise<void> => {
    try {
      console.log('hello from verifyUserRole in context')
      const res = await fetch('http://localhost:3000/user-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          _at: localStorage.getItem('accessToken'),
          _rt: localStorage.getItem('refreshToken')
        })
      });    

      if (!res.ok) {
        throw new Error("Failed to verify role");
      }

      const data = await res.json();
      console.log('verify role req is a success data is', data)
      setUserRole(data.userRole)
    } catch (error) {
      console.error("Role verification failed:", error);
       // This funciton is always called when there is active session, so the error cannot occur due to not finding a role. Stop exec ith throw error to inspect the issue
      throw error
    }
  };

  return (
    <GeneralContext.Provider
      value={{
        vacations,
        setVacations,
        followers,
        setFollowers,
        username,
        userId,
        userRole,
        verifyUserRole
      }}
    >
      {children}
    </GeneralContext.Provider>
  );
}

export function useGeneralContext(): GeneralContext {
  const context = useContext(GeneralContext);
  if (context === undefined) {
    throw new Error("useGeneralContext must be used within a GeneralProvider");
  }
  return context;
}
