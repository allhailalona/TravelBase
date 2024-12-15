import { Request, Response, NextFunction } from "express";
import { io } from './server';
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { setRedisState, getRedisState } from "./redisUtils";
import { UserRole, Tokens } from "../types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

export const genTokens = async (
  userId: string,
  userRole: UserRole
): Promise<Tokens> => {
  const accessToken = jwt.sign(
    { userId, userRole }, 
    process.env.JWT_SECRET, 
    { expiresIn: "3m"} // Don't forget to change it back to 3m
  );

  const refreshToken = jwt.sign(
    { userId, userRole },
    process.env.JWT_SECRET,
    // Expiration is specified in Redis
  );

  // Save refresh token in Redis for 3 days
  await setRedisState(refreshToken, { userId, userRole }, 3);

  return { accessToken, refreshToken };
};

export const authToken = async (req: Request, res: Response, next: NextFunction) => {
  console.log('welcome to authToken the request is coming from', req.path)
  
  const accessToken = req.body._at;
  const refreshToken = req.body._rt;
  
  // Authentication error statuses:
  // 401 - No refresh/access token provided from localStorage
  // 403 - Token verification failure - tampered, wrong signature, etc
  // 500 - Redis connection error or misc
  // 200 - Successful refresh/verification of access token

  if (!accessToken) { 
    req.authError = { stauts: 401, message: 'there is no access token in local storage'}
  } else {
    jwt.verify(accessToken, process.env.JWT_SECRET, async (err, user) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          console.log("access token expired, trying to refresh it");
  
          if (!refreshToken) {
            req.authError = { status: 401, message: 'there is no refresh token in local storage'}
          } else {
            try {
              const { userId, userRole } = await refreshAccessToken(refreshToken);
              console.log('refresh was successful moving to listener')
              req.userId = userId
              req.userRole = userRole   
            } catch (err) {
              req.authError = { status: 500, message: `unknown error with refreshAccessToken function ${err}` }
            }
          }
        } else if (err.name === "JsonWebTokenError") { 
          req.authError = { status: 403, message: 'access token verification failed' }  
        } 
      } else {
        req.userId = user.userId;
        req.userRole = user.userRole
      }
    });
  }
  next()
};

// Function to generate new access token using refresh token
export const refreshAccessToken = async (refreshToken: string): Promise<{userId: string, userRole: string}> => {
  // Get user data stored in Redis using refresh token
  const { userId, userRole } = await getRedisState(refreshToken);

  // Generate new access token using user data extracted from access token  
  const newAccessToken = jwt.sign(
    { userId: userId, userRole: userRole },
    process.env.JWT_SECRET,
    { expiresIn: '3m' }  // Remember to change back to 3m
  );
  console.log('emitting new access token to front with socket.io')
  
  io.emit('tokenRefresh', { newAccessToken });

  return { userId, userRole };
 };