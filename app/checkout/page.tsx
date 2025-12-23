"use client"

import React, { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle2, Clock, Copy, QrCode, ArrowLeft, Loader2 } from "lucide-react"
import Image from "next/image"
import { maskCEP, maskPhone, maskDocument, unmask, isValidDocument } from "@/lib/utils/masks"
import { fetchAddressByCEP } from "@/lib/utils/cep"
import { useAuth } from "@/hooks/use-auth"

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  
  const [step, setStep] = useState<'form' | 'payment' | 'success'>('form')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedAddresses, setSavedAddresses] = useState<any[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string>('')
  
  // Dados do cliente
  const [customerData, setCustomerData] = useState({
    name: '',
    document: '',
    email: '',
    phone: '',
    cep: '',
    address: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    notes: '',
  })
  
  // Dados do pagamento e frete
  const [paymentData, setPaymentData] = useState<any>(null)
  const [cartItems, setCartItems] = useState<any[]>([])
  const [copied, setCopied] = useState(false)
  const [shippingData, setShippingData] = useState<any>(null)
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false)
  const [shippingError, setShippingError] = useState<string | null>(null)
  const [addressAutofilled, setAddressAutofilled] = useState(false)

  useEffect(() => {
    // Carrega itens do carrinho
    const loadCart = () => {
      try {
        const savedCart = localStorage.getItem('cart')
        if (savedCart) {
          const items = JSON.parse(savedCart)
          console.log('[Checkout] Loaded cart items:', items.length)
          setCartItems(items)
        } else {
          console.log('[Checkout] No cart found, redirecting to home')
          router.push('/')
        }
      } catch (error) {
        console.error('[Checkout] Error loading cart:', error)
        router.push('/')
      }
    }

    loadCart()
  }, [router])

  // Carrega dados do usuário e endereços salvos
  useEffect(() => {
    if (user) {
      // Preenche dados do usuário
      setCustomerData(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        document: user.document || prev.document,
        phone: user.phone || prev.phone,
      }))

      // Carrega endereços salvos
      fetchSavedAddresses()
    }
  }, [user])

  const fetchSavedAddresses = async () => {
    try {
      const response = await fetch('/api/user/addresses')
      const data = await response.json()

      if (response.ok && data.addresses) {
        setSavedAddresses(data.addresses)
        
        // Se tiver endereço padrão, seleciona automaticamente
        const defaultAddress = data.addresses.find((addr: any) => addr.is_default)
        if (defaultAddress) {
          selectAddress(defaultAddress)
        }
      }
    } catch (error) {
      console.error('Erro ao carregar endereços:', error)
    }
  }

  const selectAddress = (address: any) => {
    setSelectedAddressId(address.id)
    setCustomerData(prev => ({
      ...prev,
      cep: address.cep || prev.cep,
      address: address.street || prev.address,
      number: address.number || prev.number,
      complement: address.complement || prev.complement,
      neighborhood: address.neighborhood || prev.neighborhood,
      city: address.city || prev.city,
      state: address.state || prev.state,
    }))

    // Calcula frete com o novo CEP
    if (address.cep) {
      const cleanCEP = unmask(address.cep)
      if (cleanCEP.length === 8) {
        calculateShipping(cleanCEP)
      }
    }
  }

  useEffect(() => {
    // Verifica status do pagamento a cada 5 segundos
    if (step === 'payment' && paymentData?.transaction_id) {
      const interval = setInterval(async () => {
        try {
          const response = await fetch(`/api/payments/status/${paymentData.transaction_id}`)
          const data = await response.json()
          
          if (data.status === 'paid') {
            setStep('success')
            // Limpa AMBOS os carrinhos após confirmação do pagamento
            localStorage.removeItem('cart')
            localStorage.removeItem('ezpods-cart')
            clearInterval(interval)
          }
        } catch (error) {
          console.error('Error checking payment status:', error)
        }
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [step, paymentData])

  // Calcula o total do carrinho
  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => {
      const price = item.totalPrice || (item.price || 0) * (item.quantity || 1)
      return sum + price
    }, 0)
  }

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    let maskedValue = value

    // Aplica máscaras
    if (name === 'cep') {
      maskedValue = maskCEP(value)
    } else if (name === 'phone') {
      maskedValue = maskPhone(value)
    } else if (name === 'document') {
      maskedValue = maskDocument(value)
    }

    setCustomerData(prev => ({ ...prev, [name]: maskedValue }))
    
    // Autocomplete de endereço ao digitar CEP
    if (name === 'cep') {
      const cleanCEP = unmask(maskedValue)
      
      if (cleanCEP.length === 8) {
        // Busca endereço
        const addressData = await fetchAddressByCEP(cleanCEP)
        
        if (addressData) {
          setCustomerData(prev => ({
            ...prev,
            address: addressData.logradouro || prev.address,
            neighborhood: addressData.bairro || prev.neighborhood,
            city: addressData.localidade || prev.city,
            state: addressData.uf || prev.state,
          }))
          setAddressAutofilled(true)
          setTimeout(() => setAddressAutofilled(false), 3000)
        }
        
        // Calcula frete
        calculateShipping(cleanCEP)
      } else {
        setShippingData(null)
        setShippingError(null)
      }
    }
  }

  const calculateShipping = async (cep: string) => {
    setIsCalculatingShipping(true)
    setShippingError(null)
    
    try {
      const cartTotal = calculateTotal()
      
      const response = await fetch('/api/shipping/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cep,
          cart_total: cartTotal,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao calcular frete')
      }

      setShippingData(data)
      console.log('Frete calculado:', data)
    } catch (error: any) {
      console.error('Error calculating shipping:', error)
      setShippingError(error.message || 'Erro ao calcular frete')
      setShippingData(null)
    } finally {
      setIsCalculatingShipping(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Valida CPF/CNPJ
      if (!isValidDocument(customerData.document)) {
        throw new Error('CPF/CNPJ inválido')
      }

      // Valida se o frete foi calculado (se CEP foi fornecido)
      if (customerData.cep && !shippingData) {
        throw new Error('Por favor, aguarde o cálculo do frete')
      }

      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cartItems,
          customer: customerData,
          shipping: shippingData,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar pagamento')
      }

      setPaymentData(data.payment)
      setStep('payment')
    } catch (error: any) {
      console.error('Error creating payment:', error)
      setError(error.message || 'Erro ao processar pagamento')
    } finally {
      setIsLoading(false)
    }
  }

  const copyPixCode = () => {
    if (paymentData?.qr_code) {
      navigator.clipboard.writeText(paymentData.qr_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
        <Card className="bg-gray-800/50 border-gray-600/30 max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Pagamento Confirmado!</h2>
            <p className="text-gray-400 mb-6">
              Seu pedido foi confirmado e está sendo processado.
            </p>
            <Button
              onClick={() => router.push('/')}
              className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400"
            >
              Voltar para a loja
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (step === 'payment') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
        <header className="bg-gradient-to-r from-black via-gray-900 to-black backdrop-blur-md py-6 border-b border-gray-600/30 shadow-2xl">
          <div className="container mx-auto px-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setStep('form')}
                className="text-white hover:text-gray-300"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold text-white">Pagamento PIX</h1>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Card className="bg-gray-800/50 border-gray-600/30">
            <CardHeader>
              <CardTitle className="text-white text-center">Escaneie o QR Code</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* QR Code */}
              <div className="bg-white p-6 rounded-lg mx-auto w-fit">
                {paymentData?.qr_code_base64 ? (
                  <img
                    src={paymentData.qr_code_base64}
                    alt="QR Code PIX"
                    width={250}
                    height={250}
                    className="mx-auto"
                  />
                ) : (
                  <QrCode className="h-64 w-64 text-gray-400" />
                )}
              </div>

              {/* Instruções */}
              <div className="text-center space-y-2">
                <p className="text-white font-bold text-xl">
                  R$ {paymentData?.amount?.toFixed(2)}
                </p>
                <div className="flex items-center justify-center space-x-2 text-yellow-400">
                  <Clock className="h-5 w-5" />
                  <span>Aguardando pagamento...</span>
                </div>
              </div>

              {/* Código PIX Copia e Cola */}
              <div className="space-y-2">
                <Label className="text-gray-300">Ou copie o código PIX:</Label>
                <div className="flex space-x-2">
                  <Input
                    value={paymentData?.qr_code || ''}
                    readOnly
                    className="bg-gray-900 text-white border-gray-600 font-mono text-sm"
                  />
                  <Button
                    onClick={copyPixCode}
                    variant="outline"
                    className="border-gray-600"
                  >
                    {copied ? <CheckCircle2 className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                  </Button>
                </div>
              </div>

              {/* Instruções de pagamento */}
              <div className="bg-gray-900/50 p-4 rounded-lg space-y-2 text-sm text-gray-300">
                <p className="font-semibold text-white">Como pagar:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Abra o app do seu banco</li>
                  <li>Escolha pagar via PIX</li>
                  <li>Escaneie o QR Code ou cole o código</li>
                  <li>Confirme o pagamento</li>
                </ol>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <header className="bg-gradient-to-r from-black via-gray-900 to-black backdrop-blur-md py-6 border-b border-gray-600/30 shadow-2xl">
        <div className="container mx-auto px-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/')}
              className="text-white hover:text-gray-300"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-white">Finalizar Compra</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid gap-6">
          {/* Resumo do Pedido */}
          <Card className="bg-gray-800/50 border-gray-600/30">
            <CardHeader>
              <CardTitle className="text-white">Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartItems.map((item, index) => (
                <div key={index} className="flex justify-between text-gray-300">
                  <span>{item.name || item.productName} x{item.quantity || 1}</span>
                  <span>R$ {(item.totalPrice || (item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-gray-600 pt-4 space-y-2">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal</span>
                  <span>R$ {calculateTotal().toFixed(2)}</span>
                </div>
                
                {shippingData && (
                  <>
                    <div className="flex justify-between text-gray-300">
                      <span>Frete ({shippingData.distance_km}km)</span>
                      <span className={shippingData.free_shipping ? 'text-green-400 font-bold' : ''}>
                        {shippingData.free_shipping ? 'GRÁTIS' : `R$ ${shippingData.shipping_cost.toFixed(2)}`}
                      </span>
                    </div>
                    {!shippingData.free_shipping && shippingData.free_shipping_remaining > 0 && (
                      <div className="text-xs text-yellow-400">
                        💡 Falta R$ {shippingData.free_shipping_remaining.toFixed(2)} para frete grátis!
                      </div>
                    )}
                    <div className="text-xs text-gray-400">
                      ⏱️ Tempo estimado: {shippingData.estimated_time_minutes} minutos
                    </div>
                  </>
                )}
                
                {isCalculatingShipping && (
                  <div className="flex items-center space-x-2 text-blue-400 text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Calculando frete...</span>
                  </div>
                )}
                
                {shippingError && (
                  <div className="text-xs text-red-400">
                    ⚠️ {shippingError}
                  </div>
                )}
                
                <div className="border-t border-gray-600 pt-2">
                  <div className="flex justify-between text-white font-bold text-lg">
                    <span>Total</span>
                    <span>R$ {(calculateTotal() + (shippingData?.shipping_cost || 0)).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Formulário de Dados */}
          <Card className="bg-gray-800/50 border-gray-600/30">
            <CardHeader>
              <CardTitle className="text-white">Seus Dados</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-gray-300">Nome Completo</Label>
                  <Input
                    id="name"
                    name="name"
                    value={customerData.name}
                    onChange={handleInputChange}
                    required
                    className="bg-gray-900 text-white border-gray-600"
                    placeholder="João da Silva"
                  />
                </div>

                <div>
                  <Label htmlFor="document" className="text-gray-300">CPF/CNPJ</Label>
                  <Input
                    id="document"
                    name="document"
                    value={customerData.document}
                    onChange={handleInputChange}
                    required
                    className="bg-gray-900 text-white border-gray-600"
                    placeholder="000.000.000-00"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-gray-300">E-mail (opcional)</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={customerData.email}
                    onChange={handleInputChange}
                    className="bg-gray-900 text-white border-gray-600"
                    placeholder="seu@email.com"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-gray-300">Telefone (opcional)</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={customerData.phone}
                    onChange={handleInputChange}
                    className="bg-gray-900 text-white border-gray-600"
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div className="border-t border-gray-600 pt-4">
                  <h3 className="text-white font-semibold mb-4">Endereço de Entrega</h3>
                  
                  {/* Seletor de Endereços Salvos */}
                  {user && savedAddresses.length > 0 && (
                    <div className="mb-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                      <Label className="text-gray-300 mb-3 block">Endereços Salvos</Label>
                      <div className="space-y-2">
                        {savedAddresses.map((addr) => (
                          <button
                            key={addr.id}
                            type="button"
                            onClick={() => selectAddress(addr)}
                            className={`w-full text-left p-3 rounded-lg border transition-all ${
                              selectedAddressId === addr.id
                                ? 'border-green-500 bg-green-500/10'
                                : 'border-gray-600 hover:border-gray-500 bg-gray-800/50'
                            }`}
                          >
                            <div className="text-white font-medium text-sm">
                              {addr.street}, {addr.number}
                              {addr.is_default && (
                                <span className="ml-2 text-xs text-green-400">(Padrão)</span>
                              )}
                            </div>
                            <div className="text-gray-400 text-xs">
                              {addr.neighborhood}, {addr.city} - {addr.state} • CEP: {addr.cep}
                            </div>
                          </button>
                        ))}
                      </div>
                      <div className="text-xs text-gray-400 mt-2">
                        Ou preencha um novo endereço abaixo
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="cep" className="text-gray-300">CEP *</Label>
                      <Input
                        id="cep"
                        name="cep"
                        value={customerData.cep}
                        onChange={handleInputChange}
                        required
                        className="bg-gray-900 text-white border-gray-600"
                        placeholder="00000-000"
                        maxLength={9}
                      />
                      {isCalculatingShipping && (
                        <p className="text-xs text-blue-400 mt-1 flex items-center">
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          Calculando frete...
                        </p>
                      )}
                      {addressAutofilled && (
                        <p className="text-xs text-blue-400 mt-1 animate-pulse">
                          ✓ Endereço preenchido automaticamente
                        </p>
                      )}
                      {shippingData && (
                        <p className="text-xs text-green-400 mt-1">
                          ✓ {shippingData.delivery_address}
                        </p>
                      )}
                      {shippingError && (
                        <p className="text-xs text-red-400 mt-1">
                          ⚠️ {shippingError}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <Label htmlFor="address" className="text-gray-300">Endereço</Label>
                        <Input
                          id="address"
                          name="address"
                          value={customerData.address}
                          onChange={handleInputChange}
                          className="bg-gray-900 text-white border-gray-600"
                          placeholder="Rua, Avenida..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="number" className="text-gray-300">Número</Label>
                        <Input
                          id="number"
                          name="number"
                          value={customerData.number}
                          onChange={handleInputChange}
                          className="bg-gray-900 text-white border-gray-600"
                          placeholder="123"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="complement" className="text-gray-300">Complemento (opcional)</Label>
                      <Input
                        id="complement"
                        name="complement"
                        value={customerData.complement}
                        onChange={handleInputChange}
                        className="bg-gray-900 text-white border-gray-600"
                        placeholder="Apto, Bloco..."
                      />
                    </div>

                    <div>
                      <Label htmlFor="notes" className="text-gray-300">Observações (opcional)</Label>
                      <Input
                        id="notes"
                        name="notes"
                        value={customerData.notes}
                        onChange={handleInputChange}
                        className="bg-gray-900 text-white border-gray-600"
                        placeholder="Ponto de referência, instruções..."
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold py-3"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Gerando PIX...
                    </>
                  ) : (
                    'Gerar PIX'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
