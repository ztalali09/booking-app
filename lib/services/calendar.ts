// lib/services/calendar.ts
import { google } from 'googleapis'

// Configuration Google Calendar
const getCalendar = () => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
  )

  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  })

  return google.calendar({ version: 'v3', auth: oauth2Client })
}

// Créer un événement dans Google Calendar
export const createCalendarEvent = async (bookingData: {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  date: string
  time: string
  period: string
  firstConsultation: boolean
  message?: string
}) => {
  try {
    const calendar = getCalendar()
    
    // Formater la date et l'heure
    // bookingData.date est déjà un ISO string, extraire juste la partie date
    const dateOnly = new Date(bookingData.date).toISOString().split('T')[0]
    const startDateTime = new Date(`${dateOnly}T${bookingData.time}:00`)
    const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000) // 1 heure

    const event = {
      summary: `Rendez-vous - ${bookingData.firstName} ${bookingData.lastName}`,
      description: `
Patient: ${bookingData.firstName} ${bookingData.lastName}
Email: ${bookingData.email}
Téléphone: ${bookingData.phone}
Première consultation: ${bookingData.firstConsultation ? 'Oui' : 'Non'}
${bookingData.message ? `Message: ${bookingData.message}` : ''}

ID Réservation: ${bookingData.id}
      `.trim(),
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: 'Europe/Paris',
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'Europe/Paris',
      },
      attendees: [
        {
          email: bookingData.email,
          displayName: `${bookingData.firstName} ${bookingData.lastName}`,
        },
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 24h avant
          { method: 'popup', minutes: 30 },     // 30min avant
        ],
      },
      colorId: bookingData.firstConsultation ? '2' : '1', // Rouge pour première consultation
    }

    const response = await calendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
      requestBody: event,
    })

    console.log(`Événement créé dans Google Calendar: ${response.data.id}`)
    return response.data.id

  } catch (error) {
    console.error('Erreur création événement Google Calendar:', error)
    throw new Error('Impossible de créer l\'événement dans Google Calendar')
  }
}

// Mettre à jour un événement dans Google Calendar
export const updateCalendarEvent = async (
  eventId: string,
  bookingData: {
    firstName: string
    lastName: string
    email: string
    phone: string
    date: string
    time: string
    period: string
    firstConsultation: boolean
    message?: string
  }
) => {
  try {
    const calendar = getCalendar()
    
    const startDateTime = new Date(`${bookingData.date}T${bookingData.time}:00`)
    const endDateTime = new Date(startDateTime.getTime() + 30 * 60 * 1000)

    const event = {
      summary: `Rendez-vous - ${bookingData.firstName} ${bookingData.lastName}`,
      description: `
Patient: ${bookingData.firstName} ${bookingData.lastName}
Email: ${bookingData.email}
Téléphone: ${bookingData.phone}
Première consultation: ${bookingData.firstConsultation ? 'Oui' : 'Non'}
${bookingData.message ? `Message: ${bookingData.message}` : ''}
      `.trim(),
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: 'Europe/Paris',
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'Europe/Paris',
      },
      attendees: [
        {
          email: bookingData.email,
          displayName: `${bookingData.firstName} ${bookingData.lastName}`,
        },
      ],
    }

    await calendar.events.update({
      calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
      eventId: eventId,
      requestBody: event,
    })

    console.log(`Événement mis à jour dans Google Calendar: ${eventId}`)

  } catch (error) {
    console.error('Erreur mise à jour événement Google Calendar:', error)
    throw new Error('Impossible de mettre à jour l\'événement dans Google Calendar')
  }
}

// Supprimer un événement de Google Calendar
export const deleteCalendarEvent = async (eventId: string) => {
  try {
    const calendar = getCalendar()
    
    await calendar.events.delete({
      calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
      eventId: eventId,
    })

    console.log(`Événement supprimé de Google Calendar: ${eventId}`)

  } catch (error) {
    console.error('Erreur suppression événement Google Calendar:', error)
    throw new Error('Impossible de supprimer l\'événement de Google Calendar')
  }
}

// Récupérer les événements d'une date
export const getEventsForDate = async (date: string) => {
  try {
    const calendar = getCalendar()
    
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const response = await calendar.events.list({
      calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
      timeMin: startOfDay.toISOString(),
      timeMax: endOfDay.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    })

    return response.data.items || []

  } catch (error) {
    console.error('Erreur récupération événements Google Calendar:', error)
    throw new Error('Impossible de récupérer les événements de Google Calendar')
  }
}

// Synchroniser les événements Google Calendar vers la base de données
export const syncCalendarToDatabase = async () => {
  try {
    const calendar = getCalendar()
    
    // Récupérer les événements des 30 derniers jours
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const response = await calendar.events.list({
      calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
      timeMin: thirtyDaysAgo.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    })

    const events = response.data.items || []
    console.log(`Synchronisation: ${events.length} événements trouvés`)

    // TODO: Implémenter la logique de synchronisation
    // - Comparer avec les réservations existantes
    // - Créer/mettre à jour/supprimer selon les différences
    
    return events

  } catch (error) {
    console.error('Erreur synchronisation Google Calendar:', error)
    throw new Error('Impossible de synchroniser avec Google Calendar')
  }
}
