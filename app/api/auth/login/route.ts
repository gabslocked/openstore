import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import bcrypt from 'bcryptjs'
import { Pool } from 'pg'
import jwt from 'jsonwebtoken'

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email e senha são obrigatórios" }, { status: 400 })
    }

    const client = await pool.connect()

    try {
      // Find user by email
      const userResult = await client.query(
        'SELECT id, name, email, password, whatsapp FROM users WHERE email = $1',
        [email]
      )

      if (userResult.rows.length === 0) {
        return NextResponse.json({ success: false, error: "Credenciais inválidas" }, { status: 401 })
      }

      const user = userResult.rows[0]

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password)
      if (!isValidPassword) {
        return NextResponse.json({ success: false, error: "Credenciais inválidas" }, { status: 401 })
      }

      // Check if this is the admin user
      const isAdmin = user.email === 'admin@ezpods.com'

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email,
          name: user.name,
          isAdmin: isAdmin
        },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: isAdmin ? '24h' : '7d' }
      )

      // Set appropriate authentication cookie
      const cookieName = isAdmin ? "admin_token" : "user_token"
      const maxAge = isAdmin ? 60 * 60 * 24 : 60 * 60 * 24 * 7 // 1 day for admin, 7 days for users

      cookies().set(cookieName, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: maxAge,
        path: "/",
      })

      console.log(`=== COOKIE SET ===`)
      console.log(`Cookie name: ${cookieName}`)
      console.log(`Token length: ${token.length}`)
      console.log(`Max age: ${maxAge}`)
      console.log(`=== END COOKIE SET ===`)

      return NextResponse.json({
        success: true,
        isAdmin: isAdmin,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          whatsapp: user.whatsapp
        }
      })

    } finally {
      client.release()
    }

  } catch (error) {
    console.error("Erro de login:", error)
    return NextResponse.json({ success: false, error: "Erro interno do servidor" }, { status: 500 })
  }
}
