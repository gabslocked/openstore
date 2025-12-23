import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'
import jwt from 'jsonwebtoken'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: 'Database configuration not found' }, { status: 500 });
    }

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
    
    try {
      // Update product basic info
      await client.query(
        'UPDATE products SET name = $1, description = $2, price = $3, original_price = $4, stock = $5, visible = $6 WHERE id = $7',
        [name, description, price, original_price, stock, visible, params.id]
      )
      
      // Update categories if provided
      if (category_ids && Array.isArray(category_ids)) {
        // Remove existing category associations
        await client.query('DELETE FROM product_categories WHERE product_id = $1', [params.id])
        
        // Add new category associations
        for (const categoryId of category_ids) {
          await client.query(
            'INSERT INTO product_categories (product_id, category_id) VALUES ($1, $2)',
            [params.id, categoryId]
          )
        }
      }
      
      // Update images if provided
      if (images && Array.isArray(images)) {
        // Remove existing images
        await client.query('DELETE FROM product_images WHERE product_id = $1', [params.id])
        
        // Add new images
        for (let i = 0; i < images.length; i++) {
          await client.query(
            'INSERT INTO product_images (product_id, image_url, display_order) VALUES ($1, $2, $3)',
            [params.id, images[i], i]
          )
        }
      }
      
      return NextResponse.json({ success: true })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Update product error:", error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: 'Database configuration not found' }, { status: 500 });
    }

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

    const client = await pool.connect()
    
    try {
      // Delete related data first (foreign key constraints)
      await client.query('DELETE FROM product_modifier_categories WHERE product_id = $1', [params.id])
      await client.query('DELETE FROM product_images WHERE product_id = $1', [params.id])
      await client.query('DELETE FROM product_variants WHERE product_id = $1', [params.id])
      await client.query('DELETE FROM products WHERE id = $1', [params.id])
      
      return NextResponse.json({ success: true })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Delete product error:", error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
