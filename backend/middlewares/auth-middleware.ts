import jwt from 'jsonwebtoken';

import { JWT_SECRET } from '../config/utils.js';
import { ApiError } from '../utils/api-error.js';
import { HTTP_STATUS, RESPONSE_MESSAGES } from '../utils/constants.js';
import User from '../models/user.js';
import { Role } from '../types/role-type.js';

// Define the payload structure of the JWT
interface JwtPayload {
  _id: string | any; // Use any instead of ObjectId
}

// Using any types to resolve type issues
type Request = any;
type Response = any;
type NextFunction = any;

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.access_token;
  if (!token) {
    return next(
      new ApiError({
        status: HTTP_STATUS.BAD_REQUEST,
        message: RESPONSE_MESSAGES.USERS.RE_LOGIN,
      })
    );
  }

  try {
    const { _id } = jwt.verify(token, JWT_SECRET as string) as JwtPayload;
    const user = await User.findById(_id);
    if (!user) {
      return next(
        new ApiError({
          status: HTTP_STATUS.UNAUTHORIZED,
          message: RESPONSE_MESSAGES.USERS.RE_LOGIN,
        })
      );
    }
    req.user = user;
    next();
  } catch (error: any) {
    console.log('Token verification error:', error);
    return next(
      new ApiError({
        status: HTTP_STATUS.FORBIDDEN,
        message: RESPONSE_MESSAGES.USERS.INVALID_TOKEN,
      })
    );
  }
};

// Add isAdminMiddleware function
export const isAdminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(
      new ApiError({
        status: HTTP_STATUS.UNAUTHORIZED,
        message: RESPONSE_MESSAGES.USERS.RE_LOGIN,
      })
    );
  }
  
  if (req.user.role !== Role.Admin) {
    return next(
      new ApiError({
        status: HTTP_STATUS.FORBIDDEN,
        message: RESPONSE_MESSAGES.USERS.UNAUTHORIZED_USER,
      })
    );
  }
  
  next();
};
