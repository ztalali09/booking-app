#!/usr/bin/env node

/**
 * Script de test pour créer un événement Google Calendar
 * Usage: node scripts/test-calendar-event.js
 */

const { createCalendarEvent } = require('../lib/services/google-calendar')
require('dotenv').config({ path: '.env.local' })

async function testCreateCalendarEvent() {
  console.log('🔍 Test de création d\'événement Google Calendar...\n')

  try {
    const bookingData = {
      firstName: 'Test',
      lastName: 'Event',
      email: 'test.event@example.com',
      phone: '0123456789',
      date: new Date('2025-11-03T00:00:00.000Z'),
      time: '18:00',
      consultationReason: 'Test de création d\'événement',
      message: 'Test pour vérifier la synchronisation'
    }

    console.log('📅 Données de test:')
    console.log(`  - Patient: ${bookingData.firstName} ${bookingData.lastName}`)
    console.log(`  - Date: ${bookingData.date.toISOString()}`)
    console.log(`  - Heure: ${bookingData.time}`)
    console.log('')

    console.log('🔄 Création de l\'événement...')
    const eventId = await createCalendarEvent(bookingData)
    
    console.log('✅ Événement créé avec succès!')
    console.log(`  - ID: ${eventId}`)
    console.log('')

    console.log('🎉 Test réussi! La synchronisation Google Calendar fonctionne.')

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message)
    console.error('Détails:', error)
    process.exit(1)
  }
}

// Exécuter le test
testCreateCalendarEvent()
