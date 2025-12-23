import { NextRequest, NextResponse } from 'next/server'
import { getOrderByTransactionId, updateOrderStatus } from '@/lib/orders'
import jwt from 'jsonwebtoken'
import { Pool } from 'pg'
import { sendWhatsAppNotification, createOrderShippedNotification } from '@/lib/webhooks/n8n'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// GET - Busca detalhes de um pedido
export async function GET(
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

    const { id } = params

    // Busca por transaction_id ou order id
    const client = await pool.connect()
    
    try {
      const result = await client.query(
        `SELECT 
          o.*,
          COALESCE(
            json_agg(
              json_build_object(
                'id', oi.id,
                'product_id', oi.product_id,
                'variant_id', oi.variant_id,
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
        WHERE o.id = $1 OR o.transaction_id = $1
        GROUP BY o.id`,
        [id]
      )

      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
      }

      return NextResponse.json({ order: result.rows[0] })
    } finally {
      client.release()
    }
  } catch (error: any) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar pedido', details: error.message },
      { status: 500 }
    )
  }
}

// PATCH - Atualiza status do pedido
export async function PATCH(
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

    const { id } = params
    const body = await request.json()
    const { status } = body

    if (!status) {
      return NextResponse.json({ error: 'Status é obrigatório' }, { status: 400 })
    }

    const validStatuses = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'failed']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Status inválido' }, { status: 400 })
    }

    await updateOrderStatus(id, status)

    // Envia notificação WhatsApp se o status for "shipped"
    if (status === 'shipped') {
      try {
        const order = await getOrderByTransactionId(id)
        if (order && order.customer_phone) {
          sendWhatsAppNotification(createOrderShippedNotification(order))
            .catch(err => console.error('Erro ao enviar notificação WhatsApp:', err))
        }
      } catch (error) {
        console.error('Erro ao buscar pedido para notificação:', error)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error updating order status:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar status', details: error.message },
      { status: 500 }
    )
  }
}
