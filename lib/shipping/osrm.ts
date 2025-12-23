import type { Coordinates, OSRMRoute } from './types'

const OSRM_API_URL = 'https://router.project-osrm.org'

/**
 * Calcula a rota entre dois pontos usando OSRM
 */
export async function calculateRoute(
  origin: Coordinates,
  destination: Coordinates
): Promise<OSRMRoute> {
  try {
    const url = `${OSRM_API_URL}/route/v1/driving/${origin.lon},${origin.lat};${destination.lon},${destination.lat}?overview=false`

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'EzPods-Delivery-App/1.0'
      }
    })

    if (!response.ok) {
      throw new Error(`OSRM API error: ${response.status}`)
    }

    const data = await response.json()

    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      throw new Error('Não foi possível calcular a rota')
    }

    const route = data.routes[0]

    return {
      distance: route.distance, // em metros
      duration: route.duration  // em segundos
    }
  } catch (error) {
    console.error('Erro ao calcular rota:', error)
    throw new Error('Erro ao calcular distância e tempo de entrega')
  }
}

/**
 * Calcula a distância em linha reta entre dois pontos (Haversine)
 * Usado como fallback se OSRM falhar
 */
export function calculateStraightLineDistance(
  origin: Coordinates,
  destination: Coordinates
): number {
  const R = 6371 // Raio da Terra em km
  const dLat = toRad(destination.lat - origin.lat)
  const dLon = toRad(destination.lon - origin.lon)
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(origin.lat)) *
    Math.cos(toRad(destination.lat)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  
  return distance * 1000 // Retorna em metros
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180)
}
