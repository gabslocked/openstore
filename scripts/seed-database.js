/**
 * Script para popular banco de dados com dados fictícios
 * Para testar o dashboard e funcionalidades
 */

const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// Dados fictícios
const products = [
  { name: 'Pod Menta Ice', price: 45.00, cost_price: 18.00, stock: 150 },
  { name: 'Pod Morango', price: 42.00, cost_price: 16.50, stock: 200 },
  { name: 'Pod Uva Ice', price: 48.00, cost_price: 19.00, stock: 120 },
  { name: 'Pod Maracujá', price: 46.00, cost_price: 18.50, stock: 180 },
  { name: 'Pod Melancia Ice', price: 44.00, cost_price: 17.50, stock: 160 },
  { name: 'Pod Limão', price: 43.00, cost_price: 17.00, stock: 140 },
  { name: 'Pod Café', price: 50.00, cost_price: 20.00, stock: 100 },
  { name: 'Pod Blueberry', price: 47.00, cost_price: 19.50, stock: 130 },
]

const customers = [
  { name: 'João Silva', email: 'joao@email.com', document: '12345678900', phone: '11999999999', city: 'São Paulo', state: 'SP', cep: '01310100' },
  { name: 'Maria Santos', email: 'maria@email.com', document: '98765432100', phone: '11988888888', city: 'São Paulo', state: 'SP', cep: '04567890' },
  { name: 'Pedro Oliveira', email: 'pedro@email.com', document: '11122233344', phone: '21977777777', city: 'Rio de Janeiro', state: 'RJ', cep: '20040020' },
  { name: 'Ana Costa', email: 'ana@email.com', document: '55566677788', phone: '31966666666', city: 'Belo Horizonte', state: 'MG', cep: '30130100' },
  { name: 'Carlos Souza', email: 'carlos@email.com', document: '99988877766', phone: '41955555555', city: 'Curitiba', state: 'PR', cep: '80010000' },
  { name: 'Juliana Lima', email: 'juliana@email.com', document: '44455566677', phone: '51944444444', city: 'Porto Alegre', state: 'RS', cep: '90010000' },
  { name: 'Roberto Alves', email: 'roberto@email.com', document: '33344455566', phone: '71933333333', city: 'Salvador', state: 'BA', cep: '40010000' },
  { name: 'Fernanda Rocha', email: 'fernanda@email.com', document: '22233344455', phone: '85922222222', city: 'Fortaleza', state: 'CE', cep: '60010000' },
]

