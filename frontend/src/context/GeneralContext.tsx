import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useRef,
} from "react";
import type {
  Vacation,
  Follower,
  UserRole,
  GeneralContext,
} from "../../../types";

const GeneralContext = createContext<GeneralContext | undefined>(undefined);

export function GeneralProvider({ children }: { children: ReactNode }) {
  const [vacations, setVacations] = useState<Vacation[] | undefined>(undefined);
  const [followers, setFollowers] = useState<Follower[] | undefined>(undefined);
  // Confused about the code below? Read the 'mod context...' commit description
  const userRole = useRef<UserRole>(undefined);
  const userId = useRef<number | undefined>(undefined);
  const username = useRef<string | undefined>(undefined)

  return (
    <GeneralContext.Provider
      value={{
        vacations,
        setVacations,
        followers,
        setFollowers,
        userRole,
        userId,
        username
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
