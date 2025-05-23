import { HTTP_STATUS, RESPONSE_MESSAGES } from '../utils/constants.js';

// Using any types to resolve type issues
type Request = any;
type Response = any;
type NextFunction = any;

const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(err.status || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    status: err.status || HTTP_STATUS.INTERNAL_SERVER_ERROR,
    message: err.message || RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR,
    errors: err.errors || [],
  });
  next();
};

export default errorMiddleware;
