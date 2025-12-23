import { NextResponse } from 'next/server';
import { 
  getIntegration, 
  updateIntegration, 
  getIntegrationCredentials,
  recordTestResult 
} from '@/lib/integrations';

/**
 * GET /api/integrations/[id]
 * Get a specific integration
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const integration = await getIntegration(params.id);
    
    if (!integration) {
      return NextResponse.json(
        { error: 'Integration not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ integration });
  } catch (error) {
    console.error('Error fetching integration:', error);
    return NextResponse.json(
      { error: 'Failed to fetch integration' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/integrations/[id]
 * Update integration configuration
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { enabled, isDefault, credentials, configPublic } = body;
    
    const integration = await updateIntegration(params.id, {
      enabled,
      isDefault,
      credentials,
      configPublic,
    });
    
    if (!integration) {
      return NextResponse.json(
        { error: 'Integration not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ integration });
  } catch (error) {
    console.error('Error updating integration:', error);
    return NextResponse.json(
      { error: 'Failed to update integration' },
      { status: 500 }
    );
  }
}
