import { createClient } from '@clickhouse/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

const clickhouseHost = process.env.CLICKHOUSE_HOST || 'localhost';
const clickhousePort = process.env.CLICKHOUSE_PORT || '8443';
const isSecure = process.env.CLICKHOUSE_SECURE === 'true' || clickhouseHost.includes('clickhouse.cloud');
const protocol = isSecure ? 'https' : 'http';

console.log(`[Node Backend] Connecting to ClickHouse at ${protocol}://${clickhouseHost}:${clickhousePort}`);

export const chClient = createClient({
  url: `${protocol}://${clickhouseHost}:${clickhousePort}`,
  username: process.env.CLICKHOUSE_USER || 'default',
  password: process.env.CLICKHOUSE_PASSWORD || '',
  database: process.env.CLICKHOUSE_DATABASE || 'cinestate',
  request_timeout: 30000,
  max_open_connections: 10,
  tls: isSecure ? { rejectUnauthorized: false } : undefined,
  keep_alive: { enabled: true },
  log: {
    level: 'ERROR',
  },
});

export async function pingClickHouse() {
  try {
    const rs = await chClient.query({ query: 'SELECT 1 AS ping', format: 'JSONEachRow' });
    const result = await rs.json();
    return result.length > 0 && result[0].ping === 1;
  } catch (err) {
    console.error('[Node Backend] ClickHouse Ping Failed:', err.message);
    return false;
  }
}
