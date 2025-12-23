"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function UserLoginForm() {
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
    
    console.log("=== FORM SUBMISSION START ===")
    console.log("Form data:", formData)
    console.log("Current loading state:", isLoading)
    
    setIsLoading(true)
    setError("")

    if (!formData.email || !formData.password) {
      console.log("Validation failed: missing email or password")
      setError("Email e senha são obrigatórios")
      setIsLoading(false)
      return
    }

    try {
      console.log("Making API request to /api/auth/login")
      console.log("Request body:", { email: formData.email, password: "***" })
      
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
        credentials: 'include' // Ensure cookies are included
      })

      console.log("Response received:")
      console.log("- Status:", response.status)
      console.log("- OK:", response.ok)
      console.log("- Headers:", Object.fromEntries(response.headers.entries()))
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log("Response data:", data)

      if (data.success) {
        console.log("=== LOGIN SUCCESSFUL ===")
        console.log("User is admin:", data.isAdmin)
        console.log("User data:", data.user)
        
        // Don't reset loading state - keep it true during navigation
        if (data.isAdmin) {
          console.log("Attempting navigation to /admin")
          window.location.href = "/admin" // Force navigation instead of router.push
        } else {
          console.log("Attempting navigation to /conta")
          window.location.href = "/account" // Force navigation instead of router.push
        }
      } else {
        console.log("=== LOGIN FAILED ===")
        console.log("Error:", data.error)
        setError(data.error || "Erro ao fazer login")
        setIsLoading(false)
      }
    } catch (error) {
      console.error("=== LOGIN ERROR ===")
      console.error("Error details:", error)
      setError("Erro ao conectar ao servidor")
      setIsLoading(false)
    }
    
    console.log("=== FORM SUBMISSION END ===")
  }

  return (
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
            className="mt-1 block w-full px-3 py-2 bg-black/50 border border-gray-600/30 rounded-md text-white placeholder-gray-500 focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
            placeholder="seu@email.com"
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
            className="mt-1 block w-full px-3 py-2 bg-black/50 border border-gray-600/30 rounded-md text-white placeholder-gray-500 focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
            placeholder="Sua senha"
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 px-4 bg-gradient-to-r from-gray-700 to-gray-600 text-white font-medium rounded-md hover:from-gray-600 hover:to-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? "Entrando..." : "Entrar"}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-400">
          Não tem uma conta?{" "}
          <button
            type="button"
            onClick={() => router.push("/register")}
            className="text-gray-300 hover:text-white underline"
          >
            Criar conta
          </button>
        </p>
      </div>
    </div>
  )
}
