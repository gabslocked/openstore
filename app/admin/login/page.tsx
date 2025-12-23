"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ShieldCheck } from "lucide-react"

export default function AdminLoginPage() {
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    setIsLoading(true)
    setError("")

    if (!formData.email || !formData.password) {
      setError("Email e senha são obrigatórios")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()

      if (data.success) {
        window.location.href = "/admin"
      } else {
        setError(data.error || "Erro ao fazer login")
        setIsLoading(false)
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("Erro ao conectar ao servidor")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black py-12 px-4 flex items-center justify-center">
      <div className="container mx-auto max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-500/20 p-4 rounded-full">
              <ShieldCheck className="h-12 w-12 text-blue-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Login</h1>
          <p className="text-gray-400">Acesso restrito para administradores</p>
        </div>

        <div className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-md p-8 rounded-lg shadow-xl border border-gray-600/30">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email
              </Label>
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full px-3 py-2 bg-black/50 border border-gray-600/30 rounded-md text-white placeholder-gray-500 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                placeholder="admin@ezpods.com"
              />
            </div>

            <div>
              <Label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Senha
              </Label>
              <Input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full px-3 py-2 bg-black/50 border border-gray-600/30 rounded-md text-white placeholder-gray-500 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                placeholder="Sua senha de administrador"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 bg-gradient-to-r from-blue-700 to-blue-600 text-white font-medium rounded-md hover:from-blue-600 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "Entrando..." : "Entrar como Admin"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="text-gray-400 hover:text-white text-sm underline"
            >
              Voltar para login de usuário
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
