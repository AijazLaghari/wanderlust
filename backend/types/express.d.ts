// Type definitions for Express and other modules
import { ObjectId } from 'mongoose';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

declare module 'express' {
  export interface Request {
    user?: any;
  }
}

declare module 'mongoose' {
  export type ObjectId = any;
}

// Extend NodeJS process.env types
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: string;
    PORT: string;
    MONGODB_URI: string;
    JWT_SECRET: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    BACKEND_URL: string;
    FRONTEND_URL: string;
    REDIS_URL?: string;
  }
} 