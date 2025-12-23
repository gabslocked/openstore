import { NextResponse } from 'next/server';
import { healthCheck } from '@/lib/infrastructure/database/pool';

/**
 * Health check endpoint for Docker and load balancers
 * GET /api/health
 */
export async function GET() {
  try {
    // Check database connection
    const dbHealthy = await healthCheck();
    
    const status = {
      status: dbHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      services: {
        database: dbHealthy ? 'up' : 'down',
        app: 'up',
      },
    };

    if (!dbHealthy) {
      return NextResponse.json(status, { status: 503 });
    }

    return NextResponse.json(status, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}
