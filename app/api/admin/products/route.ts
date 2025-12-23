import { NextRequest, NextResponse } from 'next/server'
import { getAdminProducts } from '@/lib/dal'
import { Pool } from 'pg'
import jwt from 'jsonwebtoken'
import { randomUUID } from 'crypto'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function GET(request: NextRequest) {
  try {
    console.log("=== ADMIN PRODUCTS API START ===")
    
    const products = await getAdminProducts()
    
    if (!products) {
      console.log("Admin authentication failed for products API")
      return NextResponse.json({ error: 'Admin authentication required' }, { status: 401 })
    }

    console.log("Products fetched successfully:", products.length)
    console.log("=== ADMIN PRODUCTS API SUCCESS ===")
    
    return NextResponse.json({ products })
  } catch (error) {
    console.error("Products API Error:", error)
    return NextResponse.json({ products: [], error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("=== ADMIN CREATE PRODUCT API START ===")
    
    // Check admin authentication
    const adminToken = request.cookies.get('admin_token')?.value
    if (!adminToken) {
      return NextResponse.json({ error: 'Admin authentication required' }, { status: 401 })
    }

    try {
      jwt.verify(adminToken, process.env.JWT_SECRET || 'fallback-secret')
    } catch (error) {
      return NextResponse.json({ error: 'Invalid admin token' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, price, original_price, stock, visible, category_ids, images } = body
    
    const client = await pool.connect()
    const productId = randomUUID()
    
    try {
      // Insert product
      await client.query(
        'INSERT INTO products (id, name, description, price, original_price, stock, visible) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [productId, name, description || '', price || 0, original_price || 0, stock || 0, visible !== false]
      )
      
      // Insert categories if provided
      if (category_ids && Array.isArray(category_ids)) {
        for (const categoryId of category_ids) {
          await client.query(
            'INSERT INTO product_categories (product_id, category_id) VALUES ($1, $2)',
            [productId, categoryId]
          )
        }
      }
      
      // Insert images if provided
      if (images && Array.isArray(images)) {
        for (let i = 0; i < images.length; i++) {
          await client.query(
            'INSERT INTO product_images (product_id, image_url, display_order) VALUES ($1, $2, $3)',
            [productId, images[i], i]
          )
        }
      }
      
      console.log("Product created successfully:", productId)
      console.log("=== ADMIN CREATE PRODUCT API SUCCESS ===")
      
      return NextResponse.json({ success: true, id: productId })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Create product error:", error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
