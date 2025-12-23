import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// Helper function to verify JWT token
async function verifyToken(request: NextRequest) {
  const cookieStore = cookies()
  const token = cookieStore.get('user_token')?.value

  if (!token) {
    return null
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any
    return decoded
  } catch (error) {
    return null
  }
}

// GET - List user addresses
export async function GET(request: NextRequest) {
  try {
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const client = await pool.connect()

    try {
      const result = await client.query(
        `SELECT id, label, street, number, complement, neighborhood, city, state, zip_code, is_default, created_at
         FROM addresses 
         WHERE user_id = $1 
         ORDER BY is_default DESC, created_at ASC`,
        [user.userId]
      )

      return NextResponse.json({ addresses: result.rows })

    } finally {
      client.release()
    }

  } catch (error) {
    console.error('Error fetching addresses:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST - Add new address
export async function POST(request: NextRequest) {
  try {
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { label, street, number, complement, neighborhood, city, state, zip_code, is_default } = await request.json()

    // Validate required fields
    if (!street || !city || !state || !zip_code) {
      return NextResponse.json(
        { error: 'Rua, cidade, estado e CEP são obrigatórios' },
        { status: 400 }
      )
    }

    const client = await pool.connect()

    try {
      await client.query('BEGIN')

      // If this is set as default, unset other default addresses
      if (is_default) {
        await client.query(
          'UPDATE addresses SET is_default = FALSE WHERE user_id = $1',
          [user.userId]
        )
      }

      // Insert new address
      const result = await client.query(
        `INSERT INTO addresses (user_id, label, street, number, complement, neighborhood, city, state, zip_code, is_default)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING id, label, street, number, complement, neighborhood, city, state, zip_code, is_default, created_at`,
        [user.userId, label || 'Casa', street, number, complement, neighborhood, city, state, zip_code, is_default || false]
      )

      await client.query('COMMIT')

      return NextResponse.json({
        message: 'Endereço adicionado com sucesso',
        address: result.rows[0]
      }, { status: 201 })

    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }

  } catch (error) {
    console.error('Error adding address:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// PUT - Update address
export async function PUT(request: NextRequest) {
  try {
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id, label, street, number, complement, neighborhood, city, state, zip_code, is_default } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'ID do endereço é obrigatório' }, { status: 400 })
    }

    const client = await pool.connect()

    try {
      await client.query('BEGIN')

      // Verify address belongs to user
      const addressCheck = await client.query(
        'SELECT id FROM addresses WHERE id = $1 AND user_id = $2',
        [id, user.userId]
      )

      if (addressCheck.rows.length === 0) {
        return NextResponse.json({ error: 'Endereço não encontrado' }, { status: 404 })
      }

      // If this is set as default, unset other default addresses
      if (is_default) {
        await client.query(
          'UPDATE addresses SET is_default = FALSE WHERE user_id = $1 AND id != $2',
          [user.userId, id]
        )
      }

      // Update address
      const result = await client.query(
        `UPDATE addresses 
         SET label = $1, street = $2, number = $3, complement = $4, neighborhood = $5, 
             city = $6, state = $7, zip_code = $8, is_default = $9, updated_at = CURRENT_TIMESTAMP
         WHERE id = $10 AND user_id = $11
         RETURNING id, label, street, number, complement, neighborhood, city, state, zip_code, is_default, updated_at`,
        [label, street, number, complement, neighborhood, city, state, zip_code, is_default, id, user.userId]
      )

      await client.query('COMMIT')

      return NextResponse.json({
        message: 'Endereço atualizado com sucesso',
        address: result.rows[0]
      })

    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }

  } catch (error) {
    console.error('Error updating address:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// DELETE - Remove address
export async function DELETE(request: NextRequest) {
  try {
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const addressId = searchParams.get('id')

    if (!addressId) {
      return NextResponse.json({ error: 'ID do endereço é obrigatório' }, { status: 400 })
    }

    const client = await pool.connect()

    try {
      const result = await client.query(
        'DELETE FROM addresses WHERE id = $1 AND user_id = $2 RETURNING id',
        [addressId, user.userId]
      )

      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Endereço não encontrado' }, { status: 404 })
      }

      return NextResponse.json({ message: 'Endereço removido com sucesso' })

    } finally {
      client.release()
    }

  } catch (error) {
    console.error('Error deleting address:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
