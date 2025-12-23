"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Package, Search, Eye } from "lucide-react"
import Link from "next/link"

export default function MeusPedidosPage() {
  const [document, setDocument] = useState('')
  const [email, setEmail] = useState('')
  const [orders, setOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSearched(true)

    try {
      const response = await fetch('/api/user/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          document: document || undefined,
          email: email || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao buscar pedidos')
      }

      setOrders(data.orders)
    } catch (error: any) {
      console.error('Error searching orders:', error)
      setError(error.message || 'Erro ao buscar pedidos')
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <header className="bg-gradient-to-r from-black via-gray-900 to-black backdrop-blur-md py-6 border-b border-gray-600/30 shadow-2xl">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Meus Pedidos</h1>
            <Link href="/">
              <Button variant="ghost" className="text-white">
                Voltar para Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Formulário de Busca */}
        <Card className="bg-gray-800/50 border-gray-600/30 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Search className="mr-2 h-5 w-5" />
              Consultar Pedidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <Label htmlFor="document" className="text-gray-300">
                  CPF/CNPJ
                </Label>
                <Input
                  id="document"
                  value={document}
                  onChange={(e) => setDocument(e.target.value)}
                  className="bg-gray-900 text-white border-gray-600"
                  placeholder="000.000.000-00"
                />
              </div>

              <div className="text-center text-gray-400 text-sm">OU</div>

              <div>
                <Label htmlFor="email" className="text-gray-300">
                  E-mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-900 text-white border-gray-600"
                  placeholder="seu@email.com"
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading || (!document && !email)}
                className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-5 w-5" />
                    Buscar Pedidos
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Lista de Pedidos */}
        {searched && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <Card className="bg-gray-800/50 border-gray-600/30">
                <CardContent className="py-12 text-center">
                  <Package className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">
                    Nenhum pedido encontrado
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    Verifique se o CPF/CNPJ ou e-mail está correto
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="text-white mb-4">
                  Encontrados {orders.length} pedido(s)
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
                            {new Date(order.created_at).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div>
                          <span className="text-gray-400">Itens:</span>
                          <span className="text-white ml-2">{order.items_count}</span>
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
                      </div>

                      <Link href={`/orders/${order.id}`}>
                        <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-700">
                          <Eye className="mr-2 h-4 w-4" />
                          Ver Detalhes
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
