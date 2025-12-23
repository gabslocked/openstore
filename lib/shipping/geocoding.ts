import type { Coordinates, GeocodingResult } from './types'

// Coordenadas do estoque: Avenida Fagundes de Oliveira 519, Piraporinha
export const WAREHOUSE_COORDINATES: Coordinates = {
  lat: -23.6947,
  lon: -46.5558
}

/**
 * Busca informações de endereço pelo CEP usando ViaCEP
 */
export async function getAddressFromCEP(cep: string): Promise<any> {
  const cleanCEP = cep.replace(/\D/g, '')
  
  if (cleanCEP.length !== 8) {
    throw new Error('CEP inválido')
  }

  const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`)
  
  if (!response.ok) {
    throw new Error('Erro ao buscar CEP')
  }

  const data = await response.json()
  
  if (data.erro) {
    throw new Error('CEP não encontrado')
  }

  return data
}

/**
 * Converte CEP em coordenadas geográficas usando Nominatim
 */
export async function geocodeCEP(cep: string): Promise<Coordinates> {
  try {
    const cleanCEP = cep.replace(/\D/g, '')
    
    // Primeiro tenta buscar o endereço completo via ViaCEP
    const address = await getAddressFromCEP(cleanCEP)
    
    // Monta a query de busca com o endereço completo
    const searchQuery = `${address.logradouro}, ${address.bairro}, ${address.localidade}, ${address.uf}, Brazil`
    
    // Busca as coordenadas usando Nominatim
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?` +
      `q=${encodeURIComponent(searchQuery)}&` +
      `format=json&` +
      `limit=1&` +
      `countrycodes=br`,
      {
        headers: {
          'User-Agent': 'EzPods-Delivery-App/1.0'
        }
      }
    )

    if (!response.ok) {
      throw new Error('Erro ao geocodificar endereço')
    }

    const results: GeocodingResult[] = await response.json()

    if (results.length === 0) {
      // Fallback: tenta apenas com o CEP
      const fallbackResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `postalcode=${cleanCEP}&` +
        `country=BR&` +
        `format=json&` +
        `limit=1`,
        {
          headers: {
            'User-Agent': 'EzPods-Delivery-App/1.0'
          }
        }
      )

      const fallbackResults: GeocodingResult[] = await fallbackResponse.json()
      
      if (fallbackResults.length === 0) {
        throw new Error('Não foi possível encontrar as coordenadas para este CEP')
      }

      return {
        lat: parseFloat(fallbackResults[0].lat),
        lon: parseFloat(fallbackResults[0].lon)
      }
    }

    return {
      lat: parseFloat(results[0].lat),
      lon: parseFloat(results[0].lon)
    }
  } catch (error) {
    console.error('Erro ao geocodificar CEP:', error)
    throw error
  }
}

/**
 * Valida se um CEP é válido
 */
export function isValidCEP(cep: string): boolean {
  const cleanCEP = cep.replace(/\D/g, '')
  return cleanCEP.length === 8
}

/**
 * Formata CEP para exibição (12345-678)
 */
export function formatCEP(cep: string): string {
  const cleanCEP = cep.replace(/\D/g, '')
  if (cleanCEP.length !== 8) return cep
  return `${cleanCEP.slice(0, 5)}-${cleanCEP.slice(5)}`
}
