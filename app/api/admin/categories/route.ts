import { NextRequest, NextResponse } from 'next/server'
import { getAdminCategories } from '@/lib/dal'
import jwt from 'jsonwebtoken'
import { randomUUID } from 'crypto'
import { Pool } from 'pg'

const client = new Pool({
  connectionString: process.env.DATABASE_URL
})

export async function GET(request: NextRequest) {
  // Verify admin authentication
  const adminToken = request.cookies.get('admin_token')?.value
  if (!adminToken) {
    console.log("Admin authentication failed for categories API - no token")
    return NextResponse.json({ error: 'Admin authentication required' }, { status: 401 })
  }

  try {
    jwt.verify(adminToken, process.env.JWT_SECRET || 'fallback-secret')
  } catch (error) {
    console.log("Admin authentication failed for categories API - invalid token")
    return NextResponse.json({ error: 'Invalid admin token' }, { status: 401 })
  }

  try {
    console.log("=== ADMIN CATEGORIES API START ===")
    
    const categories = await getAdminCategories()
    
    console.log("Categories fetched successfully:", categories?.length || 0)
    console.log("=== ADMIN CATEGORIES API SUCCESS ===")
    
    return NextResponse.json({ categories })
  } catch (error) {
    console.error("Categories API Error:", error)
    return NextResponse.json({ categories: [], error: "Failed to fetch categories" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  // Verify admin authentication
  const adminToken = request.cookies.get('admin_token')?.value
  if (!adminToken) {
    return NextResponse.json({ error: 'Admin authentication required' }, { status: 401 })
  }

  try {
    jwt.verify(adminToken, process.env.JWT_SECRET || 'fallback-secret')
  } catch (error) {
    return NextResponse.json({ error: 'Invalid admin token' }, { status: 401 })
  }

  try {
    const { name, description } = await request.json()
    
    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Nome da categoria é obrigatório' }, { status: 400 })
    }

    const categoryId = randomUUID()
    
    await client.query(
      'INSERT INTO categories (id, name, description, position, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW())',
      [categoryId, name.trim(), description?.trim() || null, 0]
    )

    console.log("Category created successfully:", categoryId)
    
    return NextResponse.json({ success: true, id: categoryId })
  } catch (error) {
    console.error("Create category error:", error)
    return NextResponse.json({ error: 'Erro ao criar categoria' }, { status: 500 })
  }
}
