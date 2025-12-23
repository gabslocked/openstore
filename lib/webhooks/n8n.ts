import crypto from 'crypto'

// Configuração do webhook n8n
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL
const N8N_WEBHOOK_SECRET = process.env.N8N_WEBHOOK_SECRET || 'your-secret-key'

export interface WhatsAppNotification {
  event: 'order.created' | 'order.paid' | 'order.shipped' | 'order.delivered' | 'order.cancelled'
  order_id: string
  transaction_id: string
  customer: {
    name: string
    phone: string
    document: string
  }
  order: {
    total: number
    items_count: number
    status: string
    created_at: string
  }
  shipping?: {
    address: string
    city: string
    state: string
    estimated_time: number
  }
}

/**
 * Gera assinatura HMAC para validação do webhook
 */
function generateSignature(payload: string): string {
  return crypto
    .createHmac('sha256', N8N_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex')
}

/**
 * Envia notificação para n8n via webhook
 */
export async function sendWhatsAppNotification(
  notification: WhatsAppNotification
): Promise<boolean> {
  if (!N8N_WEBHOOK_URL) {
    console.warn('⚠️ N8N_WEBHOOK_URL não configurado. Notificação não enviada.')
    return false
  }

  try {
    const payload = JSON.stringify(notification)
    const signature = generateSignature(payload)

    console.log(`📱 Enviando notificação WhatsApp: ${notification.event}`)
    console.log(`   Cliente: ${notification.customer.name}`)
    console.log(`   Telefone: ${notification.customer.phone}`)
    console.log(`   Pedido: ${notification.order_id}`)

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Event-Type': notification.event,
      },
      body: payload,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`n8n webhook failed: ${response.status} - ${errorText}`)
    }

    console.log(`✅ Notificação WhatsApp enviada com sucesso`)
    return true
  } catch (error) {
    console.error('❌ Erro ao enviar notificação WhatsApp:', error)
    // Não falha a operação principal se o webhook falhar
    return false
  }
}

/**
 * Formata número de telefone para WhatsApp (remove caracteres especiais)
 */
export function formatPhoneForWhatsApp(phone: string): string {
  // Remove tudo exceto números
  const cleaned = phone.replace(/\D/g, '')
  
  // Adiciona código do país se não tiver (Brasil = 55)
  if (cleaned.length === 11) {
    return `55${cleaned}` // DDD + número
  }
  
  return cleaned
}

/**
 * Valida se o número de telefone é válido
 */
export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '')
  // Telefone brasileiro: 11 dígitos (DDD + 9 dígitos) ou 10 dígitos (DDD + 8 dígitos)
  return cleaned.length >= 10 && cleaned.length <= 13
}

/**
 * Cria notificação de pedido criado
 */
export function createOrderCreatedNotification(
  order: any
): WhatsAppNotification {
  return {
    event: 'order.created',
    order_id: order.id,
    transaction_id: order.transaction_id,
    customer: {
      name: order.customer_name,
      phone: formatPhoneForWhatsApp(order.customer_phone || ''),
      document: order.customer_document,
    },
    order: {
      total: parseFloat(order.total),
      items_count: order.items?.length || 0,
      status: order.status,
      created_at: order.created_at,
    },
    shipping: order.customer_city ? {
      address: `${order.customer_address}, ${order.customer_number}`,
      city: order.customer_city,
      state: order.customer_state,
      estimated_time: order.shipping_time_minutes || 0,
    } : undefined,
  }
}

/**
 * Cria notificação de pagamento confirmado
 */
export function createOrderPaidNotification(
  order: any
): WhatsAppNotification {
  return {
    event: 'order.paid',
    order_id: order.id,
    transaction_id: order.transaction_id,
    customer: {
      name: order.customer_name,
      phone: formatPhoneForWhatsApp(order.customer_phone || ''),
      document: order.customer_document,
    },
    order: {
      total: parseFloat(order.total),
      items_count: order.items?.length || 0,
      status: 'paid',
      created_at: order.created_at,
    },
    shipping: order.customer_city ? {
      address: `${order.customer_address}, ${order.customer_number}`,
      city: order.customer_city,
      state: order.customer_state,
      estimated_time: order.shipping_time_minutes || 0,
    } : undefined,
  }
}

/**
 * Cria notificação de pedido enviado
 */
export function createOrderShippedNotification(
  order: any
): WhatsAppNotification {
  return {
    event: 'order.shipped',
    order_id: order.id,
    transaction_id: order.transaction_id,
    customer: {
      name: order.customer_name,
      phone: formatPhoneForWhatsApp(order.customer_phone || ''),
      document: order.customer_document,
    },
    order: {
      total: parseFloat(order.total),
      items_count: order.items?.length || 0,
      status: 'shipped',
      created_at: order.created_at,
    },
    shipping: order.customer_city ? {
      address: `${order.customer_address}, ${order.customer_number}`,
      city: order.customer_city,
      state: order.customer_state,
      estimated_time: order.shipping_time_minutes || 0,
    } : undefined,
  }
}
