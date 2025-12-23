import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { document, email } = body

    if (!document && !email) {
      return NextResponse.json(
        { error: 'CPF/CNPJ ou email é obrigatório' },
        { status: 400 }
      )
    }

    const client = await pool.connect()

    try {
      let query = `
        SELECT 
          o.id,
          o.transaction_id,
          o.external_id,
          o.customer_name,
          o.customer_document,
          o.customer_email,
          o.customer_cep,
          o.customer_city,
          o.customer_state,
          o.shipping_cost,
          o.subtotal,
          o.total,
          o.status,
          o.created_at,
          o.paid_at,
          o.shipped_at,
          o.delivered_at,
          (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as items_count
        FROM orders o
        WHERE 1=1
      `
      
      const values: any[] = []
      let paramCount = 1

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

      query += ` ORDER BY o.created_at DESC LIMIT 50`

      const result = await client.query(query, values)

      return NextResponse.json({
        success: true,
        orders: result.rows
      })
    } finally {
      client.release()
    }
  } catch (error: any) {
    console.error('Error fetching user orders:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar pedidos', details: error.message },
      { status: 500 }
    )
  }
}
