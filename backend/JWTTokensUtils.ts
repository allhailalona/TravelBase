import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { setRedisState } from './redisUtils'
import { UserRole, Tokens } from '../types'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.resolve(__dirname, '../.env') })

export const genTokens = async (userId: string, userRole: UserRole): Promise<Tokens> => {
  const accessToken = jwt.sign(
    { userId, userRole },
    process.env.JWT_SECRET,
    { expiresIn: '5s' } // Don't forget to change it back!
  );
  const refreshToken = jwt.sign(
    { userId, userRole },
    process.env.JWT_SECRET
    // No expiration option specified
  );
  
  // Save refresh token in Redis for 3 days
  await setRedisState(refreshToken, {userId, userRole}, 10) 

  return { accessToken, refreshToken }
}

export const authToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const accessToken = authHeader && authHeader.split(' ')[1];

  if (!accessToken) {
    req.authError = { status: 401, message: 'Authorization accessToken is missing' };
    return next();
  }

  jwt.verify(accessToken, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        req.authError = { status: 401, message: 'accessToken has expired', user: user || null };
      } else if (err.name === 'JsonWebTokenError') {
        req.authError = { status: 403, message: 'Invalid accessToken' };
      } else {
        req.authError = { status: 500, message: 'Failed to authenticate accessToken' };
      }
    } else {
      req.user = user;
    }
    next();
  });
};
