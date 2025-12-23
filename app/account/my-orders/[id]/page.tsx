"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, ArrowLeft, Loader2, MapPin, Truck } from "lucide-react"
import Link from "next/link"
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"

export default function MinhaCompraDetalhesPage({ params }: { params: { id: string } }) {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [order, setOrder] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (user) {
      fetchOrder()
    }
  }, [user, authLoading, router, params.id])

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/user/orders/${params.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user?.email,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao carregar pedido')
      }

      setOrder(data.order)
    } catch (error: any) {
      console.error('Error fetching order:', error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
      paid: 'bg-green-500/20 text-green-400 border-green-500/50',
      processing: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
      shipped: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
      delivered: 'bg-green-600/20 text-green-300 border-green-600/50',
      cancelled: 'bg-red-500/20 text-red-400 border-red-500/50',
      failed: 'bg-red-600/20 text-red-300 border-red-600/50',
    }
    return colors[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/50'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Aguardando Pagamento',
      paid: 'Pago',
      processing: 'Processando',
      shipped: 'Enviado',
      delivered: 'Entregue',
      cancelled: 'Cancelado',
      failed: 'Falhou',
    }
    return labels[status] || status
  }

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="p-8">
        <div className="bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg">
          {error || 'Pedido não encontrado'}
        </div>
        <Link href="/account/my-orders">
          <Button className="mt-4" variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/account/my-orders">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">
              Pedido #{order.external_id?.slice(-8) || order.id.slice(-8)}
            </h1>
            <p className="text-gray-400">
              {format(new Date(order.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
            </p>
          </div>
        </div>
        <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
          {getStatusLabel(order.status)}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Endereço de Entrega */}
        <Card className="bg-gray-800/50 border-gray-600/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <MapPin className="mr-2 h-5 w-5" />
              Endereço de Entrega
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-gray-400 text-sm">CEP</div>
              <div className="text-white font-medium">{order.customer_cep}</div>
            </div>
            {order.customer_address && (
              <div>
                <div className="text-gray-400 text-sm">Endereço</div>
                <div className="text-white font-medium">
                  {order.customer_address}, {order.customer_number}
                  {order.customer_complement && ` - ${order.customer_complement}`}
                </div>
              </div>
            )}
            {order.customer_city && (
              <div>
                <div className="text-gray-400 text-sm">Cidade</div>
                <div className="text-white font-medium">
                  {order.customer_city} - {order.customer_state}
                </div>
              </div>
            )}
            {order.shipping_distance_km && (
              <div>
                <div className="text-gray-400 text-sm flex items-center">
                  <Truck className="mr-1 h-3 w-3" />
                  Frete
                </div>
                <div className="text-white font-medium">
                  {order.shipping_distance_km} km • R$ {parseFloat(order.shipping_cost || 0).toFixed(2)}
                </div>
                {order.shipping_time_minutes && (
                  <div className="text-gray-400 text-xs">
                    Tempo estimado: ~{order.shipping_time_minutes} minutos
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Timeline do Pedido */}
        <Card className="bg-gray-800/50 border-gray-600/30">
          <CardHeader>
            <CardTitle className="text-white">Status do Pedido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                <div className="flex-1">
                  <div className="text-white font-medium">Pedido Criado</div>
                  <div className="text-gray-400 text-sm">
                    {format(new Date(order.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </div>
                </div>
              </div>

              {order.paid_at && (
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                  <div className="flex-1">
                    <div className="text-white font-medium">Pagamento Confirmado</div>
                    <div className="text-gray-400 text-sm">
                      {format(new Date(order.paid_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </div>
                  </div>
                </div>
              )}

              {order.shipped_at && (
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
                  <div className="flex-1">
                    <div className="text-white font-medium">Pedido Enviado</div>
                    <div className="text-gray-400 text-sm">
                      {format(new Date(order.shipped_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </div>
                  </div>
                </div>
              )}

              {order.delivered_at && (
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-green-600 mt-2"></div>
                  <div className="flex-1">
                    <div className="text-white font-medium">Pedido Entregue</div>
                    <div className="text-gray-400 text-sm">
                      {format(new Date(order.delivered_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Itens do Pedido */}
      <Card className="bg-gray-800/50 border-gray-600/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Package className="mr-2 h-5 w-5" />
            Itens do Pedido
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.items.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between border-b border-gray-700 pb-4 last:border-0">
                <div className="flex-1">
                  <div className="text-white font-medium">
                    {item.product_name}
                    {item.variant_name && (
                      <span className="text-gray-400 text-sm ml-2">
                        ({item.variant_name})
                      </span>
                    )}
                  </div>
                  {item.sku && (
                    <div className="text-gray-400 text-xs">SKU: {item.sku}</div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">
                    {item.quantity}x R$ {parseFloat(item.unit_price).toFixed(2)}
                  </div>
                  <div className="text-green-400 font-semibold">
                    R$ {parseFloat(item.total_price).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-2 border-t border-gray-700 pt-4">
            <div className="flex justify-between text-gray-300">
              <span>Subtotal</span>
              <span>R$ {parseFloat(order.subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Frete</span>
              <span>R$ {parseFloat(order.shipping_cost || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-white font-bold text-lg border-t border-gray-700 pt-2">
              <span>Total</span>
              <span>R$ {parseFloat(order.total).toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
