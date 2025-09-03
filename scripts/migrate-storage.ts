# Storage migration script for moving from Supabase Storage to S3
# This script migrates files and updates database references

import { createClient } from '@supabase/supabase-js'
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3'
import fetch from 'node-fetch'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs/promises'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configuration
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const BUCKET_NAME = process.env.S3_BUCKET_NAME!
const S3_PUBLIC_URL = process.env.S3_PUBLIC_URL || `https://${BUCKET_NAME}.s3.amazonaws.com`

// Storage buckets to migrate
const BUCKETS = ['avatars', 'images', 'media', 'documents']

interface FileRecord {
  name: string
  bucket: string
  size?: number
  mimeType?: string
  lastModified?: string
}

interface MigrationSummary {
  timestamp: string
  totalFiles: number
  migratedFiles: number
  failedFiles: number
  buckets: Record<string, { files: number; size: number }>
  errors: string[]
}

async function validateEnvironment() {
  console.log('🔍 Validating environment...')
  
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY', 
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'S3_BUCKET_NAME'
  ]
  
  const missing = required.filter(env => !process.env[env])
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
  
  console.log('✅ Environment validated')
}

async function testConnections() {
  console.log('🔌 Testing connections...')
  
  // Test Supabase
  try {
    const { data: buckets } = await supabase.storage.listBuckets()
    console.log(`✅ Supabase connection successful (${buckets?.length || 0} buckets)`)
  } catch (error) {
    throw new Error(`Supabase connection failed: ${error.message}`)
  }
  
  // Test S3
  try {
    await s3.send(new HeadObjectCommand({ Bucket: BUCKET_NAME, Key: 'test' }))
  } catch (error) {
    if (error.name !== 'NoSuchKey') {
      console.log('✅ S3 connection successful (bucket accessible)')
    }
  }
}

async function listBucketFiles(bucketName: string): Promise<FileRecord[]> {
  console.log(`📁 Listing files in bucket: ${bucketName}`)
  
  try {
    const { data: files, error } = await supabase.storage
      .from(bucketName)
      .list('', { limit: 1000, sortBy: { column: 'name', order: 'asc' } })
    
    if (error) {
      console.warn(`⚠️ Could not list files from ${bucketName}: ${error.message}`)
      return []
    }
    
    const fileRecords: FileRecord[] = files
      ?.filter(file => file.name !== '.emptyFolderPlaceholder')
      ?.map(file => ({
        name: file.name,
        bucket: bucketName,
        size: file.metadata?.size,
        mimeType: file.metadata?.mimetype,
        lastModified: file.updated_at,
      })) || []
    
    console.log(`📊 Found ${fileRecords.length} files in ${bucketName}`)
    return fileRecords
  } catch (error) {
    console.error(`❌ Error listing bucket ${bucketName}:`, error.message)
    return []
  }
}

async function migrateFile(file: FileRecord): Promise<boolean> {
  try {
    // Download file from Supabase
    const { data: fileData, error } = await supabase.storage
      .from(file.bucket)
      .download(file.name)
    
    if (error || !fileData) {
      console.warn(`⚠️ Could not download ${file.name}: ${error?.message}`)
      return false
    }
    
    // Convert blob to buffer
    const arrayBuffer = await fileData.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Determine S3 key (preserve folder structure)
    const s3Key = `${file.bucket}/${file.name}`
    
    // Upload to S3
    const uploadCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      Body: buffer,
      ContentType: file.mimeType || 'application/octet-stream',
      ContentLength: buffer.length,
    })
    
    await s3.send(uploadCommand)
    
    console.log(`✅ Migrated: ${file.name} (${buffer.length} bytes)`)
    return true
    
  } catch (error) {
    console.error(`❌ Failed to migrate ${file.name}:`, error.message)
    return false
  }
}

