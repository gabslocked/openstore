/**
 * Core E-commerce Types
 * Generic types for any e-commerce application
 */

/**
 * Product entity
 */
export interface Product {
  id: string
  name: string
  description?: string
  position: number
  visible: boolean
  images: Array<{ image_url: string }>
  product_variants: ProductVariant[]
  modifier_categories: ModifierCategory[]
  // Compatibility fields for legacy code
  nome?: string
  descricao?: string
  categoria?: string
  preco?: number
  imagem?: string
  codigo?: string
  ativo?: boolean
  mostrarNoCatalogo?: boolean
  price?: string | number
  categories?: string
  sku?: string
  stock?: number
  originalPrice?: number
}

/**
 * Product variant (size, color, flavor, etc.)
 */
export interface ProductVariant {
  id: string
  name?: string
  sku?: string
  price: number
  original_price?: number
  originalPrice?: number
  cost?: number
  stock: number
  weight_kg?: number
  color_hex?: string
  flavor?: string
  size?: string
  position?: number
  visible?: boolean
}

/**
 * Modifier category for product customization
 */
export interface ModifierCategory {
  id: string
  name: string
  minModifiers: number
  maxModifiers: number
  type: "one" | "many"
  required: boolean
  position: number
  modifiers: Modifier[]
}

/**
 * Individual modifier option
 */
export interface Modifier {
  id: string
  name: string
  cost: number
  price: number
  originalPrice: number
  position: number
  maxLimit: number
  visible: boolean
}

/**
 * Category entity
 */
export interface Category {
  id: string
  name: string
  description?: string
  position: number
  visible: boolean
  products?: Product[]
}

/**
 * Paginated result
 */
export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

/**
 * Order status
 */
export type OrderStatus = 
  | 'pending'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'failed'
  | 'refunded'
