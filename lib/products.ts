import type { Product } from "./types"
import { getProductsFromDB } from "./products-db"
import { query } from "./infrastructure/database/pool"

/**
 * Get products from PostgreSQL database
 * This is the main function for fetching products in the e-commerce
 */
export async function getProducts(
  category?: string,
  searchQuery?: string,
  page = 1,
  limit = 30,
): Promise<{ products: Product[]; total: number }> {
  try {
    const result = await getProductsFromDB(category, searchQuery, page, limit)
    
    // Map database products to Product interface
    const products: Product[] = result.products.map((dbProduct: any) => ({
      id: dbProduct.id,
      name: dbProduct.name,
      description: dbProduct.description,
      position: dbProduct.display_order || 0,
      visible: dbProduct.visible,
      images: dbProduct.images || [],
      product_variants: dbProduct.variants || [],
      modifier_categories: [],
      // Legacy compatibility fields
      nome: dbProduct.name,
      descricao: dbProduct.description,
      categoria: dbProduct.categories?.[0]?.name || '',
      preco: dbProduct.variants?.[0]?.price || 0,
      imagem: dbProduct.images?.[0]?.image_url || '',
      codigo: dbProduct.variants?.[0]?.sku || '',
      ativo: dbProduct.visible,
      mostrarNoCatalogo: dbProduct.visible,
      price: dbProduct.variants?.[0]?.price || 0,
      categories: dbProduct.categories?.[0]?.name || '',
      sku: dbProduct.variants?.[0]?.sku || '',
      stock: dbProduct.variants?.[0]?.stock || 0,
      originalPrice: dbProduct.variants?.[0]?.original_price || 0,
    }))

    return { products, total: result.total }
  } catch (error) {
    console.error("Error reading products:", error)
    return { products: [], total: 0 }
  }
}

/**
 * Get all categories from PostgreSQL database
 */
export async function getCategories(): Promise<string[]> {
  try {
    const rows = await query<{ name: string }>(
      'SELECT name FROM categories WHERE visible = true ORDER BY name'
    )
    return rows.map(row => row.name)
  } catch (error) {
    console.error("Error getting categories:", error)
    return []
  }
}
