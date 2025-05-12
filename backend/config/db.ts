import mongoose from 'mongoose';
import { MONGODB_URI } from './utils';

export default async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI as string, {
      dbName: 'wanderlust',
    });
    console.log(`✅ Database connected at ${MONGODB_URI}`);
  } catch (err: any) {
    console.error(err.message);
    process.exit(1); // Make sure @types/node is installed
  }

  const dbConnection = mongoose.connection;

  dbConnection.on('error', (err) => {
    console.error(`❌ MongoDB connection error: ${err}`);
  });

  dbConnection.once('open', () => {
    console.log('🟢 Mongoose connection open.');
  });
}
