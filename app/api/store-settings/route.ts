import { NextResponse } from 'next/server';
import { getStoreSettings, updateStoreSettings } from '@/lib/store-settings';

/**
 * GET /api/store-settings
 * Get current store settings (public endpoint)
 */
export async function GET() {
  try {
    const settings = await getStoreSettings();
    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error fetching store settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch store settings' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/store-settings
 * Update store settings (admin only in production)
 */
export async function PATCH(request: Request) {
  try {
    const updates = await request.json();
    const settings = await updateStoreSettings(updates);
    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error updating store settings:', error);
    return NextResponse.json(
      { error: 'Failed to update store settings' },
      { status: 500 }
    );
  }
}
