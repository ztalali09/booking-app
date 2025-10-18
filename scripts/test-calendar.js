// scripts/test-calendar.js
// Script de test pour vérifier la configuration Google Calendar

const { google } = require('googleapis')
require('dotenv').config({ path: '.env.local' })

async function testGoogleCalendar() {
  console.log('🧪 Test de la configuration Google Calendar...\n')

  // 1. Vérifier les variables d'environnement
  console.log('📋 Variables d\'environnement:')
  console.log(`GOOGLE_CLIENT_ID: ${process.env.GOOGLE_CLIENT_ID ? '✅ Défini' : '❌ Manquant'}`)
  console.log(`GOOGLE_CLIENT_SECRET: ${process.env.GOOGLE_CLIENT_SECRET ? '✅ Défini' : '❌ Manquant'}`)
  console.log(`GOOGLE_REFRESH_TOKEN: ${process.env.GOOGLE_REFRESH_TOKEN ? '✅ Défini' : '❌ Manquant'}`)
  console.log(`GOOGLE_CALENDAR_ID: ${process.env.GOOGLE_CALENDAR_ID ? '✅ Défini' : '❌ Manquant'}`)
  console.log('')

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REFRESH_TOKEN) {
    console.log('❌ Configuration incomplète. Veuillez configurer les variables Google.')
    return
  }

  try {
    // 2. Tester l'authentification
    console.log('🔐 Test d\'authentification...')
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'https://developers.google.com/oauthplayground'
    )

    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    })

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
    console.log('✅ Authentification réussie')

    // 3. Tester l'accès au calendrier
    console.log('📅 Test d\'accès au calendrier...')
    const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary'
    
    const response = await calendar.calendarList.list()
    console.log(`✅ Accès au calendrier réussi. ${response.data.items?.length || 0} calendriers trouvés.`)

    // 4. Lister les calendriers disponibles
    console.log('\n📋 Calendriers disponibles:')
    response.data.items?.forEach((cal, index) => {
      console.log(`${index + 1}. ${cal.summary} (${cal.id})`)
    })

    // 5. Tester la création d'un événement de test
    console.log('\n🧪 Test de création d\'événement...')
    const testEvent = {
      summary: 'Test - Rendez-vous patient',
      description: 'Événement de test pour vérifier la configuration',
      start: {
        dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Demain
        timeZone: 'Europe/Paris',
      },
      end: {
        dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(), // Demain + 30min
        timeZone: 'Europe/Paris',
      },
    }

    const createdEvent = await calendar.events.insert({
      calendarId: calendarId,
      requestBody: testEvent,
    })

    console.log(`✅ Événement de test créé: ${createdEvent.data.id}`)

    // 6. Supprimer l'événement de test
    console.log('🗑️ Suppression de l\'événement de test...')
    await calendar.events.delete({
      calendarId: calendarId,
      eventId: createdEvent.data.id,
    })
    console.log('✅ Événement de test supprimé')

    console.log('\n🎉 Configuration Google Calendar validée avec succès !')
    console.log('\n📝 Prochaines étapes:')
    console.log('1. Votre calendrier est prêt à recevoir des rendez-vous')
    console.log('2. Les réservations seront automatiquement ajoutées')
    console.log('3. Les annulations supprimeront les événements')

  } catch (error) {
    console.error('\n❌ Erreur lors du test:', error.message)
    
    if (error.message.includes('invalid_grant')) {
      console.log('\n💡 Solution: Le refresh token a expiré. Veuillez en générer un nouveau.')
    } else if (error.message.includes('insufficient authentication')) {
      console.log('\n💡 Solution: Vérifiez vos credentials Google Cloud Console.')
    } else if (error.message.includes('not found')) {
      console.log('\n💡 Solution: Vérifiez l\'ID du calendrier dans GOOGLE_CALENDAR_ID.')
    }
  }
}

// Exécuter le test
testGoogleCalendar().catch(console.error)
