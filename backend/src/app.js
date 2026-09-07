import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';

import authRoutes from './routes/auth.routes.js';
import projectRoutes from './routes/project.routes.js';
import { errorHandler } from './middleware/error.middleware.js';

const app = express();

// Set security HTTP headers
app.use(helmet());

// Enable CORS
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// General rate limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 1000, // Increased for smooth testing/demo
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
});

// Stricter rate limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 500, // Increased for smooth testing/demo
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login or registration attempts, please try again after 15 minutes',
  },
});

// Apply general rate limiting to all API endpoints
app.use('/api', generalLimiter);

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'E-commerce API is running',
  });
});

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/projects', projectRoutes);

// Centralized Error Handler Middleware
app.use(errorHandler);

export default app;

