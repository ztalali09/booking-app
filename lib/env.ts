// lib/env.ts
import { z } from 'zod'

// Schéma de validation des variables d'environnement
const envSchema = z.object({
  // Base de données
  DATABASE_URL: z.string().min(1, "DATABASE_URL est requis"),
  
  // Application
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  
  // Sécurité
  ADMIN_PASSWORD: z.string().min(8, "ADMIN_PASSWORD doit contenir au moins 8 caractères"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET doit contenir au moins 32 caractères"),
  
  // Email (optionnel en développement)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().email().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM_NAME: z.string().optional(),
  
  // Google Calendar (optionnel)
  GOOGLE_CALENDAR_CLIENT_ID: z.string().optional(),
  GOOGLE_CALENDAR_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALENDAR_REFRESH_TOKEN: z.string().optional(),
  GOOGLE_CALENDAR_CALENDAR_ID: z.string().default("primary"),
  
  // Google Service Account (pour l'authentification service account)
  GOOGLE_SERVICE_ACCOUNT_EMAIL: z.string().email().optional(),
  GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: z.string().optional(),
  GOOGLE_SERVICE_ACCOUNT_PROJECT_ID: z.string().optional(),
  
  // Telegram (optionnel)
  TELEGRAM_BOT_TOKEN: z.string().optional(),
  TELEGRAM_CHAT_ID: z.string().optional(),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default("900000"),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default("5"),
  
  // Monitoring (optionnel)
  SENTRY_DSN: z.string().optional(),
  VERCEL_ANALYTICS_ID: z.string().optional(),
})

// Validation et export des variables d'environnement
function validateEnv() {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Erreur de configuration des variables d'environnement:")
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`)
      })
      console.error("\n📝 Vérifiez votre fichier .env.local")
      console.error("💡 Consultez env.example pour la configuration")
    }
    throw error
  }
}

// Export des variables validées
export const env = validateEnv()

// Types TypeScript pour l'autocomplétion
export type Env = z.infer<typeof envSchema>

// Fonctions utilitaires
export const isDevelopment = env.NODE_ENV === 'development'
export const isProduction = env.NODE_ENV === 'production'
export const isTest = env.NODE_ENV === 'test'

// Configuration des services
export const emailConfig = {
  host: env.SMTP_HOST,
  port: parseInt(env.SMTP_PORT || '587'),
  user: env.SMTP_USER,
  password: env.SMTP_PASSWORD,
  fromName: env.SMTP_FROM_NAME || 'Cabinet Médical',
}

export const googleCalendarConfig = {
  clientId: env.GOOGLE_CALENDAR_CLIENT_ID,
  clientSecret: env.GOOGLE_CALENDAR_CLIENT_SECRET,
  refreshToken: env.GOOGLE_CALENDAR_REFRESH_TOKEN,
  calendarId: env.GOOGLE_CALENDAR_CALENDAR_ID,
}

export const googleServiceAccountConfig = {
  clientEmail: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  privateKey: env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
  projectId: env.GOOGLE_SERVICE_ACCOUNT_PROJECT_ID,
}

export const telegramConfig = {
  botToken: env.TELEGRAM_BOT_TOKEN,
  chatId: env.TELEGRAM_CHAT_ID,
}

export const rateLimitConfig = {
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
}
