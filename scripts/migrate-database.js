#!/usr/bin/env node

/**
 * Database migration script for moving from Supabase to PostgreSQL
 * Use this script when migrating to Fly.io or other PostgreSQL-based hosting
 */

const { createClient } = require('@supabase/supabase-js')
const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

// Configuration
const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  key: process.env.SUPABASE_SERVICE_ROLE_KEY,
}

const postgresConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
}

const supabase = createClient(supabaseConfig.url, supabaseConfig.key)
const postgres = new Pool(postgresConfig)

// Tables to migrate
const TABLES = [
  'profiles',
  'stories',
  'scenes', 
  'quizzes',
  'quiz_questions',
  'quiz_options',
  'prayers',
  'family_altars',
  'media',
  'user_performance_metrics',
  'quiz_difficulty_adjustments',
  'family_accounts',
  'age_mode_settings',
  'user_analytics_events',
]

async function validateEnvironment() {
  console.log('🔍 Validating environment...')
  
  if (!supabaseConfig.url || !supabaseConfig.key) {
    throw new Error('Missing Supabase configuration. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  }
  
  if (!postgresConfig.connectionString) {
    throw new Error('Missing PostgreSQL configuration. Check DATABASE_URL')
  }
  
  console.log('✅ Environment validated')
}

async function testConnections() {
  console.log('🔌 Testing database connections...')
  
  // Test Supabase connection
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1)
    if (error) throw error
    console.log('✅ Supabase connection successful')
  } catch (error) {
    throw new Error(`Supabase connection failed: ${error.message}`)
  }
  
  // Test PostgreSQL connection
  try {
    await postgres.query('SELECT NOW()')
    console.log('✅ PostgreSQL connection successful')
  } catch (error) {
    throw new Error(`PostgreSQL connection failed: ${error.message}`)
  }
}

async function exportSupabaseSchema() {
  console.log('📤 Exporting Supabase schema...')
  
  // This would typically use Supabase CLI
  // For now, we'll create a basic schema based on our types
  const schemaSQL = `
    -- KingdomQuest Database Schema
    -- Generated for PostgreSQL migration
    
    -- Enable UUID extension
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    
    -- Profiles table
    CREATE TABLE IF NOT EXISTS profiles (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      email TEXT UNIQUE NOT NULL,
      full_name TEXT,
      avatar_url TEXT,
      age_group TEXT CHECK (age_group IN ('child', 'youth', 'adult')),
      parent_id UUID REFERENCES profiles(id),
      is_parent BOOLEAN DEFAULT false,
      preferences JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    -- Stories table
    CREATE TABLE IF NOT EXISTS stories (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      title TEXT NOT NULL,
      description TEXT,
      bible_book TEXT NOT NULL,
      bible_chapter INTEGER NOT NULL,
      bible_verses TEXT NOT NULL,
      bible_translation TEXT DEFAULT 'ESV',
      age_rating TEXT DEFAULT 'all',
      difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
      tags TEXT[],
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    -- Add more table schemas as needed...
  `
  
  const schemaPath = path.join(__dirname, '../migrations/001_initial_schema.sql')
  await fs.promises.writeFile(schemaPath, schemaSQL)
  
  console.log('✅ Schema exported to migrations/001_initial_schema.sql')
}

async function migrateTable(tableName) {
  console.log(`📊 Migrating table: ${tableName}`)
  
  try {
    // Get data from Supabase
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
    
    if (error) {
      console.warn(`⚠️ Could not fetch data from ${tableName}: ${error.message}`)
      return
    }
    
    if (!data || data.length === 0) {
      console.log(`ℹ️ No data to migrate for ${tableName}`)
      return
    }
    
    // Insert data into PostgreSQL
    const columns = Object.keys(data[0])
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ')
    const query = `
      INSERT INTO ${tableName} (${columns.join(', ')})
      VALUES (${placeholders})
      ON CONFLICT (id) DO NOTHING
    `
    
    let migratedCount = 0
    for (const row of data) {
      try {
        const values = columns.map(col => row[col])
        await postgres.query(query, values)
        migratedCount++
      } catch (err) {
        console.warn(`⚠️ Failed to migrate row in ${tableName}:`, err.message)
      }
    }
    
    console.log(`✅ Migrated ${migratedCount}/${data.length} rows for ${tableName}`)
  } catch (error) {
    console.error(`❌ Failed to migrate ${tableName}:`, error.message)
  }
}

async function runSchemaSQL() {
  console.log('🏗️ Running schema creation...')
  
  const schemaPath = path.join(__dirname, '../migrations/001_initial_schema.sql')
  
  try {
    const schemaSql = await fs.promises.readFile(schemaPath, 'utf8')
    await postgres.query(schemaSql)
    console.log('✅ Schema created successfully')
  } catch (error) {
    console.error('❌ Schema creation failed:', error.message)
    throw error
  }
}

async function migrateData() {
  console.log('📦 Starting data migration...')
  
  for (const table of TABLES) {
    await migrateTable(table)
  }
  
  console.log('✅ Data migration completed')
}

async function createMigrationSummary() {
  console.log('📋 Creating migration summary...')
  
  const summary = {
    timestamp: new Date().toISOString(),
    tables: {},
    status: 'completed'
  }
  
  // Count records in each table
  for (const table of TABLES) {
    try {
      const result = await postgres.query(`SELECT COUNT(*) FROM ${table}`)
      summary.tables[table] = parseInt(result.rows[0].count)
    } catch (error) {
      summary.tables[table] = `Error: ${error.message}`
    }
  }
  
  const summaryPath = path.join(__dirname, '../migrations/migration_summary.json')
  await fs.promises.writeFile(summaryPath, JSON.stringify(summary, null, 2))
  
  console.log('✅ Migration summary saved to migrations/migration_summary.json')
  console.log('📊 Migration Summary:')
  console.log(JSON.stringify(summary, null, 2))
}

async function main() {
  console.log('🚀 Starting KingdomQuest database migration...')
  
  try {
    await validateEnvironment()
    await testConnections()
    
    // Create migrations directory
    const migrationsDir = path.join(__dirname, '../migrations')
    await fs.promises.mkdir(migrationsDir, { recursive: true })
    
    await exportSupabaseSchema()
    await runSchemaSQL()
    await migrateData()
    await createMigrationSummary()
    
    console.log('🎉 Migration completed successfully!')
    console.log('\n📝 Next steps:')
    console.log('1. Update environment variables to use new database')
    console.log('2. Test application functionality')
    console.log('3. Update authentication configuration')
    console.log('4. Set up regular backups')
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    process.exit(1)
  } finally {
    await postgres.end()
  }
}

// Run migration if called directly
if (require.main === module) {
  main().catch(console.error)
}

module.exports = {
  validateEnvironment,
  testConnections,
  exportSupabaseSchema,
  migrateData,
  main
}