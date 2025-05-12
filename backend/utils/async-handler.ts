import { Request, Response } from 'express';

// Use any type for NextFunction to avoid type errors
type NextFunctionType = any;

export const asyncHandler = (func: any) => {
  return (req: Request, res: Response, next: NextFunctionType) => {
    Promise.resolve(func(req, res, next)).catch((err) => next(err));
  };
};
