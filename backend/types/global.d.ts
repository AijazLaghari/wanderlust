// Type declarations for modules without their own @types packages

declare module 'express-session';
declare module 'compression';
declare module 'cookie-parser';
declare module 'cors';
declare module 'passport';
declare module 'passport-google-oauth20';
declare module 'jsonwebtoken';
declare module 'express';

// For modules that have @types but might not be resolving
declare module 'mongoose';
declare module 'redis';

// Add module declarations for modules without type definitions
declare module 'bcryptjs' {
  export function hash(data: string, salt: number): Promise<string>;
  export function compare(data: string, encrypted: string): Promise<boolean>;
}

declare module 'crypto' {
  export function randomBytes(size: number): { toString(encoding: string): string };
  export function createHash(algorithm: string): {
    update(data: string): { digest(encoding: string): string };
  };
}

declare module 'dotenv' {
  export function config(): void;
}

// Declare global process
declare global {
  var process: {
    env: {
      [key: string]: string | undefined;
    }
  };
} 