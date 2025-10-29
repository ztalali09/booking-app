#!/usr/bin/env node

/**
 * Script pour partager le calendrier avec votre compte Google
 * Usage: node scripts/share-calendar.js VOTRE_EMAIL@gmail.com
 */

const { google } = require('googleapis')
require('dotenv').config({ path: '.env.local' })

async function shareCalendar() {
  const userEmail = process.argv[2]
  
  if (!userEmail) {
    console.error('❌ Veuillez fournir votre email Google:')
    console.error('Usage: node scripts/share-calendar.js VOTRE_EMAIL@gmail.com')
    process.exit(1)
  }

  console.log(`🔍 Partage du calendrier avec ${userEmail}...\n`)

  try {
    // Configuration
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
    const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n')
    const projectId = process.env.GOOGLE_SERVICE_ACCOUNT_PROJECT_ID
    const calendarId = process.env.GOOGLE_CALENDAR_CALENDAR_ID

    if (!clientEmail || !privateKey || !projectId || !calendarId) {
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

    // Partager le calendrier
    console.log('📅 Partage du calendrier...')
    const aclRule = {
      role: 'owner', // Vous serez propriétaire du calendrier
      scope: {
        type: 'user',
        value: userEmail,
      },
    }

    const response = await calendar.acl.insert({
      calendarId: calendarId,
      requestBody: aclRule,
    })

    console.log('✅ Calendrier partagé avec succès!')
    console.log(`  - Règle ACL: ${response.data.id}`)
    console.log(`  - Rôle: ${response.data.role}`)
    console.log(`  - Email: ${response.data.scope.value}`)
    console.log('')

    // Récupérer les informations du calendrier
    const calendarInfo = await calendar.calendars.get({
      calendarId: calendarId,
    })

    console.log('📅 Informations du calendrier:')
    console.log(`  - Nom: ${calendarInfo.data.summary}`)
    console.log(`  - ID: ${calendarInfo.data.id}`)
    console.log(`  - URL: ${calendarInfo.data.htmlLink}`)
    console.log('')

    console.log('🎉 Partage terminé!')
    console.log('📝 Vous devriez maintenant voir le calendrier "Réservations Cabinet Médical" dans votre Google Calendar')
    console.log('🔗 Accédez au calendrier: https://calendar.google.com/calendar/')

  } catch (error) {
    console.error('❌ Erreur lors du partage du calendrier:', error.message)
    console.error('Détails:', error)
    process.exit(1)
  }
}

// Exécuter le script
shareCalendar()

