"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Package, ArrowLeft, Loader2, MapPin, User, Phone,
  Mail, CreditCard, Truck, CheckCircle, Send
} from "lucide-react"
import Link from "next/link"
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useRouter } from "next/navigation"

export default function AdminPedidoDetalhesPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [order, setOrder] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [newStatus, setNewStatus] = useState('')

  useEffect(() => {
    fetchOrder()
  }, [params.id])

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/admin/orders/${params.id}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao carregar pedido')
      }

      setOrder(data.order)
      setNewStatus(data.order.status)
    } catch (error: any) {
      console.error('Error fetching order:', error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateStatus = async () => {
    if (newStatus === order.status) return

    setIsUpdating(true)
    try {
      const response = await fetch(`/api/admin/orders/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao atualizar status')
      }

      // Recarrega o pedido
      await fetchOrder()
      alert('Status atualizado com sucesso!')
    } catch (error: any) {
      console.error('Error updating status:', error)
      alert(error.message)
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) {
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
      </div>
    )
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

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/admin/pedidos">
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
          {order.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações do Cliente */}
        <Card className="bg-gray-800/50 border-gray-600/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <User className="mr-2 h-5 w-5" />
              Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-gray-400 text-sm">Nome</div>
              <div className="text-white font-medium">{order.customer_name}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">CPF/CNPJ</div>
              <div className="text-white font-medium">{order.customer_document}</div>
            </div>
            {order.customer_email && (
              <div>
                <div className="text-gray-400 text-sm flex items-center">
                  <Mail className="mr-1 h-3 w-3" />
                  Email
                </div>
                <div className="text-white font-medium">{order.customer_email}</div>
              </div>
            )}
            {order.customer_phone && (
              <div>
                <div className="text-gray-400 text-sm flex items-center">
                  <Phone className="mr-1 h-3 w-3" />
                  Telefone
                </div>
                <div className="text-white font-medium">{order.customer_phone}</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Endereço de Entrega */}
        <Card className="bg-gray-800/50 border-gray-600/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <MapPin className="mr-2 h-5 w-5" />
              Entrega
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
                  Distância
                </div>
                <div className="text-white font-medium">
                  {order.shipping_distance_km} km • ~{order.shipping_time_minutes} min
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Atualizar Status */}
        <Card className="bg-gray-800/50 border-gray-600/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <CheckCircle className="mr-2 h-5 w-5" />
              Atualizar Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger className="bg-gray-900 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Aguardando</SelectItem>
                <SelectItem value="paid">Pago</SelectItem>
                <SelectItem value="processing">Processando</SelectItem>
                <SelectItem value="shipped">Enviado</SelectItem>
                <SelectItem value="delivered">Entregue</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={handleUpdateStatus}
              disabled={isUpdating || newStatus === order.status}
              className="w-full bg-green-600 hover:bg-green-500"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Atualizando...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Atualizar Status
                </>
              )}
            </Button>
            <p className="text-xs text-gray-400">
              * Atualizar o status enviará notificação WhatsApp via n8n
            </p>
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

      {/* Informações de Pagamento */}
      <Card className="bg-gray-800/50 border-gray-600/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <CreditCard className="mr-2 h-5 w-5" />
            Pagamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-gray-400 text-sm">Transaction ID</div>
              <div className="text-white font-mono text-xs">{order.transaction_id}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">Método</div>
              <div className="text-white font-medium">PIX</div>
            </div>
            {order.paid_at && (
              <div>
                <div className="text-gray-400 text-sm">Pago em</div>
                <div className="text-white font-medium">
                  {format(new Date(order.paid_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </div>
              </div>
            )}
            {order.shipped_at && (
              <div>
                <div className="text-gray-400 text-sm">Enviado em</div>
                <div className="text-white font-medium">
                  {format(new Date(order.shipped_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
