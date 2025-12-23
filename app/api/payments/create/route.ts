import { NextRequest, NextResponse } from 'next/server'
import { createPayment, isValidDocument, formatDocument } from '@/lib/greenpag'
import { savePaymentStatus } from '@/lib/payment-store'
import { createOrder } from '@/lib/orders'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items, customer, shipping, utm } = body

    // Validação dos dados
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Carrinho vazio ou inválido' },
        { status: 400 }
      )
    }

    if (!customer || !customer.name || !customer.document) {
      return NextResponse.json(
        { error: 'Dados do cliente incompletos' },
        { status: 400 }
      )
    }

    // Valida CPF/CNPJ
    if (!isValidDocument(customer.document)) {
      return NextResponse.json(
        { error: 'CPF/CNPJ inválido' },
        { status: 400 }
      )
    }

    // Calcula o total do carrinho
    const totalAmount = items.reduce((sum: number, item: any) => {
      return sum + (item.totalPrice || item.price * item.quantity)
    }, 0)

    if (totalAmount <= 0) {
      return NextResponse.json(
        { error: 'Valor total inválido' },
        { status: 400 }
      )
    }

    // Gera descrição do pedido
    const description = `Pedido EzPods - ${items.length} ${items.length === 1 ? 'item' : 'itens'}`

    // Gera ID externo único
    const externalId = `ezpods_${Date.now()}_${Math.random().toString(36).substring(7)}`

    // URL do webhook (ajuste conforme seu domínio)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ezpods.vercel.app'
    const callbackUrl = `${siteUrl}/api/payments/webhook`

    console.log('=== CRIANDO PAGAMENTO GREENPAG ===')
    console.log('Total:', totalAmount)
    console.log('Cliente:', customer.name)
    console.log('Documento:', formatDocument(customer.document))
    console.log('Callback URL:', callbackUrl)

    // Cria o pagamento no GreenPag
    const payment = await createPayment({
      amount: totalAmount,
      description,
      customer: {
        name: customer.name,
        document: formatDocument(customer.document),
        email: customer.email,
      },
      external_id: externalId,
      callback_url: callbackUrl,
      utm: utm || undefined,
    })

    console.log('=== RESPOSTA GREENPAG ===')
    console.log('Payment response:', JSON.stringify(payment, null, 2))

    // Salva o status inicial do pagamento
    savePaymentStatus({
      transaction_id: payment.transaction_id,
      status: 'pending',
      amount: payment.amount,
      external_id: externalId,
    })

    // Salva o pedido no banco de dados
    try {
      const shippingCost = shipping?.cost || 0
      const orderId = await createOrder({
        transaction_id: payment.transaction_id,
        external_id: externalId,
        customer: {
          name: customer.name,
          document: formatDocument(customer.document),
          email: customer.email,
          phone: customer.phone,
          cep: customer.cep || shipping?.cep,
          address: customer.address || shipping?.address,
          number: customer.number,
          complement: customer.complement,
          neighborhood: customer.neighborhood || shipping?.neighborhood,
          city: customer.city || shipping?.city,
          state: customer.state || shipping?.state,
        },
        shipping: {
          distance_km: shipping?.distance_km || 0,
          cost: shippingCost,
          time_minutes: shipping?.estimated_time_minutes || 0,
        },
        items: items.map((item: any) => ({
          product_id: item.productId || item.id,
          variant_id: item.variantId || item.variant_id,
          product_name: item.name || item.productName,
          variant_name: item.variantName || item.variant_name,
          sku: item.sku,
          quantity: item.quantity,
          unit_price: item.price || item.unit_price,
          total_price: item.totalPrice || (item.price * item.quantity),
          image_url: item.image || item.productImage,
        })),
        subtotal: totalAmount,
        total: totalAmount + shippingCost,
        delivery_notes: customer.notes,
      })
      
      console.log(`✅ Pedido criado no banco: ${orderId}`)
    } catch (error) {
      console.error('Erro ao salvar pedido no banco:', error)
      // Não falha a criação do pagamento se houver erro ao salvar o pedido
    }

    return NextResponse.json({
      success: true,
      payment: {
        transaction_id: payment.transaction_id,
        qr_code: payment.qr_code,
        qr_code_base64: payment.qr_code_base64,
        amount: payment.amount,
        expires_at: payment.expires_at,
        external_id: externalId,
      },
    })
  } catch (error: any) {
    console.error('Error creating payment:', error)
    
    return NextResponse.json(
      { 
        error: 'Erro ao criar pagamento',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
