// lib/config/availability-config.ts
// Configuration des règles de disponibilité du praticien

/**
 * Règles de disponibilité :
 * - Jours bloqués : Lundi, Mercredi, Dimanche
 * - Jours disponibles : Mardi, Jeudi, Vendredi (après-midi uniquement)
 * - Rythme : 1 semaine sur 2 (alternance travail/repos)
 * - Horaires : À partir de 14h30 (30 min après fin de poste), exception vendredi à 13h30
 */

export const AVAILABILITY_CONFIG = {
    // Jours de la semaine bloqués (0 = Dimanche, 1 = Lundi, ..., 6 = Samedi)
    blockedDays: [0, 1, 3, 6], // Dimanche, Lundi, Mercredi, Samedi

    // Jours de la semaine disponibles
    availableDays: [2, 4, 5], // Mardi, Jeudi, Vendredi

    // Horaires de début par défaut (après 30 min de pause post-travail)
    defaultStartTime: "14:30",

    // Exception pour le vendredi (fin de poste à 13h00)
    fridayStartTime: "13:30",

    // Horaire de fin des rendez-vous
    endTime: "18:00",

    // Durée d'un créneau en minutes
    slotDurationMinutes: 30,

    // Durée d'un rendez-vous en minutes
    appointmentDurationMinutes: 60,

    // Date de référence pour le cycle d'alternance (lundi de la première semaine de travail)
    // Semaine du 9 décembre 2024 = semaine de TRAVAIL
    referenceWeekStart: new Date("2024-12-09T00:00:00+01:00"),

    // Nombre de semaines dans le cycle (1 travail, 1 repos)
    cycleWeeks: 2,
}

/**
 * Détermine si une date donnée est dans une semaine de travail
 * @param date - Date à vérifier
 * @returns true si c'est une semaine de travail, false sinon
 */
export function isWorkingWeek(date: Date): boolean {
    const referenceDate = AVAILABILITY_CONFIG.referenceWeekStart
    const msPerDay = 24 * 60 * 60 * 1000
    const msPerWeek = 7 * msPerDay

    // Obtenir le lundi de la semaine de la date
    const dayOfWeek = date.getDay()
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Dimanche = 6 jours après lundi
    const mondayOfWeek = new Date(date.getTime() - (daysFromMonday * msPerDay))
    mondayOfWeek.setHours(0, 0, 0, 0)

    // Calculer le nombre de semaines depuis la référence
    const referenceMondayTime = referenceDate.getTime()
    const weeksDiff = Math.floor((mondayOfWeek.getTime() - referenceMondayTime) / msPerWeek)

    // Semaines paires (0, 2, 4, ...) = travail, semaines impaires = repos
    return weeksDiff % AVAILABILITY_CONFIG.cycleWeeks === 0
}

/**
 * Vérifie si un jour de la semaine est un jour de travail
 * @param dayOfWeek - Jour de la semaine (0 = Dimanche, 1 = Lundi, ..., 6 = Samedi)
 * @returns true si c'est un jour de travail, false sinon
 */
export function isWorkingDay(dayOfWeek: number): boolean {
    return AVAILABILITY_CONFIG.availableDays.includes(dayOfWeek)
}

/**
 * Obtient l'heure de début des créneaux pour un jour donné
 * @param dayOfWeek - Jour de la semaine (0 = Dimanche, ..., 5 = Vendredi, 6 = Samedi)
 * @returns L'heure de début au format "HH:MM"
 */
export function getStartTimeForDay(dayOfWeek: number): string {
    // Vendredi (5) a un horaire spécial
    if (dayOfWeek === 5) {
        return AVAILABILITY_CONFIG.fridayStartTime
    }
    return AVAILABILITY_CONFIG.defaultStartTime
}

/**
 * Génère les créneaux horaires disponibles pour un jour donné
 * @param dayOfWeek - Jour de la semaine
 * @returns Liste des créneaux au format "HH:MM"
 */
export function generateTimeSlotsForDay(dayOfWeek: number): string[] {
    const slots: string[] = []

    // Obtenir l'heure de début et de fin
    const startTime = getStartTimeForDay(dayOfWeek)
    const endTime = AVAILABILITY_CONFIG.endTime

    const [startHour, startMinute] = startTime.split(':').map(Number)
    const [endHour, endMinute] = endTime.split(':').map(Number)

    const startMinutes = startHour * 60 + startMinute
    const endMinutes = endHour * 60 + endMinute

    // Générer les créneaux jusqu'à l'heure de fin
    // En tenant compte de la durée du rendez-vous (1h)
    for (let minutes = startMinutes; minutes + AVAILABILITY_CONFIG.appointmentDurationMinutes <= endMinutes; minutes += AVAILABILITY_CONFIG.slotDurationMinutes) {
        const hour = Math.floor(minutes / 60)
        const minute = minutes % 60
        slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`)
    }

    return slots
}

/**
 * Vérifie si une date est disponible pour la réservation
 * @param date - Date à vérifier
 * @returns true si la date est disponible, false sinon
 */
export function isDateAvailable(date: Date): boolean {
    const dayOfWeek = date.getDay()

    // Vérifier si c'est un jour de travail
    if (!isWorkingDay(dayOfWeek)) {
        return false
    }

    // Vérifier si c'est une semaine de travail
    if (!isWorkingWeek(date)) {
        return false
    }

    return true
}
