import { NextRequest, NextResponse } from 'next/server'
import { calculateShipping, isWithinDeliveryArea } from '@/lib/shipping'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cep, cart_total } = body

    // Validação
    if (!cep) {
      return NextResponse.json(
        { error: 'CEP é obrigatório' },
        { status: 400 }
      )
    }

    if (typeof cart_total !== 'number' || cart_total < 0) {
      return NextResponse.json(
        { error: 'Valor do carrinho inválido' },
        { status: 400 }
      )
    }

    console.log('Calculando frete para:', { cep, cart_total })

    // Calcula o frete
    const result = await calculateShipping({
      cep,
      cart_total
    })

    // Verifica se está dentro da área de entrega
    const withinArea = isWithinDeliveryArea(result.distance_km)

    if (!withinArea) {
      return NextResponse.json(
        { 
          error: 'CEP fora da área de entrega',
          max_distance_km: 50,
          distance_km: result.distance_km
        },
        { status: 400 }
      )
    }

    console.log('Frete calculado:', result)

    return NextResponse.json({
      success: true,
      ...result
    })
  } catch (error: any) {
    console.error('Erro ao calcular frete:', error)
    
    return NextResponse.json(
      { 
        error: error.message || 'Erro ao calcular frete',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
