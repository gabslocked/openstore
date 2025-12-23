import { NextResponse } from "next/server"
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: 'Database configuration not found' }, { status: 500 });
    }

    const client = await pool.connect()
    
    try {
      // Get categories with all nested data
      const categoriesQuery = `
        SELECT 
          c.id,
          c.name,
          c.position,
          json_agg(
            json_build_object(
              'product_category_id', p.category_id,
              'description', p.description,
              'id', p.id,
              'kitchen_id', p.kitchen_id,
              'stock_enabled', p.stock_enabled,
              'messages_for_customers', p.messages_for_customers,
              'name', p.name,
              'position', p.position,
              'visible', p.visible,
              'images', COALESCE(p.images, '[]'::json),
              'product_variants', COALESCE(p.variants, '[]'::json),
              'modifier_categories', COALESCE(p.modifier_categories, '[]'::json)
            ) ORDER BY p.position
          ) FILTER (WHERE p.id IS NOT NULL) as products
        FROM categories c
        LEFT JOIN (
          SELECT 
            p.*,
            json_agg(
              json_build_object(
                'id', pi.id,
                'image', pi.image,
                'image_url', pi.image_url,
                'position', pi.position
              ) ORDER BY pi.position
            ) FILTER (WHERE pi.id IS NOT NULL) as images,
            json_agg(
              json_build_object(
                'id', pv.id,
                'cost', pv.cost,
                'created_at', pv.created_at,
                'name', pv.name,
                'packaging_price', pv.packaging_price,
                'position', pv.position,
                'price', pv.price,
                'original_price', pv.original_price,
                'sku', pv.sku,
                'stock_threshold', pv.stock_threshold,
                'stock', pv.stock,
                'updated_at', pv.updated_at
              ) ORDER BY pv.position
            ) FILTER (WHERE pv.id IS NOT NULL) as variants,
            json_agg(
              json_build_object(
                'id', mc.id,
                'name', mc.name,
                'min_modifiers', mc.min_modifiers,
                'max_modifiers', mc.max_modifiers,
                'company_id', mc.company_id,
                'type', mc.type,
                'is_active', mc.is_active,
                'required', mc.required,
                'position', mc.position,
                'product_modifier_category_position', pmc.position,
                'modifiers', COALESCE(mc.modifiers, '[]'::json)
              ) ORDER BY pmc.position
            ) FILTER (WHERE mc.id IS NOT NULL) as modifier_categories
          FROM products p
          LEFT JOIN product_images pi ON p.id = pi.product_id
          LEFT JOIN product_variants pv ON p.id = pv.product_id
          LEFT JOIN product_modifier_categories pmc ON p.id = pmc.product_id
          LEFT JOIN (
            SELECT 
              mc.*,
              json_agg(
                json_build_object(
                  'id', m.id,
                  'name', m.name,
                  'cost', m.cost,
                  'original_price', m.original_price,
                  'price', m.price,
                  'sku', m.sku,
                  'modifier_category_id', m.modifier_category_id,
                  'position', m.position,
                  'max_limit', m.max_limit,
                  'visible', m.visible
                ) ORDER BY m.position
              ) FILTER (WHERE m.id IS NOT NULL) as modifiers
            FROM modifier_categories mc
            LEFT JOIN modifiers m ON mc.id = m.modifier_category_id
            GROUP BY mc.id, mc.name, mc.min_modifiers, mc.max_modifiers, mc.company_id, mc.type, mc.is_active, mc.required, mc.position, mc.created_at, mc.updated_at
          ) mc ON pmc.modifier_category_id = mc.id
          GROUP BY p.id, p.category_id, p.name, p.description, p.position, p.visible, p.kitchen_id, p.stock_enabled, p.messages_for_customers, p.created_at, p.updated_at
        ) p ON c.id = p.category_id
        GROUP BY c.id, c.name, c.position
        ORDER BY c.position;
      `
      
      const result = await client.query(categoriesQuery)
      
      const response = NextResponse.json({ data: result.rows })
      response.headers.set("Cache-Control", "public, s-maxage=600, stale-while-revalidate=1200")
      
      return response
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ data: [], error: "Failed to fetch categories" }, { status: 500 })
  }
}
