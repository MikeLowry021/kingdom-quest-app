import { z } from 'zod';

// Environment variable schemas
const requiredEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required'),
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().min(1, 'Google Maps API key is required'),
});

const optionalEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  DATABASE_URL: z.string().url().optional(),
  POSTGRES_USER: z.string().optional(),
  POSTGRES_PASSWORD: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  S3_BUCKET_NAME: z.string().optional(),
  VERCEL_TOKEN: z.string().optional(),
  CODECOV_TOKEN: z.string().optional(),
}).partial();

const developmentEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  NEXT_TELEMETRY_DISABLED: z.string().optional(),
});

// Validation functions
function validateRequiredEnv() {
  console.log('🔍 Validating required environment variables...');
  
  try {
    const result = requiredEnvSchema.parse({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    });
    
    console.log('✅ All required environment variables are valid');
    return result;
  } catch (error) {
    console.error('❌ Required environment variable validation failed:');
    if (error instanceof z.ZodError) {
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
    }
    throw error;
  }
}

function validateOptionalEnv() {
  console.log('🔍 Validating optional environment variables...');
  
  const optionalVars = {
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
    POSTGRES_USER: process.env.POSTGRES_USER,
    POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
    VERCEL_TOKEN: process.env.VERCEL_TOKEN,
    CODECOV_TOKEN: process.env.CODECOV_TOKEN,
  };
  
  // Filter out undefined values
  const filteredVars = Object.fromEntries(
    Object.entries(optionalVars).filter(([_, value]) => value !== undefined)
  );
  
  try {
    const result = optionalEnvSchema.parse(filteredVars);
    
    const presentCount = Object.keys(filteredVars).length;
    const totalCount = Object.keys(optionalVars).length;
    
    console.log(`✅ Optional environment variables valid (${presentCount}/${totalCount} present)`);
    
    // Warn about missing production variables
    if (process.env.NODE_ENV === 'production') {
      const missingProdVars = [];
      if (!process.env.SUPABASE_SERVICE_ROLE_KEY) missingProdVars.push('SUPABASE_SERVICE_ROLE_KEY');
      if (!process.env.CODECOV_TOKEN) missingProdVars.push('CODECOV_TOKEN');
      
      if (missingProdVars.length > 0) {
        console.warn('⚠️  Missing recommended production variables:');
        missingProdVars.forEach(varName => {
          console.warn(`  - ${varName}`);
        });
      }
    }
    
    return result;
  } catch (error) {
    console.error('❌ Optional environment variable validation failed:');
    if (error instanceof z.ZodError) {
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
    }
    throw error;
  }
}

function checkEnvironmentConsistency() {
  console.log('🔍 Checking environment consistency...');
  
  const env = process.env.NODE_ENV || 'development';
  const isVercelBuild = process.env.VERCEL === '1';
  const isGitHubActions = process.env.GITHUB_ACTIONS === 'true';
  const isCIEnvironment = process.env.CI === 'true';
  
  console.log(`📊 Environment Info:`);
  console.log(`  - NODE_ENV: ${env}`);
  console.log(`  - Vercel Build: ${isVercelBuild ? 'Yes' : 'No'}`);
  console.log(`  - GitHub Actions: ${isGitHubActions ? 'Yes' : 'No'}`);
  console.log(`  - CI Environment: ${isCIEnvironment ? 'Yes' : 'No'}`);
  
  // Check Supabase URL consistency
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl) {
    const isLocalSupabase = supabaseUrl.includes('localhost') || supabaseUrl.includes('127.0.0.1');
    const isProductionSupabase = supabaseUrl.includes('.supabase.co');
    
    if (env === 'production' && isLocalSupabase) {
      console.warn('⚠️  Warning: Using local Supabase URL in production environment');
    }
    
    if (env === 'development' && isProductionSupabase && !isCIEnvironment) {
      console.warn('⚠️  Warning: Using production Supabase URL in development (consider using local instance)');
    }
  }
  
  console.log('✅ Environment consistency check completed');
}

function generateEnvReport() {
  console.log('📋 Environment Variable Report:');
  console.log('================================');
  
  const envVars = {
    'Required Variables': {
      'NEXT_PUBLIC_SUPABASE_URL': !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      'NEXT_PUBLIC_SUPABASE_ANON_KEY': !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY': !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    },
    'Optional Variables': {
      'SUPABASE_SERVICE_ROLE_KEY': !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      'DATABASE_URL': !!process.env.DATABASE_URL,
      'AWS_ACCESS_KEY_ID': !!process.env.AWS_ACCESS_KEY_ID,
      'VERCEL_TOKEN': !!process.env.VERCEL_TOKEN,
      'CODECOV_TOKEN': !!process.env.CODECOV_TOKEN,
    },
    'System Variables': {
      'NODE_ENV': process.env.NODE_ENV || 'undefined',
      'CI': process.env.CI || 'undefined',
      'VERCEL': process.env.VERCEL || 'undefined',
      'GITHUB_ACTIONS': process.env.GITHUB_ACTIONS || 'undefined',
    }
  };
  
  Object.entries(envVars).forEach(([category, vars]) => {
    console.log(`\n${category}:`);
    Object.entries(vars).forEach(([key, value]) => {
      const status = typeof value === 'boolean' 
        ? (value ? '✅ Set' : '❌ Missing')
        : `📋 ${value}`;
      console.log(`  ${key}: ${status}`);
    });
  });
}

// Main validation function
export async function validateEnvironment() {
  console.log('🚀 Starting environment validation...');
  console.log('====================================\n');
  
  try {
    // Load environment variables from .env files
    if (process.env.NODE_ENV !== 'production') {
      try {
        // Try to load dotenv if available
        await import('dotenv').then(dotenv => dotenv.config());
        console.log('📁 Loaded environment variables from .env files');
      } catch {
        console.log('📁 dotenv not available, using system environment variables');
      }
    }
    
    validateRequiredEnv();
    console.log('');
    
    validateOptionalEnv();
    console.log('');
    
    checkEnvironmentConsistency();
    console.log('');
    
    generateEnvReport();
    
    console.log('\n🎉 Environment validation completed successfully!');
    console.log('===============================================');
    
    return true;
  } catch (error) {
    console.error('\n💥 Environment validation failed!');
    console.error('==================================');
    console.error(error instanceof Error ? error.message : 'Unknown error');
    
    if (process.env.CI === 'true') {
      process.exit(1);
    }
    
    return false;
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  validateEnvironment();
}