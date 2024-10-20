import { createContext, useContext, useState, ReactNode } from 'react'
import type { User, Vacation, GeneralContext } from '../../types'

const GeneralContext = createContext<GeneralContext | undefined>(undefined)

export function GeneralProvider({ children } : { children: ReactNode }) {
  const [user, setUser] = useState<User | undefined>(undefined)
  const [vacations, setVacations] = useState<Vacation[] | undefined>(undefined)

  return (
    <GeneralContext.Provider value={{ user, setUser, vacations, setVacations }}>
      { children }
    </GeneralContext.Provider>
  )
}

export function useGeneralContext(): GeneralContext {
  const context = useContext(GeneralContext);
  if (context === undefined) {
    throw new Error('useGeneralContext must be used within a GeneralProvider');
  }
  return context;
}