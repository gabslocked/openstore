import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'
import jwt from 'jsonwebtoken'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/ezpods'
})

export async function GET(request: NextRequest) {
  try {
    console.log("=== USER PROFILE CHECK START ===")
    
    // Get JWT token from cookies - check both user_token and admin_token
    const userToken = request.cookies.get('user_token')?.value
    const adminToken = request.cookies.get('admin_token')?.value
    const token = userToken || adminToken

    console.log("User token found:", !!userToken)
    console.log("Admin token found:", !!adminToken)
    console.log("Final token found:", !!token)
    console.log("Token length:", token?.length || 0)

    if (!token) {
      console.log("No token found for user profile")
      return NextResponse.json(
        { error: 'Token de autenticação não encontrado' },
        { status: 401 }
      )
    }

    // Verify JWT token
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret'
    let decoded: any
    
    try {
      decoded = jwt.verify(token, jwtSecret)
      console.log("JWT verification successful for user profile:", decoded)
    } catch (error) {
      console.error("JWT verification failed for user profile:", error)
      console.log("JWT Secret used:", jwtSecret)
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }

    // Get user data from database
    const client = await pool.connect()
    
    try {
      const userQuery = `
        SELECT id, name, email, whatsapp, email_verified, is_admin, created_at
        FROM users 
        WHERE id = $1
      `
      
      const userResult = await client.query(userQuery, [decoded.userId])
      
      if (userResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'Usuário não encontrado' },
          { status: 404 }
        )
      }

      const user = userResult.rows[0]
      
      return NextResponse.json({
        id: user.id,
        name: user.name,
        email: user.email,
        whatsapp: user.whatsapp,
        email_verified: user.email_verified,
        isAdmin: user.is_admin || false,
        created_at: user.created_at
      })

    } finally {
      client.release()
    }

  } catch (error) {
    console.error('Erro ao buscar perfil do usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
