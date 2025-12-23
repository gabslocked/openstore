import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'
import jwt from 'jsonwebtoken'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// PATCH - Atualiza uma variação
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; variantId: string } }
) {
  try {
    // Verifica autenticação admin
    const adminToken = request.cookies.get('admin_token')?.value
    if (!adminToken) {
      return NextResponse.json({ error: 'Admin authentication required' }, { status: 401 })
    }

    try {
      jwt.verify(adminToken, process.env.JWT_SECRET || 'fallback-secret')
    } catch (error) {
      return NextResponse.json({ error: 'Invalid admin token' }, { status: 401 })
    }

    const { variantId } = params
    const body = await request.json()

    const client = await pool.connect()

    try {
      await client.query('BEGIN')

      // Monta query dinâmica baseada nos campos fornecidos
      const updates: string[] = []
      const values: any[] = []
      let paramCount = 1

      const allowedFields = [
        'name', 'sku', 'price', 'original_price', 'stock',
        'weight_kg', 'color_hex', 'flavor', 'size', 
        'display_order', 'visible'
      ]

      for (const field of allowedFields) {
        if (body[field] !== undefined) {
          updates.push(`${field} = $${paramCount}`)
          values.push(body[field])
          paramCount++
        }
      }

      if (updates.length === 0) {
        return NextResponse.json({ error: 'Nenhum campo para atualizar' }, { status: 400 })
      }

      values.push(variantId)
      const query = `UPDATE product_variants SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`

      const result = await client.query(query, values)

      if (result.rowCount === 0) {
        await client.query('ROLLBACK')
        return NextResponse.json({ error: 'Variação não encontrada' }, { status: 404 })
      }

      // Atualiza imagens se fornecidas
      if (body.images && Array.isArray(body.images)) {
        // Remove imagens antigas
        await client.query('DELETE FROM product_variant_images WHERE variant_id = $1', [variantId])
        
        // Insere novas imagens
        for (let i = 0; i < body.images.length; i++) {
          await client.query(
            'INSERT INTO product_variant_images (variant_id, image_url, display_order) VALUES ($1, $2, $3)',
            [variantId, body.images[i], i]
          )
        }
      }

      await client.query('COMMIT')

      return NextResponse.json({ 
        success: true, 
        variant: result.rows[0] 
      })
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  } catch (error: any) {
    console.error('Error updating variant:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar variação', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE - Remove uma variação
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; variantId: string } }
) {
  try {
    // Verifica autenticação admin
    const adminToken = request.cookies.get('admin_token')?.value
    if (!adminToken) {
      return NextResponse.json({ error: 'Admin authentication required' }, { status: 401 })
    }

    try {
      jwt.verify(adminToken, process.env.JWT_SECRET || 'fallback-secret')
    } catch (error) {
      return NextResponse.json({ error: 'Invalid admin token' }, { status: 401 })
    }

    const { variantId } = params

    const client = await pool.connect()

    try {
      const result = await client.query(
        'DELETE FROM product_variants WHERE id = $1 RETURNING id',
        [variantId]
      )

      if (result.rowCount === 0) {
        return NextResponse.json({ error: 'Variação não encontrada' }, { status: 404 })
      }

      return NextResponse.json({ success: true })
    } finally {
      client.release()
    }
  } catch (error: any) {
    console.error('Error deleting variant:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar variação', details: error.message },
      { status: 500 }
    )
  }
}
