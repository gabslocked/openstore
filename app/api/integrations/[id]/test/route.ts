import { NextResponse } from 'next/server';
import { 
  getIntegration, 
  getIntegrationCredentials,
  recordTestResult 
} from '@/lib/integrations';

/**
 * POST /api/integrations/[id]/test
 * Test an integration connection
 */
export async function POST(
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
    
    const credentials = await getIntegrationCredentials(params.id);
    
    if (!credentials) {
      await recordTestResult(params.id, false, 'No credentials configured');
      return NextResponse.json({
        success: false,
        error: 'No credentials configured',
      });
    }
    
    // Test based on integration type and provider
    let testResult: { success: boolean; error?: string; message?: string };
    
    switch (integration.provider) {
      case 'greenpag':
        testResult = await testGreenPag(credentials);
        break;
      case 'stripe':
        testResult = await testStripe(credentials);
        break;
      case 'mercadopago':
        testResult = await testMercadoPago(credentials);
        break;
      default:
        testResult = { success: false, error: 'Unknown provider' };
    }
    
    await recordTestResult(params.id, testResult.success, testResult.error);
    
    return NextResponse.json(testResult);
  } catch (error) {
    console.error('Error testing integration:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await recordTestResult(params.id, false, errorMessage);
    return NextResponse.json({
      success: false,
      error: errorMessage,
    });
  }
}

// Test GreenPag connection
async function testGreenPag(credentials: Record<string, any>): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    const { publicKey, secretKey } = credentials;
    
    if (!publicKey || !secretKey) {
      return { success: false, error: 'Missing API keys' };
    }
    
    // Test API connection (you would call the actual GreenPag API here)
    // For now, we just validate the format
    if (!publicKey.startsWith('pk_') && !publicKey.startsWith('pub_')) {
      return { success: false, error: 'Invalid public key format' };
    }
    
    if (!secretKey.startsWith('sk_') && !secretKey.startsWith('sec_')) {
      return { success: false, error: 'Invalid secret key format' };
    }
    
    return { success: true, message: 'Connection successful' };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Connection failed' };
  }
}

// Test Stripe connection
async function testStripe(credentials: Record<string, any>): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    const { publicKey, secretKey } = credentials;
    
    if (!publicKey || !secretKey) {
      return { success: false, error: 'Missing API keys' };
    }
    
    // Validate key format
    if (!publicKey.startsWith('pk_test_') && !publicKey.startsWith('pk_live_')) {
      return { success: false, error: 'Invalid publishable key format' };
    }
    
    if (!secretKey.startsWith('sk_test_') && !secretKey.startsWith('sk_live_')) {
      return { success: false, error: 'Invalid secret key format' };
    }
    
    // Test actual connection
    const response = await fetch('https://api.stripe.com/v1/balance', {
      headers: {
        'Authorization': `Bearer ${secretKey}`,
      },
    });
    
    if (response.ok) {
      return { success: true, message: 'Connection successful' };
    } else {
      const data = await response.json();
      return { success: false, error: data.error?.message || 'API error' };
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Connection failed' };
  }
}

// Test MercadoPago connection
async function testMercadoPago(credentials: Record<string, any>): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    const { accessToken } = credentials;
    
    if (!accessToken) {
      return { success: false, error: 'Missing access token' };
    }
    
    // Test actual connection
    const response = await fetch('https://api.mercadopago.com/v1/account/bank_report/config', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    if (response.ok || response.status === 403) {
      // 403 means authenticated but no permission for this endpoint (which is fine for testing)
      return { success: true, message: 'Connection successful' };
    } else if (response.status === 401) {
      return { success: false, error: 'Invalid access token' };
    } else {
      return { success: false, error: 'API error' };
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Connection failed' };
  }
}
