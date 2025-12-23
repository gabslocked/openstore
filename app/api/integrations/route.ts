import { NextResponse } from 'next/server';
import { getIntegrations } from '@/lib/integrations';
import type { IntegrationType } from '@/lib/types/integrations';

/**
 * GET /api/integrations
 * Get all integrations, optionally filtered by type
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as IntegrationType | null;
    
    const integrations = await getIntegrations(type || undefined);
    
    return NextResponse.json({ integrations });
  } catch (error) {
    console.error('Error fetching integrations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch integrations' },
      { status: 500 }
    );
  }
}
