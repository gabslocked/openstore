import { NextRequest, NextResponse } from 'next/server'
import { getAdminUsers } from '@/lib/dal'

export async function GET(request: NextRequest) {
  try {
    console.log("=== ADMIN USERS API START ===")
    
    const users = await getAdminUsers()
    
    if (!users) {
      console.log("Admin authentication failed for users API")
      return NextResponse.json({ error: 'Admin authentication required' }, { status: 401 })
    }

    console.log("Users fetched successfully:", users.length)
    console.log("=== ADMIN USERS API SUCCESS ===")
    
    return NextResponse.json({ users })
  } catch (error) {
    console.error("Users API Error:", error)
    return NextResponse.json({ users: [], error: "Failed to fetch users" }, { status: 500 })
  }
}
