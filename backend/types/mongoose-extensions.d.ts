import { Document } from 'mongoose';

// Extend mongoose Document interface to include our custom methods
declare module 'mongoose' {
  interface Document {
    isPasswordCorrect?(password: string): Promise<boolean>;
    generateAccessToken?(): Promise<string>;
    generateRefreshToken?(): Promise<string>;
    generateResetToken?(): Promise<string>;
  }
} 