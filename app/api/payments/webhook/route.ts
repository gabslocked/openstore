import { NextRequest, NextResponse } from 'next/server'
import { savePaymentStatus } from '@/lib/payment-store'
import { updateOrderStatus, getOrderByTransactionId } from '@/lib/orders'
import { sendWhatsAppNotification, createOrderPaidNotification } from '@/lib/webhooks/n8n'
import { getPaymentGateway } from '@/lib/adapters/out/payment-gateways'

// Configuração para desabilitar o body parser e ler o raw body
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const gateway = getPaymentGateway()
    
    // Lê o corpo da requisição como texto
    const payload = await request.text()
    
    // Pega a assinatura do header (diferentes gateways usam diferentes headers)
    const signature = request.headers.get('X-Signature') || 
                      request.headers.get('x-signature') ||
                      request.headers.get('Stripe-Signature') ||
                      request.headers.get('x-webhook-signature') || ''

    // Se não há gateway configurado, apenas loga e retorna OK
    if (!gateway) {
      console.warn('Webhook recebido mas nenhum gateway configurado')
      return NextResponse.json({ success: true, warning: 'No gateway configured' }, { status: 200 })
    }

    // Valida o webhook usando o gateway configurado
    const validation = gateway.validateWebhook(payload, signature)

    if (!validation.isValid) {
      console.error('Webhook inválido:', validation.error)
      return NextResponse.json(
        { error: validation.error || 'Webhook inválido' },
        { status: 401 }
      )
    }

    const webhookData = validation.payload!

    console.log('Webhook recebido:', {
      event: webhookData.event,
      transactionId: webhookData.transactionId,
      status: webhookData.status,
      amount: webhookData.amount,
    })

    // Processa baseado no status do pagamento
    const status = webhookData.status
    
    if (status === 'pending' || status === 'processing') {
      console.log(`Pagamento recebido: ${webhookData.transactionId}`)
      savePaymentStatus({
        transaction_id: webhookData.transactionId,
        status: 'pending',
        amount: webhookData.amount,
        external_id: webhookData.externalId,
      })
    } else if (status === 'paid') {
      console.log(`Pagamento confirmado: ${webhookData.transactionId}`)
      savePaymentStatus({
        transaction_id: webhookData.transactionId,
        status: 'paid',
        amount: webhookData.amount,
        paid_at: webhookData.paidAt?.toISOString(),
        external_id: webhookData.externalId,
      })
      
      // Atualiza status do pedido no banco de dados
      try {
        await updateOrderStatus(webhookData.transactionId, 'paid')
        console.log(`✅ Pedido marcado como pago: ${webhookData.transactionId}`)
        
        // Envia notificação WhatsApp via n8n
        const order = await getOrderByTransactionId(webhookData.transactionId)
        if (order && order.customer_phone) {
          sendWhatsAppNotification(createOrderPaidNotification(order))
            .catch(err => console.error('Erro ao enviar notificação WhatsApp:', err))
        }
      } catch (error) {
        console.error('Erro ao atualizar status do pedido:', error)
      }
    } else if (status === 'failed' || status === 'cancelled') {
      console.log(`Pagamento falhou: ${webhookData.transactionId}`)
      savePaymentStatus({
        transaction_id: webhookData.transactionId,
        status: 'failed',
        amount: webhookData.amount,
        external_id: webhookData.externalId,
      })
      
      try {
        await updateOrderStatus(webhookData.transactionId, 'failed')
      } catch (error) {
        console.error('Erro ao atualizar status do pedido:', error)
      }
    } else if (status === 'expired') {
      console.log(`Pagamento expirou: ${webhookData.transactionId}`)
      savePaymentStatus({
        transaction_id: webhookData.transactionId,
        status: 'expired',
        amount: webhookData.amount,
        external_id: webhookData.externalId,
      })
    } else {
      console.log(`Status desconhecido: ${status}`)
    }

    // Retorna 200 OK para confirmar recebimento
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error('Erro ao processar webhook:', error)
    
    // Retorna 500 para que o gateway tente reenviar
    return NextResponse.json(
      { 
        error: 'Erro ao processar webhook',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
