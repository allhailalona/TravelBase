import { Request } from "express";

export interface AuthRequest extends Request {
  authError?: {
    status: number;
    message: string;
  };
  userId?: number
  userRole?: UserRole
}

export type Tokens = {
  accessToken: string;
  refreshToken: string;
};

export type TokenPayload = {
  userId: number;
  userRole: UserRole;
};

export type User = {
  id?: number;
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  userRole?: UserRole;
};

export type Vacation = {
  vacation_id?: number; // Does not exist on adding vacation so not mandatory
  destination: string;
  description: string;
  price: number;
  starting_date: Date;
  ending_date: Date;
  image_path: string;
};

export type Follower = {
  user_id: number;
  vacation_id: number;
};

export type UserRole = "admin" | "user";
