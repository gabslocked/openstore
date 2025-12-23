import { Pool } from 'pg'
import type { Product } from './types'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

/**
 * Busca produtos do banco de dados PostgreSQL com suas variações
 */
export async function getProductsFromDB(
  category?: string,
  searchQuery?: string,
  page = 1,
  limit = 30,
  includeVariants = true
): Promise<{ products: any[]; total: number }> {
  const client = await pool.connect()

  try {
    let whereConditions: string[] = ['p.visible = true']
    const values: any[] = []
    let paramCount = 1

    // Filtro por categoria
    if (category) {
      whereConditions.push(`EXISTS (
        SELECT 1 FROM product_categories pc
        JOIN categories c ON pc.category_id = c.id
        WHERE pc.product_id = p.id AND LOWER(c.name) = LOWER($${paramCount})
      )`)
      values.push(category)
      paramCount++
    }

    // Filtro por busca
    if (searchQuery) {
      whereConditions.push(`(
        LOWER(p.name) LIKE LOWER($${paramCount}) OR
        LOWER(p.description) LIKE LOWER($${paramCount})
      )`)
      values.push(`%${searchQuery}%`)
      paramCount++
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : ''

    // Conta total de produtos
    const countResult = await client.query(
      `SELECT COUNT(DISTINCT p.id) as count 
       FROM products p 
       ${whereClause}`,
      values
    )
    const total = parseInt(countResult.rows[0].count)

    // Busca produtos com paginação
    const offset = (page - 1) * limit
    values.push(limit, offset)

    const productsQuery = `
      SELECT 
        p.*,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', c.id,
              'name', c.name
            )
          ) FILTER (WHERE c.id IS NOT NULL),
          '[]'
        ) as categories,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', pi.id,
              'image_url', pi.image_url,
              'display_order', pi.display_order
            ) ORDER BY jsonb_build_object('display_order', pi.display_order)
          ) FILTER (WHERE pi.id IS NOT NULL),
          '[]'
        ) as images
        ${includeVariants ? `,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', pv.id,
              'name', pv.name,
              'sku', pv.sku,
              'price', pv.price,
              'original_price', pv.original_price,
              'stock', pv.stock,
              'weight_kg', pv.weight_kg,
              'color_hex', pv.color_hex,
              'flavor', pv.flavor,
              'size', pv.size,
              'display_order', pv.display_order,
              'visible', pv.visible
            ) ORDER BY jsonb_build_object('display_order', pv.display_order)
          ) FILTER (WHERE pv.id IS NOT NULL),
          '[]'
        ) as variants` : ''}
      FROM products p
      LEFT JOIN product_categories pc ON p.id = pc.product_id
      LEFT JOIN categories c ON pc.category_id = c.id
      LEFT JOIN product_images pi ON p.id = pi.product_id
      ${includeVariants ? 'LEFT JOIN product_variants pv ON p.id = pv.product_id' : ''}
      ${whereClause}
      GROUP BY p.id
      ORDER BY p.created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `

    const result = await client.query(productsQuery, values)

    return {
      products: result.rows,
      total
    }
  } catch (error) {
    console.error('Error fetching products from DB:', error)
    throw error
  } finally {
    client.release()
  }
}

/**
 * Busca um produto específico com suas variações
 */
export async function getProductByIdFromDB(productId: string): Promise<any | null> {
  const client = await pool.connect()

  try {
    const result = await client.query(
      `SELECT 
        p.*,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', c.id,
              'name', c.name
            )
          ) FILTER (WHERE c.id IS NOT NULL),
          '[]'
        ) as categories,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', pi.id,
              'image_url', pi.image_url,
              'display_order', pi.display_order
            ) ORDER BY jsonb_build_object('display_order', pi.display_order)
          ) FILTER (WHERE pi.id IS NOT NULL),
          '[]'
        ) as images,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', pv.id,
              'name', pv.name,
              'sku', pv.sku,
              'price', pv.price,
              'original_price', pv.original_price,
              'stock', pv.stock,
              'weight_kg', pv.weight_kg,
              'color_hex', pv.color_hex,
              'flavor', pv.flavor,
              'size', pv.size,
              'display_order', pv.display_order,
              'visible', pv.visible
            ) ORDER BY jsonb_build_object('display_order', pv.display_order)
          ) FILTER (WHERE pv.id IS NOT NULL),
          '[]'
        ) as variants
      FROM products p
      LEFT JOIN product_categories pc ON p.id = pc.product_id
      LEFT JOIN categories c ON pc.category_id = c.id
      LEFT JOIN product_images pi ON p.id = pi.product_id
      LEFT JOIN product_variants pv ON p.id = pv.product_id
      WHERE p.id = $1
      GROUP BY p.id`,
      [productId]
    )

    return result.rows[0] || null
  } finally {
    client.release()
  }
}
