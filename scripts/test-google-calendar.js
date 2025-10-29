#!/usr/bin/env node

/**
 * Script de test pour vérifier la configuration Google Calendar
 * Usage: node scripts/test-google-calendar.js
 */

const { google } = require('googleapis')
require('dotenv').config({ path: '.env.local' })

async function testGoogleCalendarConnection() {
  console.log('🔍 Test de la connexion Google Calendar...\n')

  try {
    // Vérifier les variables d'environnement
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
    const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n')
    const projectId = process.env.GOOGLE_SERVICE_ACCOUNT_PROJECT_ID
    const calendarId = process.env.GOOGLE_CALENDAR_CALENDAR_ID || 'primary'

    console.log('📋 Variables d\'environnement:')
    console.log(`  - Client Email: ${clientEmail ? '✅ Défini' : '❌ Manquant'}`)
    console.log(`  - Private Key: ${privateKey ? '✅ Défini' : '❌ Manquant'}`)
    console.log(`  - Project ID: ${projectId ? '✅ Défini' : '❌ Manquant'}`)
    console.log(`  - Calendar ID: ${calendarId}`)
    console.log('')

    if (!clientEmail || !privateKey || !projectId) {
      throw new Error('Variables d\'environnement manquantes')
    }

    // Initialiser l'authentification
    console.log('🔐 Initialisation de l\'authentification...')
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
        project_id: projectId,
      },
      scopes: [
        'https://www.googleapis.com/auth/calendar.readonly',
        'https://www.googleapis.com/auth/calendar.events'
      ],
    })

    // Obtenir le client Calendar
    const calendar = google.calendar({ version: 'v3', auth })

    // Test 1: Lister les calendriers
    console.log('📅 Test 1: Récupération des calendriers...')
    const calendarsResponse = await calendar.calendarList.list()
    const calendars = calendarsResponse.data.items || []
    
    console.log(`  ✅ ${calendars.length} calendrier(s) trouvé(s):`)
    calendars.forEach(cal => {
      console.log(`    - ${cal.summary} (${cal.id})`)
    })
    console.log('')

    // Test 2: Récupérer les événements d'aujourd'hui
    console.log('📅 Test 2: Récupération des événements d\'aujourd\'hui...')
    const today = new Date()
    const startOfDay = new Date(today)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(today)
    endOfDay.setHours(23, 59, 59, 999)

    const eventsResponse = await calendar.events.list({
      calendarId: calendarId,
      timeMin: startOfDay.toISOString(),
      timeMax: endOfDay.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    })

    const events = eventsResponse.data.items || []
    console.log(`  ✅ ${events.length} événement(s) trouvé(s) pour aujourd'hui:`)
    events.forEach(event => {
      const start = event.start?.dateTime || event.start?.date
      const summary = event.summary || 'Sans titre'
      console.log(`    - ${summary} (${start})`)
    })
    console.log('')

    // Test 3: Créer un événement de test
    console.log('📅 Test 3: Création d\'un événement de test...')
    const testStartTime = new Date()
    testStartTime.setHours(testStartTime.getHours() + 1, 0, 0, 0)
    
    const testEndTime = new Date(testStartTime)
    testEndTime.setHours(testStartTime.getHours() + 1, 0, 0, 0)

    const testEvent = {
      summary: 'Test de connexion - Booking App',
      description: 'Événement de test créé par le script de vérification',
      start: {
        dateTime: testStartTime.toISOString(),
        timeZone: 'Europe/Paris',
      },
      end: {
        dateTime: testEndTime.toISOString(),
        timeZone: 'Europe/Paris',
      },
    }

    const createResponse = await calendar.events.insert({
      calendarId: calendarId,
      requestBody: testEvent,
    })

    const createdEvent = createResponse.data
    console.log(`  ✅ Événement de test créé: ${createdEvent.summary}`)
    console.log(`    - ID: ${createdEvent.id}`)
    console.log(`    - Heure: ${createdEvent.start?.dateTime}`)
    console.log('')

    // Test 4: Supprimer l'événement de test
    console.log('📅 Test 4: Suppression de l\'événement de test...')
    await calendar.events.delete({
      calendarId: calendarId,
      eventId: createdEvent.id,
    })
    console.log('  ✅ Événement de test supprimé')
    console.log('')

    console.log('🎉 Tous les tests sont passés avec succès!')
    console.log('✅ La configuration Google Calendar est correcte')
    console.log('✅ Le service account a les permissions nécessaires')
    console.log('✅ L\'application peut créer, lire et supprimer des événements')

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message)
    
    if (error.message.includes('invalid_grant')) {
      console.error('💡 Vérifiez que la clé privée est correcte et que le service account est valide')
    } else if (error.message.includes('insufficient authentication scopes')) {
      console.error('💡 Vérifiez que le service account a les permissions nécessaires sur le calendrier')
    } else if (error.message.includes('notFound')) {
      console.error('💡 Vérifiez que l\'ID du calendrier est correct')
    }
    
    process.exit(1)
  }
}

// Exécuter le test
testGoogleCalendarConnection()
