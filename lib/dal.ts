import 'server-only'
import { cookies } from 'next/headers'
import { Pool } from 'pg'
import jwt from 'jsonwebtoken'
import { cache } from 'react'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export const verifyAdminSession = cache(async () => {
  try {
    const adminToken = (await cookies()).get('admin_token')?.value
    
    if (!adminToken) {
      return { isAuth: false, error: 'No admin token found' }
    }

    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret'
    const decoded = jwt.verify(adminToken, jwtSecret) as any
    
    if (!decoded.isAdmin) {
      return { isAuth: false, error: 'Not an admin user' }
    }

    return { 
      isAuth: true, 
      userId: decoded.userId,
      email: decoded.email,
      name: decoded.name,
      isAdmin: decoded.isAdmin
    }
  } catch (error) {
    console.error('Admin session verification failed:', error)
    return { isAuth: false, error: 'Invalid admin token' }
  }
})

export const getAdminStats = cache(async () => {
  const session = await verifyAdminSession()
  if (!session.isAuth) return null

  const client = await pool.connect()
  
  try {
    const [usersResult, productsResult, categoriesResult] = await Promise.all([
      client.query('SELECT COUNT(*) as count FROM users'),
      client.query('SELECT COUNT(*) as count FROM products'),
      client.query('SELECT COUNT(*) as count FROM categories')
    ])

    return {
      totalUsers: parseInt(usersResult.rows[0].count) || 0,
      totalProducts: parseInt(productsResult.rows[0].count) || 0,
      totalCategories: parseInt(categoriesResult.rows[0].count) || 0,
      totalOrders: 0 // Orders table doesn't exist yet
    }
  } catch (error) {
    console.error('Failed to fetch admin stats:', error)
    return null
  } finally {
    client.release()
  }
})

export const getAdminUsers = cache(async () => {
  const session = await verifyAdminSession()
  if (!session.isAuth) return null

  const client = await pool.connect()
  
  try {
    const result = await client.query(`
      SELECT id, name, email, whatsapp, email_verified, created_at 
      FROM users 
      ORDER BY created_at DESC
    `)
    
    return result.rows
  } catch (error) {
    console.error('Failed to fetch users:', error)
    return null
  } finally {
    client.release()
  }
})

export const getAdminProducts = cache(async () => {
  const session = await verifyAdminSession()
  if (!session.isAuth) return null

  const client = await pool.connect()
  
  try {
    const result = await client.query(`
      SELECT 
        p.id,
        p.name,
        p.description,
        p.visible,
        p.created_at,
        c.name as category_name,
        pv.price,
        pv.original_price,
        pv.stock
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_variants pv ON p.id = pv.product_id
      ORDER BY p.created_at DESC
    `)
    
    return result.rows
  } catch (error) {
    console.error('Failed to fetch products:', error)
    return null
  } finally {
    client.release()
  }
})

export const getAdminCategories = cache(async () => {
  const session = await verifyAdminSession()
  if (!session.isAuth) return null

  const client = await pool.connect()
  
  try {
    const result = await client.query(`
      SELECT id, name, description, visible, created_at 
      FROM categories 
      ORDER BY created_at DESC
    `)
    
    return result.rows
  } catch (error) {
    console.error('Failed to fetch categories:', error)
    return null
  } finally {
    client.release()
  }
})
