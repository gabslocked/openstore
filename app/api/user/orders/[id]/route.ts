import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { document, email } = body
    const { id } = params

    if (!document && !email) {
      return NextResponse.json(
        { error: 'CPF/CNPJ ou email é obrigatório para verificação' },
        { status: 400 }
      )
    }

    const client = await pool.connect()

    try {
      // Busca o pedido com validação de propriedade
      let query = `
        SELECT 
          o.*,
          COALESCE(
            json_agg(
              json_build_object(
                'id', oi.id,
                'product_name', oi.product_name,
                'variant_name', oi.variant_name,
                'sku', oi.sku,
                'quantity', oi.quantity,
                'unit_price', oi.unit_price,
                'total_price', oi.total_price,
                'product_image_url', oi.product_image_url
              ) ORDER BY oi.created_at
            ) FILTER (WHERE oi.id IS NOT NULL),
            '[]'
          ) as items
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE (o.id = $1 OR o.transaction_id = $1 OR o.external_id = $1)
      `

      const values: any[] = [id]
      let paramCount = 2

      if (document) {
        query += ` AND o.customer_document = $${paramCount}`
        values.push(document.replace(/\D/g, ''))
        paramCount++
      }

      if (email) {
        query += ` AND LOWER(o.customer_email) = LOWER($${paramCount})`
        values.push(email)
        paramCount++
      }

      query += ` GROUP BY o.id`

      const result = await client.query(query, values)

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Pedido não encontrado ou você não tem permissão para visualizá-lo' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        order: result.rows[0]
      })
    } finally {
      client.release()
    }
  } catch (error: any) {
    console.error('Error fetching order details:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar detalhes do pedido', details: error.message },
      { status: 500 }
    )
  }
}
