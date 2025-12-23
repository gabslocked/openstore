"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2 } from "lucide-react"

interface Address {
  label: string
  street: string
  number: string
  complement: string
  neighborhood: string
  city: string
  state: string
  zip_code: string
  is_default: boolean
}

export function RegistrationForm() {
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    whatsapp: ""
  })
  const [addresses, setAddresses] = useState<Address[]>([
    {
      label: "Casa",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      zip_code: "",
      is_default: true
    }
  ])
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAddressChange = (index: number, field: keyof Address, value: string | boolean) => {
    setAddresses(prev => prev.map((addr, i) => 
      i === index ? { ...addr, [field]: value } : addr
    ))
  }

  const addAddress = () => {
    setAddresses(prev => [...prev, {
      label: "Endereço " + (prev.length + 1),
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      zip_code: "",
      is_default: false
    }])
  }

  const removeAddress = (index: number) => {
    if (addresses.length > 1) {
      setAddresses(prev => prev.filter((_, i) => i !== index))
    }
  }

  const setDefaultAddress = (index: number) => {
    setAddresses(prev => prev.map((addr, i) => ({
      ...addr,
      is_default: i === index
    })))
  }

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.password) {
      setError("Nome, email e senha são obrigatórios")
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem")
      return false
    }

    if (formData.password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres")
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError("Email inválido")
      return false
    }

    // Validate at least one complete address
    const hasCompleteAddress = addresses.some(addr => 
      addr.street && addr.city && addr.state && addr.zip_code
    )

    if (!hasCompleteAddress) {
      setError("Pelo menos um endereço completo é obrigatório")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!validateForm()) return

    setIsLoading(true)

    try {
      const validAddresses = addresses.filter(addr => 
        addr.street && addr.city && addr.state && addr.zip_code
      )

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          whatsapp: formData.whatsapp,
          addresses: validAddresses
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Conta criada com sucesso! Redirecionando...")
        setTimeout(() => {
          router.push("/login")
        }, 2000)
      } else {
        setError(data.error || "Erro ao criar conta")
      }
    } catch (error) {
      setError("Erro ao conectar ao servidor")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/50 text-green-200 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {/* Dados Pessoais */}
      <Card className="bg-black/30 border-gray-600/30">
        <CardHeader>
          <CardTitle className="text-gray-100">Dados Pessoais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="text-gray-300">Nome Completo *</Label>
              <Input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="mt-1 bg-black/50 border-gray-600/30 text-white placeholder-gray-500 focus:border-gray-400 focus:ring-gray-400"
                placeholder="Seu nome completo"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-gray-300">Email *</Label>
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="mt-1 bg-black/50 border-gray-600/30 text-white placeholder-gray-500 focus:border-gray-400 focus:ring-gray-400"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-gray-300">Senha *</Label>
              <Input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="mt-1 bg-black/50 border-gray-600/30 text-white placeholder-gray-500 focus:border-gray-400 focus:ring-gray-400"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-gray-300">Confirmar Senha *</Label>
              <Input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                className="mt-1 bg-black/50 border-gray-600/30 text-white placeholder-gray-500 focus:border-gray-400 focus:ring-gray-400"
                placeholder="Repita a senha"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="whatsapp" className="text-gray-300">WhatsApp</Label>
              <Input
                type="tel"
                id="whatsapp"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleInputChange}
                className="mt-1 bg-black/50 border-gray-600/30 text-white placeholder-gray-500 focus:border-gray-400 focus:ring-gray-400"
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Endereços */}
      <Card className="bg-black/30 border-gray-600/30">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-gray-100">Endereços</CardTitle>
          <Button
            type="button"
            onClick={addAddress}
            variant="outline"
            size="sm"
            className="border-gray-600/30 text-gray-300 hover:bg-gray-600/10"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {addresses.map((address, index) => (
            <div key={index} className="p-4 border border-gray-700/50 rounded-lg bg-black/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <Input
                    type="text"
                    value={address.label}
                    onChange={(e) => handleAddressChange(index, 'label', e.target.value)}
                    className="w-32 bg-black/50 border-gray-600/30 text-white"
                    placeholder="Label"
                  />
                  <label className="flex items-center gap-2 text-gray-300">
                    <input
                      type="radio"
                      name="defaultAddress"
                      checked={address.is_default}
                      onChange={() => setDefaultAddress(index)}
                      className="text-gray-400"
                    />
                    Padrão
                  </label>
                </div>
                {addresses.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => removeAddress(index)}
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Label className="text-gray-300">Rua *</Label>
                  <Input
                    type="text"
                    value={address.street}
                    onChange={(e) => handleAddressChange(index, 'street', e.target.value)}
                    className="mt-1 bg-black/50 border-gray-600/30 text-white"
                    placeholder="Nome da rua"
                  />
                </div>

                <div>
                  <Label className="text-gray-300">Número</Label>
                  <Input
                    type="text"
                    value={address.number}
                    onChange={(e) => handleAddressChange(index, 'number', e.target.value)}
                    className="mt-1 bg-black/50 border-gray-600/30 text-white"
                    placeholder="123"
                  />
                </div>

                <div>
                  <Label className="text-gray-300">Complemento</Label>
                  <Input
                    type="text"
                    value={address.complement}
                    onChange={(e) => handleAddressChange(index, 'complement', e.target.value)}
                    className="mt-1 bg-black/50 border-gray-600/30 text-white"
                    placeholder="Apto, bloco, etc"
                  />
                </div>

                <div>
                  <Label className="text-gray-300">Bairro</Label>
                  <Input
                    type="text"
                    value={address.neighborhood}
                    onChange={(e) => handleAddressChange(index, 'neighborhood', e.target.value)}
                    className="mt-1 bg-black/50 border-gray-600/30 text-white"
                    placeholder="Bairro"
                  />
                </div>

                <div>
                  <Label className="text-gray-300">Cidade *</Label>
                  <Input
                    type="text"
                    value={address.city}
                    onChange={(e) => handleAddressChange(index, 'city', e.target.value)}
                    className="mt-1 bg-black/50 border-gray-600/30 text-white"
                    placeholder="Cidade"
                  />
                </div>

                <div>
                  <Label className="text-gray-300">Estado *</Label>
                  <Input
                    type="text"
                    value={address.state}
                    onChange={(e) => handleAddressChange(index, 'state', e.target.value)}
                    className="mt-1 bg-black/50 border-gray-600/30 text-white"
                    placeholder="SP"
                  />
                </div>

                <div>
                  <Label className="text-gray-300">CEP *</Label>
                  <Input
                    type="text"
                    value={address.zip_code}
                    onChange={(e) => handleAddressChange(index, 'zip_code', e.target.value)}
                    className="mt-1 bg-black/50 border-gray-600/30 text-white"
                    placeholder="00000-000"
                  />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 bg-gradient-to-r from-gray-700 to-gray-600 text-white font-medium rounded-md hover:from-gray-600 hover:to-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? "Criando conta..." : "Criar Conta"}
      </Button>

      <div className="text-center">
        <p className="text-gray-400">
          Já tem uma conta?{" "}
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="text-gray-300 hover:text-white underline"
          >
            Fazer login
          </button>
        </p>
      </div>
    </form>
  )
}
