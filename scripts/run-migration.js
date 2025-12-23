const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigration(migrationFile) {
  const client = await pool.connect();
  
  try {
    console.log(`\n🚀 Executando migration: ${migrationFile}`);
    
    const migrationPath = path.join(__dirname, '..', 'migrations', migrationFile);
    const sql = fs.readFileSync(migrationPath, 'utf-8');
    
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    
    console.log(`✅ Migration ${migrationFile} executada com sucesso!`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`❌ Erro ao executar migration ${migrationFile}:`, error);
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  try {
    console.log('📦 Conectando ao banco de dados...');
    
    // Testa conexão
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✅ Conectado ao banco:', result.rows[0].now);
    client.release();
    
    // Lista migrations disponíveis
    const migrationsDir = path.join(__dirname, '..', 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();
    
    console.log(`\n📋 Encontradas ${files.length} migration(s):`);
    files.forEach(f => console.log(`   - ${f}`));
    
    // Executa cada migration
    for (const file of files) {
      await runMigration(file);
    }
    
    console.log('\n🎉 Todas as migrations foram executadas com sucesso!');
    
  } catch (error) {
    console.error('\n❌ Erro:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
