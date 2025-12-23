import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'
import jwt from 'jsonwebtoken'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

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
      jwt.verify(adminToken, process.env.JWT_SECRET!)
    } catch (error) {
      return NextResponse.json({ error: 'Invalid admin token' }, { status: 401 })
    }

    const client = await pool.connect()
    
    try {
      // Check if user exists and is not admin
      const userCheck = await client.query(
        'SELECT email FROM users WHERE id = $1',
        [params.id]
      )

      if (userCheck.rows.length === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      if (userCheck.rows[0].email === 'admin@ezpods.com') {
        return NextResponse.json({ error: 'Cannot delete admin user' }, { status: 403 })
      }

      // Delete user
      await client.query('DELETE FROM users WHERE id = $1', [params.id])
      
      return NextResponse.json({ success: true })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Delete user error:", error)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}
