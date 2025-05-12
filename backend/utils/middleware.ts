import { retrieveDataFromCache } from './cache-posts.js';
import { HTTP_STATUS } from './constants.js';

// Using any types to resolve type issues
type Request = any;
type Response = any;
type NextFunction = any;

export const cacheHandler =
  (key: string) => async (req: any, res: any, next: any) => {
    try {
      console.log(`Checking cache for key: ${key}`);
      const cachedData = await retrieveDataFromCache(key);
      if (cachedData) {
        console.log(`Found cached data for key: ${key}, data length: ${Array.isArray(cachedData) ? cachedData.length : 'not an array'}`);
        return res.status(HTTP_STATUS.OK).json(cachedData);
      } else {
        console.log(`No cached data found for key: ${key}, proceeding to fetch from database...`);
      }
      next(); // Proceed to the route handler if data is not cached
    } catch (err: any) {
      console.error(`Cache error for key ${key}:`, err);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: err.message });
    }
  };
