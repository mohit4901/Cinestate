import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';

import { pingClickHouse } from './config/clickhouse.js';
import apiRoutes from './routes/api.js';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

const app = express();
const PORT = process.env.PORT || process.env.BACKEND_PORT || 3002;

// Allowed Origins for CORS (Localhost + Hosted Vercel + dynamic origins)
const defaultAllowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  'https://cinestate.vercel.app',
];

const envAllowed = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
  : [];

const allowedOrigins = Array.from(new Set([...defaultAllowedOrigins, ...envAllowed]));

app.use(helmet({ contentSecurityPolicy: false }));

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      // Allow any Vercel domain (*.vercel.app) or explicitly listed origins or wildcard
      if (
        origin.endsWith('.vercel.app') ||
        allowedOrigins.includes(origin) ||
        allowedOrigins.includes('*')
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive fallback to prevent breaking cross-domain UI
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  })
);

app.use(express.json());

// Root welcome & status
app.get('/', (req, res) => {
  res.json({
    service: 'CINESTATE Backend API',
    status: 'online',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      projects: '/api/projects',
    },
  });
});

// API Routes
app.use('/api', apiRoutes);

// Health check
app.get('/health', async (req, res) => {
  const chAlive = await pingClickHouse();
  res.json({
    service: 'CINESTATE Backend API',
    status: chAlive ? 'healthy' : 'degraded',
    clickhouse: chAlive,
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, async () => {
  console.log(`\n🎬 CINESTATE Express Backend running on port ${PORT}`);
  const chOk = await pingClickHouse();
  console.log(`📊 ClickHouse Cloud Connection: ${chOk ? 'CONNECTED ✅' : 'FAILED ❌'}\n`);
});
