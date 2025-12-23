"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts'
import { 
  DollarSign, Package, TrendingUp, ShoppingCart, 
  Users, Truck, MapPin, Loader2 
} from "lucide-react"
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | '3months'>('month')

  useEffect(() => {
    fetchDashboard()
  }, [dateRange])

  const fetchDashboard = async () => {
    try {
      const response = await fetch('/api/admin/dashboard')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao carregar dashboard')
      }

      setDashboard(data.dashboard)
    } catch (error: any) {
      console.error('Error fetching dashboard:', error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    )
  }

  if (!dashboard) return null

  const statusData = dashboard.orders_by_status.map((item: any) => ({
    name: item.status,
    value: item.count
  }))

  const salesData = dashboard.sales_by_day.reverse().map((item: any) => ({
    date: format(new Date(item.date), 'dd/MM', { locale: ptBR }),
    vendas: item.orders,
    receita: item.revenue
  }))

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Visão geral das suas vendas e métricas</p>
        </div>
        
        {/* Date Range Filter */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setDateRange('today')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              dateRange === 'today'
                ? 'bg-green-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Hoje
          </button>
          <button
            onClick={() => setDateRange('week')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              dateRange === 'week'
                ? 'bg-green-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            7 Dias
          </button>
          <button
            onClick={() => setDateRange('month')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              dateRange === 'month'
                ? 'bg-green-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            30 Dias
          </button>
          <button
            onClick={() => setDateRange('3months')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              dateRange === '3months'
                ? 'bg-green-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            90 Dias
          </button>
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-500/20 to-green-600/10 border-green-500/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Vendas Hoje
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              R$ {dashboard.today.revenue.toFixed(2)}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {dashboard.today.orders} pedidos
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-blue-500/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Vendas da Semana
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              R$ {dashboard.week.revenue.toFixed(2)}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {dashboard.week.orders} pedidos
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-purple-500/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Vendas do Mês
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              R$ {dashboard.month.revenue.toFixed(2)}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {dashboard.month.orders} pedidos
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 border-orange-500/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Ticket Médio
            </CardTitle>
            <Users className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              R$ {dashboard.avg_ticket.toFixed(2)}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Frete: R$ {dashboard.avg_shipping.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vendas por Dia */}
        <Card className="bg-gray-800/50 border-gray-600/30">
          <CardHeader>
            <CardTitle className="text-white">Vendas dos Últimos 30 Dias</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="receita" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Receita (R$)"
                />
                <Line 
                  type="monotone" 
                  dataKey="vendas" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Pedidos"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pedidos por Status - Melhorado */}
        <Card className="bg-gray-800/50 border-gray-600/30">
          <CardHeader>
            <CardTitle className="text-white">📊 Pedidos por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfico de Pizza */}
              <div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      strokeWidth={3}
                      stroke="#1f2937"
                    >
                      {statusData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Lista de Status */}
              <div className="space-y-3">
                {statusData.map((status: any, index: number) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-700"
                  >
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></div>
                      <div>
                        <div className="text-white font-medium capitalize">{status.name}</div>
                        <div className="text-gray-400 text-sm">{status.value} pedidos</div>
                      </div>
                    </div>
                    <div className="text-white font-semibold">
                      {((status.value / statusData.reduce((sum: number, s: any) => sum + s.value, 0)) * 100).toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Produtos */}
      <Card className="bg-gray-800/50 border-gray-600/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Package className="mr-2 h-5 w-5" />
            🏆 Top 10 Produtos Mais Vendidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {dashboard.top_products.map((product: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-700 hover:border-green-500/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-white font-medium text-sm">
                      {product.product_name}
                      {product.variant_name && (
                        <span className="text-gray-400 text-xs ml-1">
                          ({product.variant_name})
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400">
                      {product.quantity} unidades
                    </div>
                  </div>
                </div>
                <div className="text-green-400 font-semibold text-sm">
                  R$ {product.revenue.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>


      {/* Lucro e Taxa de Plataforma */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-green-500/20 to-green-600/10 border-green-500/30">
          <CardHeader>
            <CardTitle className="text-white text-sm">Faturamento do Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-1">
              R$ {dashboard.profit.total_revenue.toFixed(2)}
            </div>
            <div className="text-xs text-gray-400">
              Custo: R$ {dashboard.profit.total_cost.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-blue-500/30">
          <CardHeader>
            <CardTitle className="text-white text-sm">Lucro Bruto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-1">
              R$ {dashboard.profit.gross_profit.toFixed(2)}
            </div>
            <div className="text-xs text-gray-400">
              Margem: {dashboard.profit.total_revenue > 0 
                ? ((dashboard.profit.gross_profit / dashboard.profit.total_revenue) * 100).toFixed(1)
                : 0}%
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white text-sm">Lucro Líquido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-1">
              R$ {dashboard.profit.net_profit.toFixed(2)}
            </div>
            <div className="text-xs text-red-400">
              Taxa Plataforma (5%): -R$ {dashboard.profit.platform_fee.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Taxa de Conversão */}
      <Card className="bg-gradient-to-br from-green-500/10 to-blue-500/10 border-green-500/30">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-5xl font-bold text-white mb-2">
              {dashboard.conversion_rate.toFixed(1)}%
            </div>
            <div className="text-gray-400">Taxa de Conversão (últimos 30 dias)</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
