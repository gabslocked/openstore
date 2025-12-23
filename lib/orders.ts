import { Pool } from 'pg'
import { randomUUID } from 'crypto'
import { sendWhatsAppNotification, createOrderCreatedNotification } from './webhooks/n8n'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export interface CreateOrderData {
  transaction_id: string
  external_id: string
  customer: {
    name: string
    document: string
    email?: string
    phone?: string
    cep: string
    address?: string
    number?: string
    complement?: string
    neighborhood?: string
    city?: string
    state?: string
  }
  shipping: {
    distance_km: number
    cost: number
    time_minutes: number
  }
  items: Array<{
    product_id: string
    variant_id?: string
    product_name: string
    variant_name?: string
    sku?: string
    quantity: number
    unit_price: number
    cost_price?: number
    total_price: number
    image_url?: string
  }>
  subtotal: number
  total: number
  delivery_notes?: string
}

/**
 * Cria um novo pedido no banco de dados
 */
export async function createOrder(data: CreateOrderData): Promise<string> {
  const client = await pool.connect()
  const orderId = randomUUID()

  try {
    await client.query('BEGIN')

    // Insere o pedido
    await client.query(
      `INSERT INTO orders (
        id, transaction_id, external_id,
        customer_name, customer_document, customer_email, customer_phone,
        customer_cep, customer_address, customer_number, customer_complement,
        customer_neighborhood, customer_city, customer_state,
        shipping_distance_km, shipping_cost, shipping_time_minutes,
        subtotal, total, delivery_notes, status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
      )`,
      [
        orderId,
        data.transaction_id,
        data.external_id,
        data.customer.name,
        data.customer.document,
        data.customer.email || null,
        data.customer.phone || null,
        data.customer.cep,
        data.customer.address || null,
        data.customer.number || null,
        data.customer.complement || null,
        data.customer.neighborhood || null,
        data.customer.city || null,
        data.customer.state || null,
        data.shipping.distance_km,
        data.shipping.cost,
        data.shipping.time_minutes,
        data.subtotal,
        data.total,
        data.delivery_notes || null,
        'pending'
      ]
    )

    // Insere os itens do pedido
    for (const item of data.items) {
      await client.query(
        `INSERT INTO order_items (
          order_id, product_id, variant_id,
          product_name, variant_name, sku,
          quantity, unit_price, cost_price, total_price, product_image_url
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          orderId,
          item.product_id,
          item.variant_id || null,
          item.product_name,
          item.variant_name || null,
          item.sku || null,
          item.quantity,
          item.unit_price,
          item.cost_price || 0,
          item.total_price,
          item.image_url || null
        ]
      )
      // Atualiza estoque se houver variant_id
      if (item.variant_id) {
        const stockResult = await client.query(
          'SELECT stock FROM product_variants WHERE id = $1',
          [item.variant_id]
        )

        if (stockResult.rows.length > 0) {
          const currentStock = stockResult.rows[0].stock
          const newStock = Math.max(0, currentStock - item.quantity)

          await client.query(
            'UPDATE product_variants SET stock = $1 WHERE id = $2',
            [newStock, item.variant_id]
          )

          // Registra movimentação de estoque
          await client.query(
            `INSERT INTO stock_movements (
              variant_id, order_id, movement_type,
              quantity_change, stock_before, stock_after
            ) VALUES ($1, $2, $3, $4, $5, $6)`,
            [item.variant_id, orderId, 'sale', -item.quantity, currentStock, newStock]
          )
        }
      }
    }

    await client.query('COMMIT')

    console.log(`✅ Pedido criado: ${orderId} (Transaction: ${data.transaction_id})`)
    
    // Envia notificação WhatsApp via n8n (não bloqueia se falhar)
    if (data.customer.phone) {
      const order = await getOrderByTransactionId(data.transaction_id)
      if (order) {
        sendWhatsAppNotification(createOrderCreatedNotification(order))
          .catch(err => console.error('Erro ao enviar notificação WhatsApp:', err))
      }
    }
    
    return orderId
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Erro ao criar pedido:', error)
    throw error
  } finally {
    client.release()
  }
}

/**
 * Atualiza o status de um pedido
 */
export async function updateOrderStatus(
  transactionId: string,
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'failed'
): Promise<void> {
  const client = await pool.connect()

  try {
    const timestampField = status === 'paid' ? 'paid_at' :
                          status === 'shipped' ? 'shipped_at' :
                          status === 'delivered' ? 'delivered_at' :
                          status === 'cancelled' ? 'cancelled_at' : null

    let query = 'UPDATE orders SET status = $1'
    const values: any[] = [status]
    let paramCount = 2

    if (timestampField) {
      query += `, ${timestampField} = NOW()`
    }

    query += ` WHERE transaction_id = $${paramCount}`
    values.push(transactionId)

    const result = await client.query(query, values)

    if (result.rowCount === 0) {
      throw new Error(`Pedido não encontrado: ${transactionId}`)
    }

    console.log(`✅ Status do pedido atualizado: ${transactionId} → ${status}`)
  } finally {
    client.release()
  }
}

/**
 * Busca um pedido pelo transaction_id
 */
export async function getOrderByTransactionId(transactionId: string): Promise<any | null> {
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
      WHERE o.transaction_id = $1
      GROUP BY o.id`,
      [transactionId]
    )

    return result.rows[0] || null
  } finally {
    client.release()
  }
}

/**
 * Lista pedidos com filtros
 */
export async function listOrders(
  filters?: {
    status?: string
    customer_document?: string
    date_from?: Date
    date_to?: Date
  },
  page = 1,
  limit = 20
): Promise<{ orders: any[]; total: number }> {
  const client = await pool.connect()

  try {
    const whereConditions: string[] = []
    const values: any[] = []
    let paramCount = 1

    if (filters?.status) {
      whereConditions.push(`status = $${paramCount}`)
      values.push(filters.status)
      paramCount++
    }

    if (filters?.customer_document) {
      whereConditions.push(`customer_document = $${paramCount}`)
      values.push(filters.customer_document)
      paramCount++
    }

    if (filters?.date_from) {
      whereConditions.push(`created_at >= $${paramCount}`)
      values.push(filters.date_from)
      paramCount++
    }

    if (filters?.date_to) {
      whereConditions.push(`created_at <= $${paramCount}`)
      values.push(filters.date_to)
      paramCount++
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : ''

    // Conta total
    const countResult = await client.query(
      `SELECT COUNT(*) as count FROM orders ${whereClause}`,
      values
    )
    const total = parseInt(countResult.rows[0].count)

    // Busca pedidos
    const offset = (page - 1) * limit
    values.push(limit, offset)

    const result = await client.query(
      `SELECT 
        o.*,
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as items_count
      FROM orders o
      ${whereClause}
      ORDER BY o.created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      values
    )

    return {
      orders: result.rows,
      total
    }
  } finally {
    client.release()
  }
}
