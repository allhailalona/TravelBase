import { Dispatch, SetStateAction } from 'react'

export type User = {
  id?: number
  email?: string
  password?: string
  firstName?: string
  lastName?: string
  role?: UserRole
}

export type Vacation = {
  vacation_id: number
  destination: string
  description: string
  starting_date: string
  ending_date: string
  price: string // To keep the fraction
  image_url: string
}

export type GeneralContext = {
  user: User | undefined
  setUser: Dispatch<SetStateAction<User | undefined>>
  vacations: Vacation[] | undefined
  setVacations: Dispatch<SetStateAction<Vacation[] | undefined>>
}

export type UserRole = 'user' | 'admin' | undefined

export type Tokens = {
  accessToken: string
  refreshToken: string
}

export type TokenPayload = {
  userId: string
  userRole: UserRole
}

export type FilterControlsProps = {
  sortOrder: 'asc' | 'desc';
  showNotBegun: boolean;
  showActive: boolean;
  toggleSortOrder: () => void;
  setShowNotBegun: (value: boolean) => void;
  setShowActive: (value: boolean) => void;
}

export type AuthAndDataResult = {
  role: UserRole | undefined;
  singleVacation: Vacation[] | null;
};