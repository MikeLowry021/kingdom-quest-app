import { z } from 'zod'

// Environment validation schema
const envSchema = z.object({
  // Supabase (required)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

  // Site configuration
  NEXT_PUBLIC_SITE_URL: z.string().url().default('http://localhost:3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Google Maps (optional)
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().optional(),

  // Vercel deployment (for CI/CD)
  VERCEL_TOKEN: z.string().optional(),
  VERCEL_ORG_ID: z.string().optional(),
  VERCEL_PROJECT_ID: z.string().optional(),

  // Production database (optional, for future use)
  DATABASE_URL: z.string().optional(),
  POSTGRES_USER: z.string().optional(),
  POSTGRES_PASSWORD: z.string().optional(),
  POSTGRES_DB: z.string().optional(),

  // File storage (optional)
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().default('us-east-1'),
  S3_BUCKET_NAME: z.string().optional(),

  // Monitoring (optional)
  SENTRY_DSN: z.string().url().optional(),
  VERCEL_ANALYTICS_ID: z.string().optional(),

  // Feature flags
  ENABLE_MAP_FEATURE: z.string().transform(val => val === 'true').default('true'),
  ENABLE_ADAPTIVE_QUIZZES: z.string().transform(val => val === 'true').default('true'),
  ENABLE_FAMILY_ALTAR: z.string().transform(val => val === 'true').default('true'),
  ENABLE_SPEECH_TO_TEXT: z.string().transform(val => val === 'true').default('false'),
  ENABLE_BLESSING_CARDS: z.string().transform(val => val === 'true').default('true'),

  // Security
  JWT_SECRET: z.string().optional(),
  SESSION_SECRET: z.string().optional(),

  // Development
  DEBUG: z.string().optional(),
  NEXT_TELEMETRY_DISABLED: z.string().optional(),
})

// Environment variables type
export type Env = z.infer<typeof envSchema>

// Validate and export environment variables
export function validateEnv(): Env {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      throw new Error(
        `Environment validation failed:\n${missingVars.join('\n')}\n\n` +
        'Please check your .env.local file and ensure all required variables are set.'
      )
    }
    throw error
  }
}

// Environment helpers
export const env = validateEnv()

// Environment type guards
export const isDevelopment = env.NODE_ENV === 'development'
export const isProduction = env.NODE_ENV === 'production'
export const isTest = env.NODE_ENV === 'test'

// Feature flags
export const features = {
  mapFeature: env.ENABLE_MAP_FEATURE,
  adaptiveQuizzes: env.ENABLE_ADAPTIVE_QUIZZES,
  familyAltar: env.ENABLE_FAMILY_ALTAR,
  speechToText: env.ENABLE_SPEECH_TO_TEXT,
  blessingCards: env.ENABLE_BLESSING_CARDS,
} as const

// Database configuration
export const database = {
  url: env.DATABASE_URL,
  user: env.POSTGRES_USER,
  password: env.POSTGRES_PASSWORD,
  name: env.POSTGRES_DB,
} as const

// Storage configuration
export const storage = {
  accessKeyId: env.AWS_ACCESS_KEY_ID,
  secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  region: env.AWS_REGION,
  bucketName: env.S3_BUCKET_NAME,
} as const

// Supabase configuration
export const supabase = {
  url: env.NEXT_PUBLIC_SUPABASE_URL,
  anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
} as const

export default env