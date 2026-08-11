import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';

import { pingClickHouse } from './config/clickhouse.js';
import apiRoutes from './routes/api.js';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

const app = express();
const PORT = process.env.BACKEND_PORT || 3002;

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: '*' }));
app.use(express.json());

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
  console.log(`\n🎬 CINESTATE Express Backend running on http://localhost:${PORT}`);
  const chOk = await pingClickHouse();
  console.log(`📊 ClickHouse Cloud Connection: ${chOk ? 'CONNECTED ✅' : 'FAILED ❌'}\n`);
});
