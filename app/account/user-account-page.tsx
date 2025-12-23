'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { User, MapPin, Phone, Mail, LogOut, Edit, Plus, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Address {
  id: number
  label: string
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  zip_code: string
  is_default: boolean
}

interface UserData {
  id: number
  name: string
  email: string
  whatsapp?: string
  email_verified: boolean
}

function UserAccountPage() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [editingAddress, setEditingAddress] = useState<number | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchUserData()
    fetchAddresses()
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const data = await response.json()
        setUserData(data)
      } else if (response.status === 401) {
        router.push('/login')
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error)
    }
  }

  const fetchAddresses = async () => {
    try {
      const response = await fetch('/api/user/addresses')
      if (response.ok) {
        const data = await response.json()
        // Ensure addresses is always an array
        setAddresses(Array.isArray(data) ? data : data.addresses || [])
      } else {
        setAddresses([])
      }
    } catch (error) {
      console.error('Erro ao carregar endereços:', error)
      setAddresses([])
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  const deleteAddress = async (addressId: number) => {
    try {
      const response = await fetch(`/api/user/addresses/${addressId}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        setAddresses(addresses.filter(addr => addr.id !== addressId))
      }
    } catch (error) {
      console.error('Erro ao deletar endereço:', error)
    }
  }

  const setDefaultAddress = async (addressId: number) => {
    try {
      const response = await fetch(`/api/user/addresses/${addressId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_default: true })
      })
      if (response.ok) {
        fetchAddresses() // Recarrega endereços
      }
    } catch (error) {
      console.error('Erro ao definir endereço padrão:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-white">Carregando...</div>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-white">Erro ao carregar dados do usuário</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Informações do Usuário */}
      <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <User className="h-5 w-5" />
            Informações Pessoais
          </CardTitle>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300">Nome</Label>
              <Input
                value={userData.name}
                readOnly
                className="bg-gray-700/50 border-gray-600 text-white"
              />
            </div>
            <div>
              <Label className="text-gray-300">Email</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={userData.email}
                  readOnly
                  className="bg-gray-700/50 border-gray-600 text-white"
                />
                {userData.email_verified ? (
                  <Badge variant="secondary" className="bg-green-600 text-white">
                    Verificado
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    Não verificado
                  </Badge>
                )}
              </div>
            </div>
          </div>
          {userData.whatsapp && (
            <div>
              <Label className="text-gray-300">WhatsApp</Label>
              <Input
                value={userData.whatsapp}
                readOnly
                className="bg-gray-700/50 border-gray-600 text-white"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Endereços */}
      <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Meus Endereços
          </CardTitle>
          <Button
            onClick={() => router.push('/account/address/new')}
            size="sm"
            className="bg-gray-700 hover:bg-gray-600 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar
          </Button>
        </CardHeader>
        <CardContent>
          {!Array.isArray(addresses) || addresses.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              Nenhum endereço cadastrado
            </div>
          ) : (
            <div className="space-y-4">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className="p-4 border border-gray-600 rounded-lg bg-gray-700/30"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium text-white">{address.label}</h3>
                        {address.is_default && (
                          <Badge variant="secondary" className="bg-blue-600 text-white">
                            Padrão
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-300 text-sm">
                        {address.street}, {address.number}
                        {address.complement && `, ${address.complement}`}
                      </p>
                      <p className="text-gray-300 text-sm">
                        {address.neighborhood}, {address.city} - {address.state}
                      </p>
                      <p className="text-gray-300 text-sm">CEP: {address.zip_code}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!address.is_default && (
                        <Button
                          onClick={() => setDefaultAddress(address.id)}
                          variant="outline"
                          size="sm"
                          className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          Definir como padrão
                        </Button>
                      )}
                      <Button
                        onClick={() => setEditingAddress(address.id)}
                        variant="outline"
                        size="sm"
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => deleteAddress(address.id)}
                        variant="outline"
                        size="sm"
                        className="border-red-600 text-red-400 hover:bg-red-600/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export { UserAccountPage }
