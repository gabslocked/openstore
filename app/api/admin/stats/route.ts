import { NextRequest, NextResponse } from 'next/server'
import { getAdminStats } from '@/lib/dal'

export async function GET(request: NextRequest) {
  try {
    console.log("=== ADMIN STATS API START ===")
    
    const stats = await getAdminStats()
    
    if (!stats) {
      console.log("Admin authentication failed for stats API")
      return NextResponse.json({ error: 'Admin authentication required' }, { status: 401 })
    }

    console.log("Stats fetched successfully:", stats)
    console.log("=== ADMIN STATS API SUCCESS ===")
    
    return NextResponse.json({ stats })
  } catch (error) {
    console.error("Stats API Error:", error)
    return NextResponse.json({ stats: { totalUsers: 0, totalProducts: 0, totalCategories: 0, totalOrders: 0 }, error: "Failed to fetch stats" }, { status: 500 })
  }
}
