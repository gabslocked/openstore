import { Pool, PoolClient } from 'pg';

/**
 * Centralized PostgreSQL connection pool
 * 
 * This module provides a single shared pool for all database operations,
 * avoiding the creation of multiple pools across different modules.
 */

let pool: Pool | null = null;

/**
 * Get the shared database pool
 * Creates the pool on first call (lazy initialization)
 */
export function getPool(): Pool {
  if (!pool) {
    // Import env dynamically to avoid circular dependencies
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    pool = new Pool({
      connectionString: databaseUrl,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    // Log connection errors
    pool.on('error', (err) => {
      console.error('Unexpected error on idle database client:', err);
    });

    // Graceful shutdown handlers
    const shutdown = async () => {
      if (pool) {
        console.log('Closing database pool...');
        await pool.end();
        pool = null;
      }
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  }

  return pool;
}

/**
 * Execute a callback within a database transaction
 * Automatically handles BEGIN, COMMIT, and ROLLBACK
 */
export async function withTransaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await getPool().connect();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Execute a query and return all rows
 */
export async function query<T = Record<string, unknown>>(
  sql: string,
  params?: unknown[]
): Promise<T[]> {
  const client = await getPool().connect();
  try {
    const result = await client.query(sql, params);
    return result.rows as T[];
  } finally {
    client.release();
  }
}

/**
 * Execute a query and return the first row or null
 */
export async function queryOne<T = Record<string, unknown>>(
  sql: string,
  params?: unknown[]
): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] || null;
}

/**
 * Execute a query that doesn't return rows (INSERT, UPDATE, DELETE)
 * Returns the number of affected rows
 */
export async function execute(
  sql: string,
  params?: unknown[]
): Promise<number> {
  const client = await getPool().connect();
  try {
    const result = await client.query(sql, params);
    return result.rowCount || 0;
  } finally {
    client.release();
  }
}

/**
 * Check if the database connection is healthy
 */
export async function healthCheck(): Promise<boolean> {
  try {
    await query('SELECT 1');
    return true;
  } catch {
    return false;
  }
}