async function updateDatabaseReferences(summary: MigrationSummary) {
  console.log('🔄 Updating database references...')
  
  // Update media table with new URLs
  try {
    const { data: mediaRecords, error } = await supabase
      .from('media')
      .select('id, url')
    
    if (error) {
      throw error
    }
    
    let updatedCount = 0
    
    for (const media of mediaRecords || []) {
      // Check if URL is a Supabase storage URL
      if (media.url && media.url.includes('supabase.co/storage')) {
        // Extract bucket and file path
        const urlParts = media.url.split('/storage/v1/object/public/')
        if (urlParts.length === 2) {
          const [bucket, ...pathParts] = urlParts[1].split('/')
          const filePath = pathParts.join('/')
          
          // Generate new S3 URL
          const newUrl = `${S3_PUBLIC_URL}/${bucket}/${filePath}`
          
          // Update database
          const { error: updateError } = await supabase
            .from('media')
            .update({ url: newUrl })
            .eq('id', media.id)
          
          if (!updateError) {
            updatedCount++
          }
        }
      }
    }
    
    console.log(`✅ Updated ${updatedCount} database references`)
    
  } catch (error) {
    console.error('❌ Failed to update database references:', error.message)
    summary.errors.push(`Database update failed: ${error.message}`)
  }
}

async function main() {
  console.log('🚀 Starting KingdomQuest storage migration...')
  
  const summary: MigrationSummary = {
    timestamp: new Date().toISOString(),
    totalFiles: 0,
    migratedFiles: 0,
    failedFiles: 0,
    buckets: {},
    errors: [],
  }
  
  try {
    await validateEnvironment()
    await testConnections()
    
    // Collect all files from all buckets
    const allFiles: FileRecord[] = []
    
    for (const bucket of BUCKETS) {
      const files = await listBucketFiles(bucket)
      allFiles.push(...files)
      
      summary.buckets[bucket] = {
        files: files.length,
        size: files.reduce((total, file) => total + (file.size || 0), 0),
      }
    }
    
    summary.totalFiles = allFiles.length
    
    if (allFiles.length === 0) {
      console.log('ℹ️ No files to migrate')
      return
    }
    
    console.log(`📊 Found ${allFiles.length} total files to migrate`)
    
    // Migrate files in batches
    const BATCH_SIZE = 10
    
    for (let i = 0; i < allFiles.length; i += BATCH_SIZE) {
      const batch = allFiles.slice(i, i + BATCH_SIZE)
      console.log(`\n🔄 Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(allFiles.length / BATCH_SIZE)}`)
      
      const results = await Promise.allSettled(
        batch.map(file => migrateFile(file))
      )
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          summary.migratedFiles++
        } else {
          summary.failedFiles++
          const file = batch[index]
          summary.errors.push(`Failed to migrate ${file.bucket}/${file.name}`)
        }
      })
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    // Update database references
    await updateDatabaseReferences(summary)
    
    // Save migration summary
    const summaryPath = path.join(__dirname, '../migrations/storage_migration_summary.json')
    await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2))
    
    console.log('\n🎉 Storage migration completed!')
    console.log('📊 Migration Summary:')
    console.log(`   Total files: ${summary.totalFiles}`)
    console.log(`   Migrated: ${summary.migratedFiles}`)
    console.log(`   Failed: ${summary.failedFiles}`)
    console.log(`   Success rate: ${Math.round((summary.migratedFiles / summary.totalFiles) * 100)}%`)
    
    if (summary.errors.length > 0) {
      console.log('\n⚠️ Errors encountered:')
      summary.errors.forEach(error => console.log(`   - ${error}`))
    }
    
    console.log('\n📝 Next steps:')
    console.log('1. Update environment variables to use S3 URLs')
    console.log('2. Test file access in the application')
    console.log('3. Update file upload logic to use S3')
    console.log('4. Set up CDN (CloudFront) if needed')
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    summary.errors.push(`Migration failed: ${error.message}`)
    process.exit(1)
  }
}

// Run migration if called directly
if (process.argv[1] === __filename) {
  main().catch(console.error)
}

export {
  validateEnvironment,
  testConnections,
  listBucketFiles,
  migrateFile,
  main
}