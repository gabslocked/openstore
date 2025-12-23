import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'
import jwt from 'jsonwebtoken'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function GET(request: NextRequest) {
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

    const client = await pool.connect()

    try {
      // Vendas de hoje
      const todaySales = await client.query(`
        SELECT 
          COUNT(*) as count,
          COALESCE(SUM(total), 0) as total
        FROM orders
        WHERE DATE(created_at) = CURRENT_DATE
          AND status IN ('paid', 'processing', 'shipped', 'delivered')
      `)

      // Vendas da semana
      const weekSales = await client.query(`
        SELECT 
          COUNT(*) as count,
          COALESCE(SUM(total), 0) as total
        FROM orders
        WHERE created_at >= DATE_TRUNC('week', CURRENT_DATE)
          AND status IN ('paid', 'processing', 'shipped', 'delivered')
      `)

      // Vendas do mês
      const monthSales = await client.query(`
        SELECT 
          COUNT(*) as count,
          COALESCE(SUM(total), 0) as total
        FROM orders
        WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
          AND status IN ('paid', 'processing', 'shipped', 'delivered')
      `)

      // Pedidos por status
      const ordersByStatus = await client.query(`
        SELECT 
          status,
          COUNT(*) as count
        FROM orders
        GROUP BY status
        ORDER BY count DESC
      `)

      // Ticket médio
      const avgTicket = await client.query(`
        SELECT 
          COALESCE(AVG(total), 0) as avg_ticket
        FROM orders
        WHERE status IN ('paid', 'processing', 'shipped', 'delivered')
      `)

      // Frete médio
      const avgShipping = await client.query(`
        SELECT 
          COALESCE(AVG(shipping_cost), 0) as avg_shipping
        FROM orders
        WHERE status IN ('paid', 'processing', 'shipped', 'delivered')
          AND shipping_cost > 0
      `)

      // Produtos mais vendidos (top 10)
      const topProducts = await client.query(`
        SELECT 
          oi.product_name,
          oi.variant_name,
          SUM(oi.quantity) as total_quantity,
          SUM(oi.total_price) as total_revenue,
          COUNT(DISTINCT oi.order_id) as order_count
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE o.status IN ('paid', 'processing', 'shipped', 'delivered')
        GROUP BY oi.product_name, oi.variant_name
        ORDER BY total_quantity DESC
        LIMIT 10
      `)

      // Vendas por dia (últimos 30 dias)
      const salesByDay = await client.query(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as orders,
          COALESCE(SUM(total), 0) as revenue
        FROM orders
        WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
          AND status IN ('paid', 'processing', 'shipped', 'delivered')
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `)

      // Vendas por região (top 10 cidades)
      const salesByRegion = await client.query(`
        SELECT 
          customer_city,
          customer_state,
          COUNT(*) as orders,
          COALESCE(SUM(total), 0) as revenue
        FROM orders
        WHERE status IN ('paid', 'processing', 'shipped', 'delivered')
          AND customer_city IS NOT NULL
        GROUP BY customer_city, customer_state
        ORDER BY orders DESC
        LIMIT 10
      `)

      // Taxa de conversão (pedidos pagos / total de pedidos)
      const conversionRate = await client.query(`
        SELECT 
          COUNT(*) FILTER (WHERE status IN ('paid', 'processing', 'shipped', 'delivered')) as paid_orders,
          COUNT(*) as total_orders,
          CASE 
            WHEN COUNT(*) > 0 THEN 
              (COUNT(*) FILTER (WHERE status IN ('paid', 'processing', 'shipped', 'delivered'))::float / COUNT(*) * 100)
            ELSE 0
          END as conversion_rate
        FROM orders
        WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
      `)

      // Lucro e custos do mês atual
      const profitData = await client.query(`
        SELECT 
          COALESCE(SUM(o.total), 0) as total_revenue,
          COALESCE(SUM(oi.cost_price * oi.quantity), 0) as total_cost,
          COALESCE(SUM(o.total) - SUM(oi.cost_price * oi.quantity), 0) as gross_profit,
          COALESCE(SUM(o.total) * 0.05, 0) as platform_fee,
          COALESCE(SUM(o.total) - SUM(oi.cost_price * oi.quantity) - (SUM(o.total) * 0.05), 0) as net_profit
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.created_at >= DATE_TRUNC('month', CURRENT_DATE)
          AND o.status IN ('paid', 'processing', 'shipped', 'delivered')
      `)

      // Calcula ou atualiza fees do mês atual
      await client.query(`SELECT calculate_monthly_platform_fee(CURRENT_DATE)`)

      return NextResponse.json({
        success: true,
        dashboard: {
          today: {
            orders: parseInt(todaySales.rows[0].count),
            revenue: parseFloat(todaySales.rows[0].total)
          },
          week: {
            orders: parseInt(weekSales.rows[0].count),
            revenue: parseFloat(weekSales.rows[0].total)
          },
          month: {
            orders: parseInt(monthSales.rows[0].count),
            revenue: parseFloat(monthSales.rows[0].total)
          },
          orders_by_status: ordersByStatus.rows.map(row => ({
            status: row.status,
            count: parseInt(row.count)
          })),
          avg_ticket: parseFloat(avgTicket.rows[0].avg_ticket),
          avg_shipping: parseFloat(avgShipping.rows[0].avg_shipping),
          top_products: topProducts.rows.map(row => ({
            product_name: row.product_name,
            variant_name: row.variant_name,
            quantity: parseInt(row.total_quantity),
            revenue: parseFloat(row.total_revenue),
            orders: parseInt(row.order_count)
          })),
          sales_by_day: salesByDay.rows.map(row => ({
            date: row.date,
            orders: parseInt(row.orders),
            revenue: parseFloat(row.revenue)
          })),
          sales_by_region: salesByRegion.rows.map(row => ({
            city: row.customer_city,
            state: row.customer_state,
            orders: parseInt(row.orders),
            revenue: parseFloat(row.revenue)
          })),
          conversion_rate: parseFloat(conversionRate.rows[0].conversion_rate),
          profit: {
            total_revenue: parseFloat(profitData.rows[0].total_revenue),
            total_cost: parseFloat(profitData.rows[0].total_cost),
            gross_profit: parseFloat(profitData.rows[0].gross_profit),
            platform_fee: parseFloat(profitData.rows[0].platform_fee),
            platform_fee_rate: 5.0,
            net_profit: parseFloat(profitData.rows[0].net_profit)
          }
        }
      })
    } finally {
      client.release()
    }
  } catch (error: any) {
    console.error('Error fetching dashboard:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar dashboard', details: error.message },
      { status: 500 }
    )
  }
}
