import { Dispatch, SetStateAction, MutableRefObject } from 'react'

export type Vacation = {
  vacation_id?: string
  destination: string
  description: string
  price: number
  starting_date: string
  ending_date: string
  image_path?: { data: string } | string // Covering both front and back here
}

export type Follower = {
  user_id: number
  vacation_id: number
}

export type User = {
  id?: number
  email?: string
  password?: string
  firstName?: string
  lastName?: string
  role?: string
}

export type UserRole = 'user' | 'admin'

export type FilterControlsProps = {
  sortOrder: 'asc' | 'desc';
  filterType: 'all' | 'notBegun' | 'active' | 'followed';
  toggleSortOrder: () => void;
  setFilterType: (value: 'all' | 'notBegun' | 'active' | 'followed') => void;
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

