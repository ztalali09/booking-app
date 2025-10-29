import { google } from 'googleapis'
import { googleServiceAccountConfig, googleCalendarConfig } from '../env'

// Configuration Google Calendar
const GOOGLE_CALENDAR_ID = googleCalendarConfig.calendarId || 'primary'
const GOOGLE_CLIENT_EMAIL = googleServiceAccountConfig.clientEmail
const GOOGLE_PRIVATE_KEY = googleServiceAccountConfig.privateKey?.replace(/\\n/g, '\n')
const GOOGLE_PROJECT_ID = googleServiceAccountConfig.projectId

// Initialiser l'authentification Google Calendar
const getAuth = () => {
  if (!GOOGLE_CLIENT_EMAIL || !GOOGLE_PRIVATE_KEY || !GOOGLE_PROJECT_ID) {
    throw new Error('Variables d\'environnement Google Calendar manquantes')
  }

  return new google.auth.GoogleAuth({
    credentials: {
      client_email: GOOGLE_CLIENT_EMAIL,
      private_key: GOOGLE_PRIVATE_KEY,
      project_id: GOOGLE_PROJECT_ID,
    },
    scopes: [
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/calendar.events'
    ],
  })
}

// Récupérer les créneaux bloqués pour une date donnée
export async function getBlockedSlots(date: Date) {
  try {
    const auth = getAuth()
    const calendar = google.calendar({ version: 'v3', auth })

    // Créer les dates de début et fin pour la journée
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    // Récupérer les événements de la journée
    const response = await calendar.events.list({
      calendarId: GOOGLE_CALENDAR_ID,
      timeMin: startOfDay.toISOString(),
      timeMax: endOfDay.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    })

    const events = response.data.items || []
    
    // Convertir les événements en créneaux bloqués
    const blockedSlots = events.map(event => {
      const start = event.start?.dateTime || event.start?.date
      const end = event.end?.dateTime || event.end?.date
      
      if (!start || !end) return null

      return {
        start: new Date(start),
        end: new Date(end),
        title: event.summary || 'Créneau bloqué',
        description: event.description || '',
        isAllDay: !event.start?.dateTime, // Si pas de dateTime, c'est un événement toute la journée
      }
    }).filter(Boolean)

    return blockedSlots
  } catch (error) {
    console.error('Erreur lors de la récupération des créneaux bloqués:', error)
    return []
  }
}

// Vérifier si un créneau est bloqué
export function isSlotBlocked(timeSlot: string, date: Date, blockedSlots: any[]) {
  const [hours, minutes] = timeSlot.split(':').map(Number)
  const slotStart = new Date(date)
  slotStart.setHours(hours, minutes, 0, 0)
  
  const slotEnd = new Date(slotStart)
  slotEnd.setHours(hours + 1, minutes, 0, 0) // Créneau d'1 heure

  return blockedSlots.some(blocked => {
    if (blocked.isAllDay) {
      // Si c'est un événement toute la journée, bloquer tous les créneaux
      return true
    }

    // Vérifier si le créneau chevauche avec un événement bloqué
    return (
      (slotStart >= blocked.start && slotStart < blocked.end) ||
      (slotEnd > blocked.start && slotEnd <= blocked.end) ||
      (slotStart <= blocked.start && slotEnd >= blocked.end)
    )
  })
}

