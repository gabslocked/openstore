import { NextRequest, NextResponse } from 'next/server'
import { listOrders } from '@/lib/orders'
import jwt from 'jsonwebtoken'

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

    // Pega parâmetros de query
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') || undefined
    const customer_document = searchParams.get('customer_document') || undefined
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const filters: any = {}
    if (status) filters.status = status
    if (customer_document) filters.customer_document = customer_document

    const result = await listOrders(filters, page, limit)

    return NextResponse.json({
      success: true,
      orders: result.orders,
      total: result.total,
      page,
      limit,
      total_pages: Math.ceil(result.total / limit)
    })
  } catch (error: any) {
    console.error('Error listing orders:', error)
    return NextResponse.json(
      { error: 'Erro ao listar pedidos', details: error.message },
      { status: 500 }
    )
  }
}
