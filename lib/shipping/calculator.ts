import type { ShippingCalculationRequest, ShippingCalculationResponse } from './types'
import { WAREHOUSE_COORDINATES, geocodeCEP, getAddressFromCEP, isValidCEP } from './geocoding'
import { calculateRoute, calculateStraightLineDistance } from './osrm'

// Configurações de frete
const PRICE_PER_KM = 1.85 // R$ 1,85 por km
const MIN_SHIPPING_COST = 10.00 // Taxa mínima de R$ 10,00
const FREE_SHIPPING_THRESHOLD = 300.00 // Frete grátis acima de R$ 300
const AVERAGE_SPEED_KM_H = 30 // Velocidade média em km/h para estimativa

/**
 * Calcula o frete para um CEP e valor de carrinho
 */
export async function calculateShipping(
  request: ShippingCalculationRequest
): Promise<ShippingCalculationResponse> {
  try {
    // Valida CEP
    if (!isValidCEP(request.cep)) {
      throw new Error('CEP inválido')
    }

    // Busca endereço
    const address = await getAddressFromCEP(request.cep)
    const deliveryAddress = `${address.logradouro}, ${address.bairro}, ${address.localidade} - ${address.uf}`

    // Geocodifica o CEP de destino
    const destinationCoords = await geocodeCEP(request.cep)

    let distanceMeters: number
    let durationSeconds: number

    try {
      // Tenta calcular rota real usando OSRM
      const route = await calculateRoute(WAREHOUSE_COORDINATES, destinationCoords)
      distanceMeters = route.distance
      durationSeconds = route.duration
    } catch (error) {
      console.warn('OSRM falhou, usando cálculo em linha reta:', error)
      // Fallback: usa distância em linha reta + 30% para compensar ruas
      distanceMeters = calculateStraightLineDistance(WAREHOUSE_COORDINATES, destinationCoords) * 1.3
      // Estima duração baseado na velocidade média
      durationSeconds = (distanceMeters / 1000) / AVERAGE_SPEED_KM_H * 3600
    }

    // Converte para km
    const distanceKm = distanceMeters / 1000

    // Calcula custo do frete
    let shippingCost = distanceKm * PRICE_PER_KM
    
    // Aplica taxa mínima
    if (shippingCost < MIN_SHIPPING_COST) {
      shippingCost = MIN_SHIPPING_COST
    }

    // Verifica se tem frete grátis
    const freeShipping = request.cart_total >= FREE_SHIPPING_THRESHOLD
    
    if (freeShipping) {
      shippingCost = 0
    }

    // Calcula quanto falta para frete grátis
    const freeShippingRemaining = freeShipping 
      ? 0 
      : Math.max(0, FREE_SHIPPING_THRESHOLD - request.cart_total)

    // Converte duração para minutos
    const estimatedTimeMinutes = Math.ceil(durationSeconds / 60)

    return {
      distance_km: Math.round(distanceKm * 100) / 100, // 2 casas decimais
      shipping_cost: Math.round(shippingCost * 100) / 100, // 2 casas decimais
      estimated_time_minutes: estimatedTimeMinutes,
      free_shipping: freeShipping,
      free_shipping_remaining: Math.round(freeShippingRemaining * 100) / 100,
      delivery_address: deliveryAddress
    }
  } catch (error) {
    console.error('Erro ao calcular frete:', error)
    throw error
  }
}

/**
 * Verifica se o CEP está dentro da área de entrega
 * (Opcional: adicionar limite de distância máxima)
 */
export function isWithinDeliveryArea(distanceKm: number): boolean {
  const MAX_DELIVERY_DISTANCE_KM = 50 // Máximo 50km
  return distanceKm <= MAX_DELIVERY_DISTANCE_KM
}
