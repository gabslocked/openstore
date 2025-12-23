"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Package, Search, Eye, Loader2, Filter,
  ChevronLeft, ChevronRight
} from "lucide-react"
import Link from "next/link"
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function AdminPedidosPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchDocument, setSearchDocument] = useState('')

  useEffect(() => {
    fetchOrders()
  }, [page, statusFilter])

  const fetchOrders = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      })
      
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter)
      if (searchDocument) params.append('customer_document', searchDocument)

      const response = await fetch(`/api/admin/orders?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao carregar pedidos')
      }

      setOrders(data.orders)
      setTotalPages(data.total_pages)
    } catch (error: any) {
      console.error('Error fetching orders:', error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = () => {
    setPage(1)
    fetchOrders()
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
      pending: 'Aguardando',
      paid: 'Pago',
      processing: 'Processando',
      shipped: 'Enviado',
      delivered: 'Entregue',
      cancelled: 'Cancelado',
      failed: 'Falhou',
    }
    return labels[status] || status
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Pedidos</h1>
          <p className="text-gray-400">Gerencie todos os pedidos da loja</p>
        </div>
      </div>

      {/* Filtros */}
      <Card className="bg-gray-800/50 border-gray-600/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-gray-900 border-gray-600 text-white">
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Aguardando</SelectItem>
                  <SelectItem value="paid">Pago</SelectItem>
                  <SelectItem value="processing">Processando</SelectItem>
                  <SelectItem value="shipped">Enviado</SelectItem>
                  <SelectItem value="delivered">Entregue</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                  <SelectItem value="failed">Falhou</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">CPF/CNPJ</label>
              <Input
                value={searchDocument}
                onChange={(e) => setSearchDocument(e.target.value)}
                placeholder="000.000.000-00"
                className="bg-gray-900 border-gray-600 text-white"
              />
            </div>

            <div className="flex items-end">
              <Button
                onClick={handleSearch}
                className="w-full bg-green-600 hover:bg-green-500"
              >
                <Search className="mr-2 h-4 w-4" />
                Buscar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Pedidos */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-green-500" />
        </div>
      ) : orders.length === 0 ? (
        <Card className="bg-gray-800/50 border-gray-600/30">
          <CardContent className="py-12 text-center">
            <Package className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Nenhum pedido encontrado</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="bg-gray-800/50 border-gray-600/30 hover:border-gray-500/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="text-white font-semibold text-lg">
                          #{order.external_id?.slice(-8) || order.id.slice(-8)}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </div>
                      <div className="text-gray-400 text-sm">
                        {format(new Date(order.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                      </div>
                    </div>
                    <Link href={`/admin/pedidos/${order.id}`}>
                      <Button variant="outline" size="sm" className="border-gray-600">
                        <Eye className="mr-2 h-4 w-4" />
                        Ver Detalhes
                      </Button>
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Cliente:</span>
                      <div className="text-white font-medium">{order.customer_name}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Itens:</span>
                      <div className="text-white font-medium">{order.items_count}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Total:</span>
                      <div className="text-white font-medium">R$ {parseFloat(order.total).toFixed(2)}</div>
                    </div>
                    {order.customer_city && (
                      <div>
                        <span className="text-gray-400">Cidade:</span>
                        <div className="text-white font-medium">
                          {order.customer_city} - {order.customer_state}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Paginação */}
          <div className="flex items-center justify-between">
            <div className="text-gray-400 text-sm">
              Página {page} de {totalPages}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="border-gray-600"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="border-gray-600"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
