#!/usr/bin/env node

/**
 * Script pour créer un calendrier dédié aux réservations
 * Usage: node scripts/create-calendar.js
 */

const { google } = require('googleapis')
require('dotenv').config({ path: '.env.local' })

async function createBookingCalendar() {
  console.log('🔍 Création d\'un calendrier dédié aux réservations...\n')

  try {
    // Configuration
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
    const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n')
    const projectId = process.env.GOOGLE_SERVICE_ACCOUNT_PROJECT_ID

    if (!clientEmail || !privateKey || !projectId) {
      throw new Error('Variables d\'environnement Google manquantes')
    }

    // Initialiser l'authentification
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
        project_id: projectId,
      },
      scopes: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events'
      ],
    })

    const calendar = google.calendar({ version: 'v3', auth })

    // Créer le calendrier
    const calendarData = {
      summary: 'Réservations Cabinet Médical',
      description: 'Calendrier dédié aux réservations de patients',
      timeZone: 'Europe/Paris',
    }

    console.log('📅 Création du calendrier...')
    const response = await calendar.calendars.insert({
      requestBody: calendarData,
    })

    const newCalendar = response.data
    console.log('✅ Calendrier créé avec succès!')
    console.log(`  - ID: ${newCalendar.id}`)
    console.log(`  - Nom: ${newCalendar.summary}`)
    console.log(`  - URL: ${newCalendar.htmlLink}`)
    console.log('')

    // Créer un événement de test
    console.log('📅 Création d\'un événement de test...')
    const testEvent = {
      summary: 'Test - Réservation Cabinet Médical',
      description: 'Événement de test pour vérifier la visibilité',
      start: {
        dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Demain
        timeZone: 'Europe/Paris',
      },
      end: {
        dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(), // Demain + 1h
        timeZone: 'Europe/Paris',
      },
    }

    const eventResponse = await calendar.events.insert({
      calendarId: newCalendar.id,
      requestBody: testEvent,
    })

    console.log('✅ Événement de test créé!')
    console.log(`  - ID: ${eventResponse.data.id}`)
    console.log(`  - URL: ${eventResponse.data.htmlLink}`)
    console.log('')

    console.log('🎉 Calendrier créé avec succès!')
    console.log('📝 Mettez à jour votre .env.local avec:')
    console.log(`GOOGLE_CALENDAR_CALENDAR_ID="${newCalendar.id}"`)
    console.log('')
    console.log('🔗 Vous pouvez voir le calendrier ici:')
    console.log(newCalendar.htmlLink)

  } catch (error) {
    console.error('❌ Erreur lors de la création du calendrier:', error.message)
    console.error('Détails:', error)
    process.exit(1)
  }
}

// Exécuter le script
createBookingCalendar()
