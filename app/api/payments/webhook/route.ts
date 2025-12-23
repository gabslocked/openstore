import { NextRequest, NextResponse } from 'next/server'
import { validateWebhookSignature, parseWebhook } from '@/lib/greenpag'
import { savePaymentStatus } from '@/lib/payment-store'
import { updateOrderStatus, getOrderByTransactionId } from '@/lib/orders'
import { sendWhatsAppNotification, createOrderPaidNotification } from '@/lib/webhooks/n8n'

// Configuração para desabilitar o body parser e ler o raw body
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Lê o corpo da requisição como texto
    const payload = await request.text()
    
    // Pega a assinatura do header
    const signature = request.headers.get('X-Signature') || request.headers.get('x-signature')

    if (!signature) {
      console.error('Webhook sem assinatura')
      return NextResponse.json(
        { error: 'Assinatura não fornecida' },
        { status: 401 }
      )
    }

    // Valida a assinatura do webhook
    const isValid = validateWebhookSignature(payload, signature)

    if (!isValid) {
      console.error('Assinatura inválida do webhook')
      return NextResponse.json(
        { error: 'Assinatura inválida' },
        { status: 401 }
      )
    }

    // Parse do payload
    const webhookData = parseWebhook(payload)

    console.log('Webhook recebido:', {
      event: webhookData.event,
      transaction_id: webhookData.transaction_id,
      status: webhookData.status,
      amount: webhookData.amount,
    })

    // Processa o evento
    switch (webhookData.event) {
      case 'payment.received':
        console.log(`Pagamento recebido: ${webhookData.transaction_id}`)
        savePaymentStatus({
          transaction_id: webhookData.transaction_id,
          status: 'pending',
          amount: webhookData.amount,
          external_id: webhookData.external_id,
        })
        break

      case 'payment.confirmed':
        console.log(`Pagamento confirmado: ${webhookData.transaction_id}`)
        savePaymentStatus({
          transaction_id: webhookData.transaction_id,
          status: 'paid',
          amount: webhookData.amount,
          paid_at: webhookData.paid_at,
          external_id: webhookData.external_id,
        })
        
        // Atualiza status do pedido no banco de dados
        try {
          await updateOrderStatus(webhookData.transaction_id, 'paid')
          console.log(`✅ Pedido marcado como pago: ${webhookData.transaction_id}`)
          
          // Envia notificação WhatsApp via n8n
          const order = await getOrderByTransactionId(webhookData.transaction_id)
          if (order && order.customer_phone) {
            sendWhatsAppNotification(createOrderPaidNotification(order))
              .catch(err => console.error('Erro ao enviar notificação WhatsApp:', err))
          }
        } catch (error) {
          console.error('Erro ao atualizar status do pedido:', error)
          // Não falha o webhook se o pedido não existir ainda
        }
        break

      case 'payment.failed':
        console.log(`Pagamento falhou: ${webhookData.transaction_id}`)
        savePaymentStatus({
          transaction_id: webhookData.transaction_id,
          status: 'failed',
          amount: webhookData.amount,
          external_id: webhookData.external_id,
        })
        
        // Atualiza status do pedido
        try {
          await updateOrderStatus(webhookData.transaction_id, 'failed')
        } catch (error) {
          console.error('Erro ao atualizar status do pedido:', error)
        }
        break

      case 'payment.expired':
        console.log(`Pagamento expirou: ${webhookData.transaction_id}`)
        savePaymentStatus({
          transaction_id: webhookData.transaction_id,
          status: 'expired',
          amount: webhookData.amount,
          external_id: webhookData.external_id,
        })
        break

      default:
        console.log(`Evento desconhecido: ${webhookData.event}`)
    }

    // Retorna 200 OK para confirmar recebimento
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error('Erro ao processar webhook:', error)
    
    // Retorna 500 para que o GreenPag tente reenviar
    return NextResponse.json(
      { 
        error: 'Erro ao processar webhook',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
