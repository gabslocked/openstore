#!/usr/bin/env node

/**
 * Script para definir um usuário como administrador
 * 
 * Uso:
 *   node scripts/set-admin.js <email>
 * 
 * Exemplo:
 *   node scripts/set-admin.js admin@ezpods.com
 */

const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/ezpods'
})

async function setAdmin(email) {
  const client = await pool.connect()
  
  try {
    console.log(`🔍 Procurando usuário: ${email}`)
    
    // Busca o usuário
    const userResult = await client.query(
      'SELECT id, name, email, is_admin FROM users WHERE email = $1',
      [email]
    )
    
    if (userResult.rows.length === 0) {
      console.error(`❌ Usuário não encontrado: ${email}`)
      process.exit(1)
    }
    
    const user = userResult.rows[0]
    
    if (user.is_admin) {
      console.log(`✅ ${user.name} (${user.email}) já é admin!`)
      return
    }
    
    // Define como admin
    await client.query(
      'UPDATE users SET is_admin = TRUE WHERE id = $1',
      [user.id]
    )
    
    console.log(`✅ ${user.name} (${user.email}) agora é admin!`)
    
  } catch (error) {
    console.error('❌ Erro:', error.message)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

// Pega o email dos argumentos
const email = process.argv[2]

if (!email) {
  console.error('❌ Uso: node scripts/set-admin.js <email>')
  console.error('   Exemplo: node scripts/set-admin.js admin@ezpods.com')
  process.exit(1)
}

setAdmin(email)
