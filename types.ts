import { Dispatch, SetStateAction, MutableRefObject } from 'react'

export type User = {
  id?: number
  email?: string
  password?: string
  firstName?: string
  lastName?: string
  role?: UserRole
}

export type Vacation = {
  vacation_id?: string
  destination: string
  description: string
  price: string // To keep the fraction
  starting_date: Date
  ending_date: Date
  image_path?: { data: string } | string // Covering both front and back here
}

export type Follower = {
  user_id: number
  vacation_id: number
}

export type GeneralContext = {
  vacations: Vacation[] | undefined
  setVacations: Dispatch<SetStateAction<Vacation[] | undefined>>
  followers: Follower[] | undefined
  setFollowers: Dispatch<SetStateAction<Follower[] | undefined>>
  username: MutableRefObject<string | undefined>
  userId: MutableRefObject<string | undefined>
  userRole: MutableRefObject<string | undefined>
  verifyUserRole: () => Promise<void>
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
  filterType: 'all' | 'notBegun' | 'active' | 'followed';
  toggleSortOrder: () => void;
  setFilterType: (value: 'all' | 'notBegun' | 'active' | 'followed') => void;
}

export type AuthAndDataResult = {
  role: UserRole | undefined;
  singleVacation: Vacation[] | null;
};