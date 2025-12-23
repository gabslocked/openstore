"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, Loader2, Eye, ShoppingBag } from "lucide-react"
import Link from "next/link"
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"

export default function MinhasComprasPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (user) {
      fetchOrders()
    }
  }, [user, authLoading, router])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/user/orders', {
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
        throw new Error(data.error || 'Erro ao buscar pedidos')
      }

      setOrders(data.orders)
    } catch (error: any) {
      console.error('Error fetching orders:', error)
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

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
          <ShoppingBag className="mr-3 h-8 w-8" />
          Minhas Compras
        </h1>
        <p className="text-gray-400">Histórico completo dos seus pedidos</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <Card className="bg-gray-800/50 border-gray-600/30">
          <CardContent className="py-12 text-center">
            <Package className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-2">
              Você ainda não fez nenhuma compra
            </p>
            <Link href="/">
              <Button className="mt-4 bg-green-600 hover:bg-green-500">
                Começar a Comprar
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="text-gray-400 mb-4">
            {orders.length} pedido(s) encontrado(s)
          </div>
          
          {orders.map((order) => (
            <Card key={order.id} className="bg-gray-800/50 border-gray-600/30 hover:border-gray-500/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-white font-semibold text-lg mb-1">
                      Pedido #{order.external_id?.slice(-8) || order.id.slice(-8)}
                    </div>
                    <div className="text-gray-400 text-sm">
                      {format(new Date(order.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-gray-400">Itens:</span>
                    <span className="text-white ml-2 font-medium">{order.items_count}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Total:</span>
                    <span className="text-white ml-2 font-semibold">
                      R$ {parseFloat(order.total).toFixed(2)}
                    </span>
                  </div>
                  {order.customer_city && (
                    <div className="col-span-2">
                      <span className="text-gray-400">Entrega:</span>
                      <span className="text-white ml-2">
                        {order.customer_city} - {order.customer_state}
                      </span>
                    </div>
                  )}
                  {order.paid_at && (
                    <div className="col-span-2">
                      <span className="text-gray-400">Pago em:</span>
                      <span className="text-white ml-2">
                        {format(new Date(order.paid_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                  )}
                </div>

                <Link href={`/account/my-orders/${order.id}`}>
                  <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-700">
                    <Eye className="mr-2 h-4 w-4" />
                    Ver Detalhes
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
