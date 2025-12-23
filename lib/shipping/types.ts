export interface ShippingCalculationRequest {
  cep: string
  cart_total: number
}

export interface ShippingCalculationResponse {
  distance_km: number
  shipping_cost: number
  estimated_time_minutes: number
  free_shipping: boolean
  free_shipping_remaining: number
  delivery_address?: string
}

export interface Coordinates {
  lat: number
  lon: number
}

export interface GeocodingResult {
  lat: string
  lon: string
  display_name: string
}

export interface OSRMRoute {
  distance: number // em metros
  duration: number // em segundos
}
