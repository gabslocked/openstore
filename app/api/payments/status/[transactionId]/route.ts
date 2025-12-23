import { NextRequest, NextResponse } from 'next/server'
import { getPaymentStatus } from '@/lib/payment-store'

export async function GET(
  request: NextRequest,
  { params }: { params: { transactionId: string } }
) {
  try {
    const { transactionId } = params

    if (!transactionId) {
      return NextResponse.json(
        { error: 'Transaction ID não fornecido' },
        { status: 400 }
      )
    }

    console.log('Consultando status do pagamento:', transactionId)

    // Consulta o status no armazenamento em memória
    const paymentStatus = getPaymentStatus(transactionId)

    if (!paymentStatus) {
      return NextResponse.json({
        transaction_id: transactionId,
        status: 'pending',
        message: 'Aguardando pagamento',
      })
    }

    console.log('Status retornado:', paymentStatus)

    return NextResponse.json({
      transaction_id: paymentStatus.transaction_id,
      status: paymentStatus.status, // pending, paid, failed, expired
      amount: paymentStatus.amount,
      paid_at: paymentStatus.paid_at,
      message: paymentStatus.status === 'paid' ? 'Pagamento confirmado' : 'Aguardando pagamento',
    })
  } catch (error: any) {
    console.error('Error checking payment status:', error)
    
    return NextResponse.json(
      { 
        error: 'Erro ao consultar status do pagamento',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
