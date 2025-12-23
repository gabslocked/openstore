import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { Pool } from 'pg'

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/ezpods',
})

// Test database connection on startup
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err)
})

export async function POST(request: NextRequest) {
  console.log('POST /api/auth/register - Starting registration process')
  
  // Check if DATABASE_URL is configured
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not configured')
    return NextResponse.json(
      { error: 'Configuração do banco de dados não encontrada. Configure DATABASE_URL no arquivo .env.local' },
      { status: 500 }
    )
  }
  
  try {
    const { name, email, password, whatsapp, addresses } = await request.json()
    console.log('Registration data received:', { name, email, whatsapp, addressCount: addresses?.length || 0 })

    // Validate required fields
    if (!name || !email || !password) {
      console.log('Validation failed: missing required fields')
      return NextResponse.json(
        { error: 'Nome, email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      )
    }

    const client = await pool.connect()

    try {
      // Check if user already exists
      const existingUser = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      )

      if (existingUser.rows.length > 0) {
        return NextResponse.json(
          { error: 'Email já está em uso' },
          { status: 409 }
        )
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12)

      // Start transaction
      await client.query('BEGIN')

      // Insert user
      const userResult = await client.query(
        `INSERT INTO users (name, email, password, whatsapp) 
         VALUES ($1, $2, $3, $4) 
         RETURNING id, name, email, whatsapp, created_at`,
        [name, email, hashedPassword, whatsapp]
      )

      const user = userResult.rows[0]

      // Insert addresses if provided
      if (addresses && addresses.length > 0) {
        for (let i = 0; i < addresses.length; i++) {
          const address = addresses[i]
          await client.query(
            `INSERT INTO addresses (user_id, label, street, number, complement, neighborhood, city, state, zip_code, is_default)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [
              user.id,
              address.label || 'Casa',
              address.street,
              address.number,
              address.complement,
              address.neighborhood,
              address.city,
              address.state,
              address.zip_code,
              i === 0 // First address is default
            ]
          )
        }
      }

      // Commit transaction
      await client.query('COMMIT')

      // Return user data (without password)
      return NextResponse.json({
        message: 'Usuário criado com sucesso',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          whatsapp: user.whatsapp,
          created_at: user.created_at
        }
      }, { status: 201 })

    } catch (error) {
      // Rollback transaction on error
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }

  } catch (error) {
    console.error('Registration error:', error)
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    
    // Check if it's a database connection error
    if (error && typeof error === 'object' && 'code' in error) {
      console.error('Database error code:', (error as any).code)
      
      // Handle specific database errors
      if ((error as any).code === 'ECONNREFUSED') {
        return NextResponse.json(
          { error: 'Erro de conexão com o banco de dados' },
          { status: 500 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