// Créer un événement dans Google Calendar (pour les réservations)
export async function createCalendarEvent(bookingData: {
  firstName: string
  lastName: string
  email: string
  phone: string
  date: Date
  time: string
  consultationReason: string
  message?: string
}) {
  try {
    const auth = getAuth()
    const calendar = google.calendar({ version: 'v3', auth })

    const [hours, minutes] = bookingData.time.split(':').map(Number)
    
    // Créer les dates en heure locale (Europe/Paris)
    // La date bookingData.date est en UTC, on doit la convertir en heure locale
    const localDate = new Date(bookingData.date.getTime() + (bookingData.date.getTimezoneOffset() * 60000))
    const startTime = new Date(localDate)
    startTime.setHours(hours, minutes, 0, 0)
    
    const endTime = new Date(startTime)
    endTime.setHours(hours + 1, minutes, 0, 0)
    
    console.log('🕐 Création événement Google Calendar:')
    console.log('  - Date réservation (UTC):', bookingData.date)
    console.log('  - Date réservation (local):', localDate)
    console.log('  - Heure réservation:', bookingData.time)
    console.log('  - Start time (local):', startTime.toLocaleString('fr-FR', { timeZone: 'Europe/Paris' }))
    console.log('  - End time (local):', endTime.toLocaleString('fr-FR', { timeZone: 'Europe/Paris' }))
    console.log('  - Start time (ISO):', startTime.toISOString())
    console.log('  - End time (ISO):', endTime.toISOString())

    const event = {
      summary: `Consultation - ${bookingData.firstName} ${bookingData.lastName}`,
      description: `
Patient: ${bookingData.firstName} ${bookingData.lastName}
Email: ${bookingData.email}
Téléphone: ${bookingData.phone}
Motif: ${bookingData.consultationReason}
${bookingData.message ? `Message: ${bookingData.message}` : ''}
      `.trim(),
      start: {
        dateTime: startTime.toISOString(),
        timeZone: 'Europe/Paris',
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'Europe/Paris',
      },
      // Note: Service accounts cannot invite attendees without Domain-Wide Delegation
      // attendees: [
      //   {
      //     email: bookingData.email,
      //     displayName: `${bookingData.firstName} ${bookingData.lastName}`,
      //   },
      // ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 24h avant
          { method: 'popup', minutes: 30 }, // 30min avant
        ],
      },
    }

    const response = await calendar.events.insert({
      calendarId: GOOGLE_CALENDAR_ID,
      requestBody: event,
    })

    return response.data.id
  } catch (error) {
    console.error('Erreur lors de la création de l\'événement:', error)
    throw error
  }
}

// Supprimer un événement du calendrier (pour l'annulation)
export async function deleteCalendarEvent(eventId: string) {
  try {
    const auth = getAuth()
    const calendar = google.calendar({ version: 'v3', auth })

    await calendar.events.delete({
      calendarId: GOOGLE_CALENDAR_ID,
      eventId: eventId,
    })

    return { success: true }
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'événement:', error)
    throw error
  }
}

// Mettre à jour un événement existant
export async function updateCalendarEvent(eventId: string, bookingData: {
  firstName: string
  lastName: string
  email: string
  phone: string
  date: Date
  time: string
  consultationReason: string
  message?: string
}) {
  try {
    const auth = getAuth()
    const calendar = google.calendar({ version: 'v3', auth })

    const [hours, minutes] = bookingData.time.split(':').map(Number)
    
    // Créer les dates en heure locale (Europe/Paris)
    // La date bookingData.date est en UTC, on doit la convertir en heure locale
    const localDate = new Date(bookingData.date.getTime() + (bookingData.date.getTimezoneOffset() * 60000))
    const startTime = new Date(localDate)
    startTime.setHours(hours, minutes, 0, 0)
    
    const endTime = new Date(startTime)
    endTime.setHours(hours + 1, minutes, 0, 0)

    const event = {
      summary: `Consultation - ${bookingData.firstName} ${bookingData.lastName}`,
      description: `
Patient: ${bookingData.firstName} ${bookingData.lastName}
Email: ${bookingData.email}
Téléphone: ${bookingData.phone}
Motif: ${bookingData.consultationReason}
${bookingData.message ? `Message: ${bookingData.message}` : ''}
      `.trim(),
      start: {
        dateTime: startTime.toISOString(),
        timeZone: 'Europe/Paris',
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'Europe/Paris',
      },
      // Note: Service accounts cannot invite attendees without Domain-Wide Delegation
      // attendees: [
      //   {
      //     email: bookingData.email,
      //     displayName: `${bookingData.firstName} ${bookingData.lastName}`,
      //   },
      // ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 24h avant
          { method: 'popup', minutes: 30 }, // 30min avant
        ],
      },
    }

    const response = await calendar.events.update({
      calendarId: GOOGLE_CALENDAR_ID,
      eventId: eventId,
      requestBody: event,
    })

    return response.data
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'événement:', error)
    throw error
  }
}
