import app from './app';
import connectDB from './config/db';
import { PORT } from './config/utils';
import { connectToRedis } from './services/redis';
import postsRoutes from './routes/posts';

const server = () => {
  const port = PORT || 8080;

  // Redis connections
  connectToRedis();
  // mongodb connection
  connectDB()
    .then(() => {
      app.use('/api/posts', postsRoutes);

      app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
      });
    })
    .catch((error) => {
      console.log('MongoDB connection failed:', error);
    });
};
server();

export default server;
