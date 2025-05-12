import { Request, Response, NextFunction } from 'express';

import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongoose';

import { JWT_SECRET } from '../config/utils';
import { ApiError } from '../utils/api-error';
import { HTTP_STATUS, RESPONSE_MESSAGES } from '../utils/constants';
import User from '../models/user';
import { Role } from '../types/role-type';

// Define the payload structure of the JWT
interface JwtPayload {
  _id: ObjectId;
}

// Extend the Request type to include `user`
declare global {
  namespace Express {
    interface Request {
      user?: any; // Replace `any` with your IUser type if defined
    }
  }
}

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
