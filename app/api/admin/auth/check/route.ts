import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export async function GET(request: NextRequest) {
  try {
    console.log("=== ADMIN AUTH CHECK START ===")
    
    // Check admin authentication
    const adminToken = request.cookies.get('admin_token')?.value
    console.log("Admin token found:", !!adminToken)
    console.log("Admin token length:", adminToken?.length || 0)
    
    if (!adminToken) {
      console.log("No admin token found")
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    try {
      const jwtSecret = process.env.JWT_SECRET || 'fallback-secret'
      console.log("JWT Secret exists:", !!jwtSecret)
      console.log("JWT Secret length:", jwtSecret.length)
      
      const decoded = jwt.verify(adminToken, jwtSecret)
      console.log("JWT verification successful:", decoded)
      console.log("=== ADMIN AUTH CHECK SUCCESS ===")
      
      return NextResponse.json({ 
        authenticated: true, 
        user: decoded 
      })
    } catch (jwtError) {
      console.error("JWT verification failed:", jwtError)
      console.log("=== ADMIN AUTH CHECK JWT FAILED ===")
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }
  } catch (error) {
    console.error("Admin auth check error:", error)
    console.log("=== ADMIN AUTH CHECK ERROR ===")
    return NextResponse.json({ authenticated: false }, { status: 500 })
  }
}
