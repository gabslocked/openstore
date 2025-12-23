import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'
import jwt from 'jsonwebtoken'
import { randomUUID } from 'crypto'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// GET - Lista todas as variações de um produto
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const client = await pool.connect()
    
    try {
      const result = await client.query(
        `SELECT 
          v.*,
          COALESCE(
            json_agg(
              json_build_object(
                'id', vi.id,
                'image_url', vi.image_url,
                'display_order', vi.display_order
              ) ORDER BY vi.display_order
            ) FILTER (WHERE vi.id IS NOT NULL),
            '[]'
          ) as images
        FROM product_variants v
        LEFT JOIN product_variant_images vi ON v.id = vi.variant_id
        WHERE v.product_id = $1
        GROUP BY v.id
        ORDER BY v.display_order, v.name`,
        [id]
      )

      return NextResponse.json({ variants: result.rows })
    } finally {
      client.release()
    }
  } catch (error: any) {
    console.error('Error fetching variants:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar variações', details: error.message },
      { status: 500 }
    )
  }
}

// POST - Cria uma nova variação
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const { id: productId } = params
    const body = await request.json()
    const { 
      name, 
      sku, 
      price, 
      original_price, 
      stock, 
      weight_kg,
      color_hex, 
      flavor, 
      size,
      display_order,
      visible,
      images 
    } = body

    const client = await pool.connect()
    const variantId = randomUUID()

    try {
      await client.query('BEGIN')

      // Insere a variação
      await client.query(
        `INSERT INTO product_variants (
          id, product_id, name, sku, price, original_price, stock,
          weight_kg, color_hex, flavor, size, display_order, visible
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
          variantId, 
          productId, 
          name, 
          sku || null, 
          price, 
          original_price || price, 
          stock || 0,
          weight_kg || 0.1,
          color_hex || null, 
          flavor || null, 
          size || null,
          display_order || 0,
          visible !== false
        ]
      )

      // Insere imagens se fornecidas
      if (images && Array.isArray(images)) {
        for (let i = 0; i < images.length; i++) {
          await client.query(
            'INSERT INTO product_variant_images (variant_id, image_url, display_order) VALUES ($1, $2, $3)',
            [variantId, images[i], i]
          )
        }
      }

      await client.query('COMMIT')

      return NextResponse.json({ 
        success: true, 
        variant_id: variantId 
      })
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  } catch (error: any) {
    console.error('Error creating variant:', error)
    return NextResponse.json(
      { error: 'Erro ao criar variação', details: error.message },
      { status: 500 }
    )
  }
}