async function seedDatabase() {
  const client = await pool.connect()
  
  try {
    console.log('🌱 Iniciando seed do banco de dados...\n')
    
    await client.query('BEGIN')
    
    // 1. Inserir produtos
    console.log('📦 Inserindo produtos...')
    const productIds = []
    
    for (const product of products) {
      const result = await client.query(
        `INSERT INTO products (name, price, cost_price, stock, description, visible, stock_enabled)
         VALUES ($1, $2, $3, $4, $5, true, true)
         RETURNING id`,
        [
          product.name,
          product.price,
          product.cost_price,
          product.stock,
          `Delicioso ${product.name} com sabor intenso e refrescante`
        ]
      )
      productIds.push({ id: result.rows[0].id, ...product })
      console.log(`  ✓ ${product.name}`)
    }
    
    // 2. Criar pedidos dos últimos 30 dias
    console.log('\n🛒 Criando pedidos fictícios...')
    
    const statuses = ['paid', 'paid', 'paid', 'processing', 'shipped', 'delivered']
    let totalOrders = 0
    
    // Criar pedidos para os últimos 30 dias
    for (let day = 29; day >= 0; day--) {
      const ordersPerDay = Math.floor(Math.random() * 5) + 3 // 3-7 pedidos por dia
      
      for (let i = 0; i < ordersPerDay; i++) {
        const customer = customers[Math.floor(Math.random() * customers.length)]
        const status = statuses[Math.floor(Math.random() * statuses.length)]
        
        // Data do pedido
        const orderDate = new Date()
        orderDate.setDate(orderDate.getDate() - day)
        orderDate.setHours(Math.floor(Math.random() * 24))
        orderDate.setMinutes(Math.floor(Math.random() * 60))
        
        // Seleciona 1-3 produtos aleatórios
        const numItems = Math.floor(Math.random() * 3) + 1
        const selectedProducts = []
        const usedIndices = new Set()
        
        while (selectedProducts.length < numItems) {
          const idx = Math.floor(Math.random() * productIds.length)
          if (!usedIndices.has(idx)) {
            usedIndices.add(idx)
            selectedProducts.push(productIds[idx])
          }
        }
        
        // Calcula subtotal
        let subtotal = 0
        const orderItems = selectedProducts.map(product => {
          const quantity = Math.floor(Math.random() * 3) + 1
          const totalPrice = product.price * quantity
          subtotal += totalPrice
          return {
            product_id: product.id,
            product_name: product.name,
            quantity,
            unit_price: product.price,
            cost_price: product.cost_price,
            total_price: totalPrice
          }
        })
        
        // Calcula frete
        const shippingCost = Math.max(10, Math.random() * 30)
        const shippingDistance = Math.random() * 20 + 2
        const shippingTime = Math.floor(shippingDistance * 2.5)
        
        const total = subtotal + shippingCost
        
        // Cria pedido
        const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const externalId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        
        const orderResult = await client.query(
          `INSERT INTO orders (
            transaction_id, external_id,
            customer_name, customer_document, customer_email, customer_phone,
            customer_cep, customer_address, customer_number, customer_city, customer_state,
            shipping_distance_km, shipping_cost, shipping_time_minutes,
            subtotal, total, status, created_at, paid_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
          RETURNING id`,
          [
            transactionId,
            externalId,
            customer.name,
            customer.document,
            customer.email,
            customer.phone,
            customer.cep,
            'Rua Exemplo, 123',
            '123',
            customer.city,
            customer.state,
            shippingDistance,
            shippingCost,
            shippingTime,
            subtotal,
            total,
            status,
            orderDate,
            status !== 'pending' ? orderDate : null
          ]
        )
        
        const orderId = orderResult.rows[0].id
        
        // Insere itens do pedido
        for (const item of orderItems) {
          await client.query(
            `INSERT INTO order_items (
              order_id, product_id, product_name,
              quantity, unit_price, cost_price, total_price
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              orderId,
              item.product_id,
              item.product_name,
              item.quantity,
              item.unit_price,
              item.cost_price,
              item.total_price
            ]
          )
        }
        
        totalOrders++
      }
    }
    
    console.log(`  ✓ ${totalOrders} pedidos criados`)
    
    await client.query('COMMIT')
    
    console.log('\n✅ Seed concluído com sucesso!')
    console.log('\n📊 Resumo:')
    console.log(`  - ${products.length} produtos`)
    console.log(`  - ${totalOrders} pedidos`)
    console.log(`  - ${customers.length} clientes diferentes`)
    console.log(`  - Últimos 30 dias de dados`)
    
    // Mostra estatísticas
    const stats = await client.query(`
      SELECT 
        COUNT(*) as total_orders,
        COUNT(*) FILTER (WHERE status IN ('paid', 'processing', 'shipped', 'delivered')) as paid_orders,
        COALESCE(SUM(total) FILTER (WHERE status IN ('paid', 'processing', 'shipped', 'delivered')), 0) as total_revenue
      FROM orders
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
    `)
    
    console.log('\n📈 Estatísticas (últimos 30 dias):')
    console.log(`  - Total de pedidos: ${stats.rows[0].total_orders}`)
    console.log(`  - Pedidos pagos: ${stats.rows[0].paid_orders}`)
    console.log(`  - Faturamento: R$ ${parseFloat(stats.rows[0].total_revenue).toFixed(2)}`)
    
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('❌ Erro ao fazer seed:', error)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

// Executa seed
seedDatabase()
  .then(() => {
    console.log('\n🎉 Pronto! Acesse o dashboard em /admin/dashboard')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Erro fatal:', error)
    process.exit(1)
  })
