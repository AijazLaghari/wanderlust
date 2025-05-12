import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import authRouter from './routes/auth.js';
import postsRouter from './routes/posts.js';
import userRouter from './routes/user.js';
import errorMiddleware from './middlewares/error-middleware.js';
import passport from './config/passport.js';
import session from 'express-session';
import { FRONTEND_URL } from './config/utils.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Enhanced CORS configuration
app.use(
  cors({
    // Allow all potential frontend origins
    origin: [
      FRONTEND_URL as string, 
      'http://localhost:3000', 
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
      'https://wanderlust-aijazlaghari.vercel.app',
      'http://16.170.155.75',
      'http://16.170.155.75:3000'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Configure Express session
app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// API routes
app.use('/api/posts', postsRouter);
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);

app.get('/', (req: any, res: any) => {
  res.send('Yay!! Backend of wanderlust app is now accessible');
});

// API test page
app.get('/test', (req: any, res: any) => {
  res.sendFile(path.join(__dirname, 'public', 'test-cors.html'));
});

app.all('*', (req: any, res: any) => {
  res.status(404).json({
    status: 404,
    success: false,
    message: '!Oops page not found',
  });
});

app.use(errorMiddleware);

export default app;
