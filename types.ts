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
  vacation_id: number
  destination: string
  description: string
  starting_date: string
  ending_date: string
  price: string // To keep the fraction
  image_path: string | Buffer
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
  userRole: MutableRefObject<UserRole>
  userId: MutableRefObject<number | undefined>
  username: MutableRefObject<string | undefined>
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