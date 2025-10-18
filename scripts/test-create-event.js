// scripts/test-create-event.js
// Test rapide pour créer un événement dans Google Calendar

const { google } = require('googleapis')
require('dotenv').config({ path: '.env.local' })

async function testCreateEvent() {
  console.log('🧪 Test de création d\'événement Google Calendar...\n')

  try {
    // Configuration OAuth2
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'https://developers.google.com/oauthplayground'
    )

    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    })

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

    // Créer un événement de test
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(14, 0, 0, 0)

    const endTime = new Date(tomorrow)
    endTime.setMinutes(endTime.getMinutes() + 30)

    console.log('📅 Date de l\'événement:', tomorrow.toISOString())
    console.log('📅 Fin de l\'événement:', endTime.toISOString())
    console.log('📋 Calendar ID:', process.env.GOOGLE_CALENDAR_ID)
    console.log('')

    const event = {
      summary: 'TEST - Rendez-vous Patient Test',
      description: 'Événement de test créé par le script',
      start: {
        dateTime: tomorrow.toISOString(),
        timeZone: 'Europe/Paris',
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'Europe/Paris',
      },
    }

    console.log('🚀 Création de l\'événement...')
    const response = await calendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
      requestBody: event,
    })

    console.log('\n✅ Événement créé avec succès !')
    console.log('📋 ID de l\'événement:', response.data.id)
    console.log('🔗 Lien:', response.data.htmlLink)
    console.log('\n🎉 Va vérifier dans Google Calendar !')

  } catch (error) {
    console.error('\n❌ Erreur lors de la création:', error.message)
    if (error.response) {
      console.error('📋 Détails:', error.response.data)
    }
  }
}

testCreateEvent()

