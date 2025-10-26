// lib/monitoring.ts
import { NextRequest } from 'next/server'

// Types pour les métriques
interface MetricData {
  timestamp: number
  value: number
  labels?: Record<string, string>
}

interface BookingMetrics {
  totalBookings: number
  successfulBookings: number
  failedBookings: number
  averageBookingTime: number
  popularTimeSlots: Record<string, number>
  conversionRate: number
}

// Stockage simple en mémoire (en production, utiliser Redis ou une DB)
const metrics: Record<string, MetricData[]> = {
  requests: [],
  bookings: [],
  errors: [],
  performance: [],
}

// Fonction pour enregistrer une métrique
export function recordMetric(
  type: 'request' | 'booking' | 'error' | 'performance',
  value: number,
  labels?: Record<string, string>
) {
  const metric: MetricData = {
    timestamp: Date.now(),
    value,
    labels,
  }
  
  if (!metrics[type]) {
    metrics[type] = []
  }
  metrics[type].push(metric)
  
  // Garder seulement les 1000 dernières métriques
  if (metrics[type].length > 1000) {
    metrics[type] = metrics[type].slice(-1000)
  }
}

// Fonction pour mesurer le temps d'exécution
export function measureExecutionTime<T>(
  fn: () => T | Promise<T>,
  metricName: string,
  labels?: Record<string, string>
): T | Promise<T> {
  const start = Date.now()
  
  const result = fn()
  
  if (result instanceof Promise) {
    return result.finally(() => {
      const duration = Date.now() - start
      recordMetric('performance', duration, { ...labels, operation: metricName })
    })
  } else {
    const duration = Date.now() - start
    recordMetric('performance', duration, { ...labels, operation: metricName })
    return result
  }
}

// Fonction pour tracker les requêtes API
export function trackAPIRequest(req: NextRequest, responseTime: number, statusCode: number) {
  recordMetric('request', responseTime, {
    method: req.method,
    path: req.nextUrl.pathname,
    status: statusCode.toString(),
  })
}

// Fonction pour tracker les réservations
export function trackBooking(success: boolean, bookingTime: number, timeSlot?: string) {
  recordMetric('booking', success ? 1 : 0, {
    success: success.toString(),
    timeSlot: timeSlot || 'unknown',
  })
  
  if (success) {
    recordMetric('performance', bookingTime, {
      operation: 'booking_creation',
    })
  }
}

// Fonction pour tracker les erreurs
export function trackError(error: Error, context?: Record<string, string>) {
  recordMetric('error', 1, {
    error: error.name,
    message: error.message.substring(0, 100), // Limiter la longueur
    ...context,
  })
}

// Fonction pour obtenir les métriques de réservation
export function getBookingMetrics(): BookingMetrics {
  const now = Date.now()
  const last24Hours = now - (24 * 60 * 60 * 1000)
  
  // Filtrer les métriques des dernières 24h
  const recentBookings = metrics.bookings.filter(m => m.timestamp > last24Hours)
  const recentErrors = metrics.errors.filter(m => m.timestamp > last24Hours)
  
  const totalBookings = recentBookings.length
  const successfulBookings = recentBookings.filter(m => m.value === 1).length
  const failedBookings = recentBookings.filter(m => m.value === 0).length
  
  // Calculer les créneaux populaires
  const popularTimeSlots: Record<string, number> = {}
  recentBookings.forEach(metric => {
    if (metric.value === 1 && metric.labels?.timeSlot) {
      popularTimeSlots[metric.labels.timeSlot] = (popularTimeSlots[metric.labels.timeSlot] || 0) + 1
    }
  })
  
  // Calculer le temps moyen de réservation
  const bookingTimes = metrics.performance
    .filter(m => m.labels?.operation === 'booking_creation' && m.timestamp > last24Hours)
    .map(m => m.value)
  
  const averageBookingTime = bookingTimes.length > 0 
    ? bookingTimes.reduce((a, b) => a + b, 0) / bookingTimes.length 
    : 0
  
  // Calculer le taux de conversion (approximatif)
  const totalRequests = metrics.requests.filter(m => m.timestamp > last24Hours).length
  const conversionRate = totalRequests > 0 ? (successfulBookings / totalRequests) * 100 : 0
  
  return {
    totalBookings,
    successfulBookings,
    failedBookings,
    averageBookingTime,
    popularTimeSlots,
    conversionRate,
  }
}

// Fonction pour obtenir les métriques de performance
export function getPerformanceMetrics() {
  const now = Date.now()
  const lastHour = now - (60 * 60 * 1000)
  
  const recentMetrics = metrics.performance.filter(m => m.timestamp > lastHour)
  
  if (recentMetrics.length === 0) {
    return {
      averageResponseTime: 0,
      p95ResponseTime: 0,
      p99ResponseTime: 0,
      totalRequests: 0,
    }
  }
  
  const responseTimes = recentMetrics.map(m => m.value).sort((a, b) => a - b)
  const averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
  
  const p95Index = Math.floor(responseTimes.length * 0.95)
  const p99Index = Math.floor(responseTimes.length * 0.99)
  
  return {
    averageResponseTime,
    p95ResponseTime: responseTimes[p95Index] || 0,
    p99ResponseTime: responseTimes[p99Index] || 0,
    totalRequests: recentMetrics.length,
  }
}

// Fonction pour obtenir les métriques d'erreur
export function getErrorMetrics() {
  const now = Date.now()
  const last24Hours = now - (24 * 60 * 60 * 1000)
  
  const recentErrors = metrics.errors.filter(m => m.timestamp > last24Hours)
  
  const errorCounts: Record<string, number> = {}
  recentErrors.forEach(metric => {
    const errorType = metric.labels?.error || 'unknown'
    errorCounts[errorType] = (errorCounts[errorType] || 0) + 1
  })
  
  return {
    totalErrors: recentErrors.length,
    errorTypes: errorCounts,
    errorRate: recentErrors.length / (metrics.requests.filter(m => m.timestamp > last24Hours).length || 1) * 100,
  }
}

// Fonction pour exporter toutes les métriques
export function exportMetrics() {
  return {
    booking: getBookingMetrics(),
    performance: getPerformanceMetrics(),
    errors: getErrorMetrics(),
    timestamp: Date.now(),
  }
}

// Fonction pour nettoyer les anciennes métriques
export function cleanupMetrics() {
  const now = Date.now()
  const maxAge = 7 * 24 * 60 * 60 * 1000 // 7 jours
  
  Object.keys(metrics).forEach(key => {
    const metricArray = metrics[key as keyof typeof metrics]
    metrics[key as keyof typeof metrics] = metricArray.filter(m => m.timestamp > now - maxAge)
  })
}
