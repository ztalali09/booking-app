// lib/utils/date.ts
// Utilitaires pour la gestion cohérente des dates et fuseaux horaires

/**
 * Convertit une date en format YYYY-MM-DD en tenant compte du fuseau horaire Europe/Paris
 */
export function formatDateForAPI(date: Date): string {
  // Utiliser toLocaleDateString avec le fuseau horaire Europe/Paris
  return date.toLocaleDateString('en-CA', { 
    timeZone: 'Europe/Paris',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

/**
 * Convertit une date en format lisible français en tenant compte du fuseau horaire Europe/Paris
 */
export function formatDateForDisplay(date: Date): string {
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Europe/Paris'
  })
}

/**
 * Crée une date à partir d'une string YYYY-MM-DD en tenant compte du fuseau horaire Europe/Paris
 */
export function createDateFromString(dateString: string): Date {
  // Créer une date temporaire pour vérifier si nous sommes en heure d'été
  const tempDate = new Date(`${dateString}T12:00:00+01:00`) // 12h pour éviter les problèmes de changement d'heure
  const isCurrentlyDST = isDST(tempDate)
  
  // Utiliser le bon offset selon l'heure d'été
  const offset = isCurrentlyDST ? '+02:00' : '+01:00'
  
  // Créer la date avec le bon offset
  return new Date(`${dateString}T00:00:00${offset}`)
}

/**
 * Vérifie si nous sommes en heure d'été (DST) en Europe/Paris
 */
export function isDST(date: Date = new Date()): boolean {
  // Heure d'été en Europe : dernier dimanche de mars à dernier dimanche d'octobre
  const year = date.getFullYear()
  
  // Dernier dimanche de mars (2h du matin Europe/Paris)
  const marchLastSunday = new Date(`${year}-03-31T02:00:00+01:00`)
  const marchLastDay = new Date(year, 2, 31)
  const marchLastSundayDate = 31 - marchLastDay.getDay()
  const marchLastSundayFinal = new Date(`${year}-03-${String(marchLastSundayDate).padStart(2, '0')}T02:00:00+01:00`)
  
  // Dernier dimanche d'octobre (3h du matin Europe/Paris)
  const octoberLastDay = new Date(year, 9, 31)
  const octoberLastSundayDate = 31 - octoberLastDay.getDay()
  const octoberLastSunday = new Date(`${year}-10-${String(octoberLastSundayDate).padStart(2, '0')}T03:00:00+02:00`)
  
  return date >= marchLastSundayFinal && date < octoberLastSunday
}

/**
 * Crée une date/heure pour Google Calendar en tenant compte du fuseau horaire Europe/Paris
 */
export function createGoogleCalendarDateTime(dateString: string, timeString: string): { start: Date; end: Date } {
  const [hours, minutes] = timeString.split(':').map(Number)
  
  // Créer une date temporaire pour vérifier si nous sommes en heure d'été
  const tempDate = new Date(`${dateString}T12:00:00+01:00`) // 12h pour éviter les problèmes de changement d'heure
  const isCurrentlyDST = isDST(tempDate)
  
  // Utiliser le bon offset selon l'heure d'été
  const offset = isCurrentlyDST ? '+02:00' : '+01:00'
  
  // Créer les dates avec le bon offset
  const startTime = new Date(`${dateString}T${timeString}:00${offset}`)
  const endTime = new Date(`${dateString}T${String(hours + 1).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00${offset}`)
  
  return { start: startTime, end: endTime }
}

/**
 * Obtient la date actuelle en Europe/Paris
 */
export function getCurrentParisDate(): Date {
  // Utiliser toLocaleString pour forcer le fuseau horaire Europe/Paris
  // même si le serveur est en UTC
  const now = new Date()
  const parisTime = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Paris" }))
  return parisTime
}

/**
 * Vérifie si une date est aujourd'hui en Europe/Paris
 */
export function isToday(date: Date): boolean {
  const today = getCurrentParisDate()
  return date.getDate() === today.getDate() && 
         date.getMonth() === today.getMonth() && 
         date.getFullYear() === today.getFullYear()
}

/**
 * Vérifie si une date est dans le futur en Europe/Paris
 */
export function isFuture(date: Date): boolean {
  const now = getCurrentParisDate()
  return date > now
}
