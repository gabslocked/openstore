import { NextRequest, NextResponse } from 'next/server'
import { savePaymentStatus } from '@/lib/payment-store'
import { createOrder } from '@/lib/orders'
import { getPaymentGateway, hasPaymentGateway } from '@/lib/adapters/out/payment-gateways'

// Document validation utilities
function isValidDocument(document: string): boolean {
  const cleaned = document.replace(/\D/g, '')
  if (cleaned.length === 11) return isValidCPF(cleaned)
  if (cleaned.length === 14) return isValidCNPJ(cleaned)
  return false
}

function isValidCPF(cpf: string): boolean {
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false
  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(cpf[i]) * (10 - i)
  let digit = (sum * 10) % 11
  if (digit === 10) digit = 0
  if (digit !== parseInt(cpf[9])) return false
  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(cpf[i]) * (11 - i)
  digit = (sum * 10) % 11
  if (digit === 10) digit = 0
  return digit === parseInt(cpf[10])
}

function isValidCNPJ(cnpj: string): boolean {
  if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  let sum = 0
  for (let i = 0; i < 12; i++) sum += parseInt(cnpj[i]) * weights1[i]
  let digit = sum % 11
  digit = digit < 2 ? 0 : 11 - digit
  if (digit !== parseInt(cnpj[12])) return false
  sum = 0
  for (let i = 0; i < 13; i++) sum += parseInt(cnpj[i]) * weights2[i]
  digit = sum % 11
  digit = digit < 2 ? 0 : 11 - digit
  return digit === parseInt(cnpj[13])
}

function formatDocument(document: string): string {
  return document.replace(/\D/g, '')
}

export async function POST(request: NextRequest) {
  try {
    // Check if payment gateway is configured
    if (!hasPaymentGateway()) {
      return NextResponse.json(
        { error: 'Nenhum gateway de pagamento configurado. Configure em Admin → Integrações.' },
        { status: 503 }
      )
    }

    const gateway = getPaymentGateway()
    if (!gateway) {
      return NextResponse.json(
        { error: 'Gateway de pagamento não disponível' },
        { status: 503 }
      )
    }

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
    const description = `Pedido - ${items.length} ${items.length === 1 ? 'item' : 'itens'}`

    // Gera ID externo único
    const externalId = `order_${Date.now()}_${Math.random().toString(36).substring(7)}`

    // URL do webhook
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const callbackUrl = `${siteUrl}/api/payments/webhook`

    console.log('=== CRIANDO PAGAMENTO ===')
    console.log('Gateway:', gateway.name)
    console.log('Total:', totalAmount)
    console.log('Cliente:', customer.name)
    console.log('Documento:', formatDocument(customer.document))
    console.log('Callback URL:', callbackUrl)

    // Cria o pagamento via gateway configurado
    const payment = await gateway.createPayment({
      amount: totalAmount,
      description,
      customer: {
        name: customer.name,
        document: formatDocument(customer.document),
        email: customer.email,
      },
      externalId,
      callbackUrl,
    })

    console.log('=== RESPOSTA DO GATEWAY ===')
    console.log('Payment response:', JSON.stringify(payment, null, 2))

    // Salva o status inicial do pagamento
    savePaymentStatus({
      transaction_id: payment.transactionId,
      status: 'pending',
      amount: payment.amount,
      external_id: externalId,
    })

    // Salva o pedido no banco de dados
    try {
      const shippingCost = shipping?.cost || 0
      const orderId = await createOrder({
        transaction_id: payment.transactionId,
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
        transaction_id: payment.transactionId,
        qr_code: payment.pixData?.qrCode || '',
        qr_code_base64: payment.pixData?.qrCodeBase64 || '',
        amount: payment.amount,
        expires_at: payment.expiresAt?.toISOString(),
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
