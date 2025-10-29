// lib/utils/client-date.ts
// Utilitaires pour la gestion des dates côté client

/**
 * Crée une date en tenant compte du fuseau horaire Europe/Paris
 * Évite les problèmes de décalage entre le fuseau horaire local et Europe/Paris
 */
export function createParisDate(year: number, month: number, day: number): Date {
  // Créer la date en spécifiant explicitement le fuseau horaire Europe/Paris
  // Utiliser 12h00 pour éviter les problèmes de changement d'heure
  const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  return new Date(`${dateString}T12:00:00+01:00`)
}

/**
 * Convertit une date en format YYYY-MM-DD pour l'API
 * Garantit que la date correspond au jour sélectionné en Europe/Paris
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
 * Vérifie si une date est aujourd'hui en Europe/Paris
 */
export function isTodayInParis(date: Date): boolean {
  const now = new Date()
  const parisNow = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Paris" }))
  const parisDate = new Date(date.toLocaleString("en-US", { timeZone: "Europe/Paris" }))
  
  return parisDate.getDate() === parisNow.getDate() && 
         parisDate.getMonth() === parisNow.getMonth() && 
         parisDate.getFullYear() === parisNow.getFullYear()
}

/**
 * Obtient la date actuelle en Europe/Paris
 */
export function getCurrentParisDate(): Date {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Paris" }))
}
