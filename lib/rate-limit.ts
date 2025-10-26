// lib/rate-limit.ts
import { NextRequest } from 'next/server'

// Simple in-memory rate limiter (pour la démo)
// En production, utiliser Redis ou Upstash
const requests = new Map<string, { count: number; resetTime: number }>()

interface RateLimitOptions {
  windowMs: number // Fenêtre de temps en ms
  maxRequests: number // Nombre max de requêtes
  keyGenerator?: (req: NextRequest) => string
}

export function rateLimit(options: RateLimitOptions) {
  const { windowMs, maxRequests, keyGenerator } = options

  return (req: NextRequest) => {
    const key = keyGenerator ? keyGenerator(req) : getClientIP(req)
    const now = Date.now()
    
    // Nettoyer les anciennes entrées
    for (const [k, v] of requests.entries()) {
      if (v.resetTime < now) {
        requests.delete(k)
      }
    }

    const current = requests.get(key)
    
    if (!current) {
      // Première requête
      requests.set(key, { count: 1, resetTime: now + windowMs })
      return { success: true, remaining: maxRequests - 1 }
    }

    if (current.resetTime < now) {
      // Fenêtre expirée, reset
      requests.set(key, { count: 1, resetTime: now + windowMs })
      return { success: true, remaining: maxRequests - 1 }
    }

    if (current.count >= maxRequests) {
      // Limite atteinte
      return { 
        success: false, 
        remaining: 0,
        resetTime: current.resetTime
      }
    }

    // Incrémenter le compteur
    current.count++
    requests.set(key, current)
    
    return { 
      success: true, 
      remaining: maxRequests - current.count 
    }
  }
}

export function getClientIP(req: NextRequest): string {
  // Essayer plusieurs headers pour obtenir l'IP
  const forwarded = req.headers.get('x-forwarded-for')
  const realIP = req.headers.get('x-real-ip')
  const cfConnectingIP = req.headers.get('cf-connecting-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP
  }
  
  return 'unknown'
}

// Rate limiters prédéfinis
export const bookingRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 réservations par 15 minutes
  keyGenerator: (req) => {
    // Utiliser l'email si disponible, sinon l'IP
    try {
      const body = req.json()
      return body.email || getClientIP(req)
    } catch {
      return getClientIP(req)
    }
  }
})

export const apiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60, // 60 requêtes par minute
})

export const availabilityRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30, // 30 requêtes par minute
})
