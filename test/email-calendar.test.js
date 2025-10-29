#!/usr/bin/env node

/**
 * Tests spécifiques pour vérifier les emails et Google Calendar
 * Usage: node test/email-calendar.test.js
 */

require('dotenv').config({ path: '.env.local' })

const BASE_URL = 'http://localhost:3000'

// Fonction pour faire des requêtes HTTP
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, options)
    const data = await response.json()
    return { response, data, success: true }
  } catch (error) {
    return { response: null, data: null, error, success: false }
  }
}

// Fonction pour attendre
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Tests spécifiques email et calendrier
async function runEmailCalendarTests() {
  console.log('📧🧪 Tests Email et Google Calendar - Application de Réservation\n')
  console.log('═'.repeat(70))
  
  let passedTests = 0
  let failedTests = 0
  
  // Test 1: Vérifier la configuration email
  console.log('\n📋 Test 1: Configuration Email')
  console.log('─'.repeat(50))
  try {
    console.log('🔍 Vérification de la configuration email...')
    console.log(`   - SMTP_HOST: ${process.env.SMTP_HOST || '❌ Manquant'}`)
    console.log(`   - SMTP_PORT: ${process.env.SMTP_PORT || '❌ Manquant'}`)
    console.log(`   - SMTP_USER: ${process.env.SMTP_USER || '❌ Manquant'}`)
    console.log(`   - SMTP_PASSWORD: ${process.env.SMTP_PASSWORD ? '✅ Configuré' : '❌ Manquant'}`)
    console.log(`   - SMTP_FROM_NAME: ${process.env.SMTP_FROM_NAME || '❌ Manquant'}`)
    
    const emailConfigured = process.env.SMTP_USER && process.env.SMTP_PASSWORD
    if (emailConfigured) {
      console.log('✅ Configuration email complète')
      console.log('📧 Les emails de confirmation seront envoyés')
    } else {
      console.log('⚠️  Configuration email incomplète')
      console.log('📧 Les emails sont désactivés')
    }
    passedTests++
  } catch (error) {
    console.error('❌ Erreur configuration email:', error.message)
    failedTests++
  }
  
  // Test 2: Vérifier la configuration Google Calendar
  console.log('\n📋 Test 2: Configuration Google Calendar')
  console.log('─'.repeat(50))
  try {
    console.log('🔍 Vérification de la configuration Google Calendar...')
    console.log(`   - GOOGLE_SERVICE_ACCOUNT_EMAIL: ${process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '❌ Manquant'}`)
    console.log(`   - GOOGLE_CALENDAR_CALENDAR_ID: ${process.env.GOOGLE_CALENDAR_CALENDAR_ID ? '✅ Configuré' : '❌ Manquant'}`)
    console.log(`   - GOOGLE_SERVICE_ACCOUNT_PROJECT_ID: ${process.env.GOOGLE_SERVICE_ACCOUNT_PROJECT_ID || '❌ Manquant'}`)
    
    const calendarConfigured = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_CALENDAR_CALENDAR_ID
    if (calendarConfigured) {
      console.log('✅ Configuration Google Calendar complète')
      console.log('📅 Les réservations seront synchronisées avec Google Calendar')
      console.log(`   - Calendrier: ${process.env.GOOGLE_CALENDAR_CALENDAR_ID}`)
    } else {
      console.log('⚠️  Configuration Google Calendar incomplète')
      console.log('📅 La synchronisation est désactivée')
    }
    passedTests++
  } catch (error) {
    console.error('❌ Erreur configuration Google Calendar:', error.message)
    failedTests++
  }
  
  // Test 3: Créer une réservation de test pour EMAIL
  console.log('\n📋 Test 3: Réservation de test pour EMAIL')
  console.log('─'.repeat(50))
  try {
    const emailTestData = {
      firstName: 'Test',
      lastName: 'Email',
      email: 'londalonda620@gmail.com', // Votre email pour recevoir le test
      phone: '0123456789',
      country: 'France',
      date: '2025-12-01T00:00:00.000Z',
      time: '14:00',
      period: 'afternoon',
      firstConsultation: true,
      consultationReason: 'Test d\'envoi d\'email de confirmation',
      message: 'Ceci est un test pour vérifier que les emails fonctionnent correctement'
    }
    
    console.log('📧 Création d\'une réservation de test...')
    console.log(`   - Email destinataire: ${emailTestData.email}`)
    console.log(`   - Date: ${emailTestData.date}`)
    console.log(`   - Heure: ${emailTestData.time}`)
    
    const { response, data, error } = await makeRequest(`${BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailTestData)
    })
    
    if (error) throw error
    
    if (response.status === 201) {
      console.log('✅ Réservation créée avec succès')
      console.log(`   - ID: ${data.booking.id}`)
      console.log(`   - Token: ${data.booking.cancellationToken.substring(0, 15)}...`)
      console.log('')
      console.log('📧 VÉRIFIEZ VOTRE BOÎTE EMAIL !')
      console.log('   - Cherchez un email de "Cabinet Médical"')
      console.log('   - Sujet: "✅ Confirmation de votre rendez-vous"')
      console.log('   - Vérifiez les détails de la réservation')
      console.log('   - Vérifiez le lien d\'annulation')
    } else if (response.status === 409) {
      console.log('⚠️  Créneau déjà réservé, essayons une autre heure...')
      
      // Essayer avec une heure différente
      emailTestData.time = '15:00'
      const retryResponse = await makeRequest(`${BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailTestData)
      })
      
      if (retryResponse.response.status === 201) {
        console.log('✅ Réservation créée avec succès (2ème tentative)')
        console.log(`   - ID: ${retryResponse.data.booking.id}`)
        console.log('📧 VÉRIFIEZ VOTRE BOÎTE EMAIL !')
      } else {
        console.log('❌ Impossible de créer une réservation de test')
      }
    } else {
      console.log(`❌ Erreur inattendue: ${response.status}`)
    }
    
    passedTests++
  } catch (error) {
    console.error('❌ Test email échoué:', error.message)
    failedTests++
  }
  
  // Test 4: Créer une réservation de test pour GOOGLE CALENDAR
  console.log('\n📋 Test 4: Réservation de test pour GOOGLE CALENDAR')
  console.log('─'.repeat(50))
  try {
    const calendarTestData = {
      firstName: 'Test',
      lastName: 'Calendar',
      email: 'test.calendar@example.com',
      phone: '0123456789',
      country: 'France',
      date: '2025-12-02T00:00:00.000Z',
      time: '16:00',
      period: 'afternoon',
      firstConsultation: true,
      consultationReason: 'Test de synchronisation Google Calendar',
      message: 'Ceci est un test pour vérifier la synchronisation avec Google Calendar'
    }
    
    console.log('📅 Création d\'une réservation de test...')
    console.log(`   - Date: ${calendarTestData.date}`)
    console.log(`   - Heure: ${calendarTestData.time}`)
    console.log(`   - Patient: ${calendarTestData.firstName} ${calendarTestData.lastName}`)
    
    const { response, data, error } = await makeRequest(`${BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(calendarTestData)
    })
    
    if (error) throw error
    
    if (response.status === 201) {
      console.log('✅ Réservation créée avec succès')
      console.log(`   - ID: ${data.booking.id}`)
      console.log('')
      console.log('📅 VÉRIFIEZ VOTRE GOOGLE CALENDAR !')
      console.log('   - Allez sur https://calendar.google.com/')
      console.log('   - Cherchez le calendrier "Réservations Cabinet Médical"')
      console.log('   - Vérifiez l\'événement créé pour le 2 décembre 2025 à 16h00')
      console.log('   - Titre: "Consultation - Test Calendar"')
    } else if (response.status === 409) {
      console.log('⚠️  Créneau déjà réservé, essayons une autre heure...')
      
      // Essayer avec une heure différente
      calendarTestData.time = '17:00'
      const retryResponse = await makeRequest(`${BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(calendarTestData)
      })
      
      if (retryResponse.response.status === 201) {
        console.log('✅ Réservation créée avec succès (2ème tentative)')
        console.log(`   - ID: ${retryResponse.data.booking.id}`)
        console.log('📅 VÉRIFIEZ VOTRE GOOGLE CALENDAR !')
      } else {
        console.log('❌ Impossible de créer une réservation de test')
      }
    } else {
      console.log(`❌ Erreur inattendue: ${response.status}`)
    }
    
    passedTests++
  } catch (error) {
    console.error('❌ Test Google Calendar échoué:', error.message)
    failedTests++
  }
  
  // Test 5: Créer plusieurs réservations pour tester la synchronisation
  console.log('\n📋 Test 5: Réservations multiples pour test complet')
  console.log('─'.repeat(50))
  try {
    const testReservations = [
      {
        firstName: 'Patient',
        lastName: 'A',
        email: 'patient.a@example.com',
        phone: '0123456789',
        country: 'France',
        date: '2025-12-03T00:00:00.000Z',
        time: '09:00',
        period: 'morning',
        firstConsultation: true,
        consultationReason: 'Consultation de routine - Patient A',
        message: 'Test de synchronisation multiple'
      },
      {
        firstName: 'Patient',
        lastName: 'B',
        email: 'patient.b@example.com',
        phone: '0123456789',
        country: 'France',
        date: '2025-12-03T00:00:00.000Z',
        time: '10:00',
        period: 'morning',
        firstConsultation: false,
        consultationReason: 'Suivi médical - Patient B',
        message: 'Test de synchronisation multiple'
      },
      {
        firstName: 'Patient',
        lastName: 'C',
        email: 'patient.c@example.com',
        phone: '0123456789',
        country: 'France',
        date: '2025-12-03T00:00:00.000Z',
        time: '14:00',
        period: 'afternoon',
        firstConsultation: true,
        consultationReason: 'Première consultation - Patient C',
        message: 'Test de synchronisation multiple'
      }
    ]
    
    console.log('📅 Création de 3 réservations de test...')
    let successCount = 0
    
    for (let i = 0; i < testReservations.length; i++) {
      const reservation = testReservations[i]
      console.log(`   - Réservation ${i + 1}: ${reservation.firstName} ${reservation.lastName} - ${reservation.time}`)
      
      const { response, data, error } = await makeRequest(`${BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reservation)
      })
      
      if (response && response.status === 201) {
        console.log(`     ✅ Créée (ID: ${data.booking.id.substring(0, 10)}...)`)
        successCount++
      } else if (response && response.status === 409) {
        console.log(`     ⚠️  Créneau occupé`)
      } else {
        console.log(`     ❌ Erreur: ${response ? response.status : 'Unknown'}`)
      }
      
      // Petite pause entre les réservations
      await wait(500)
    }
    
    console.log(`\n📊 Résultat: ${successCount}/${testReservations.length} réservations créées`)
    
    if (successCount > 0) {
      console.log('📅 VÉRIFIEZ VOTRE GOOGLE CALENDAR !')
      console.log('   - Allez sur https://calendar.google.com/')
      console.log('   - Cherchez le calendrier "Réservations Cabinet Médical"')
      console.log('   - Vérifiez les événements du 3 décembre 2025')
      console.log('   - Vous devriez voir plusieurs consultations programmées')
    }
    
    passedTests++
  } catch (error) {
    console.error('❌ Test réservations multiples échoué:', error.message)
    failedTests++
  }
  
  // Test 6: Vérifier les réservations existantes
  console.log('\n📋 Test 6: Vérification des réservations existantes')
  console.log('─'.repeat(50))
  try {
    const { response, data, error } = await makeRequest(`${BASE_URL}/api/bookings`)
    if (error) throw error
    
    console.log('📊 Réservations dans la base de données:')
    console.log(`   - Total: ${data.bookings.length} réservation(s)`)
    
    // Afficher les 5 dernières réservations
    const recentBookings = data.bookings.slice(-5)
    console.log('   - 5 dernières réservations:')
    recentBookings.forEach((booking, index) => {
      const date = new Date(booking.date).toLocaleDateString('fr-FR')
      const synced = booking.syncedWithGoogle ? '✅' : '❌'
      console.log(`     ${index + 1}. ${booking.firstName} ${booking.lastName} - ${date} ${booking.time} ${synced}`)
    })
    
    // Compter les réservations synchronisées
    const syncedCount = data.bookings.filter(b => b.syncedWithGoogle).length
    console.log(`   - Synchronisées avec Google Calendar: ${syncedCount}/${data.bookings.length}`)
    
    passedTests++
  } catch (error) {
    console.error('❌ Test vérification réservations échoué:', error.message)
    failedTests++
  }
  
  // Résumé des tests
  console.log('\n📊 Résumé des tests Email et Google Calendar')
  console.log('═'.repeat(70))
  console.log(`✅ Tests réussis: ${passedTests}`)
  console.log(`❌ Tests échoués: ${failedTests}`)
  console.log(`📈 Taux de réussite: ${Math.round((passedTests / (passedTests + failedTests)) * 100)}%`)
  
  console.log('\n🔍 VÉRIFICATIONS À FAIRE:')
  console.log('═'.repeat(70))
  console.log('📧 EMAIL:')
  console.log('   1. Ouvrez votre boîte email (londalonda620@gmail.com)')
  console.log('   2. Cherchez un email de "Cabinet Médical"')
  console.log('   3. Vérifiez le contenu de l\'email de confirmation')
  console.log('   4. Testez le lien d\'annulation si présent')
  console.log('')
  console.log('📅 GOOGLE CALENDAR:')
  console.log('   1. Allez sur https://calendar.google.com/')
  console.log('   2. Cherchez le calendrier "Réservations Cabinet Médical"')
  console.log('   3. Vérifiez les événements créés')
  console.log('   4. Vérifiez les détails des événements (titre, heure, description)')
  console.log('')
  console.log('🔧 SI VOUS NE VOYEZ RIEN:')
  console.log('   - Vérifiez les logs de l\'application')
  console.log('   - Vérifiez la configuration dans .env.local')
  console.log('   - Vérifiez les permissions du service account Google')
  console.log('   - Vérifiez les paramètres de sécurité Gmail')
  
  if (failedTests === 0) {
    console.log('\n🎉 Tous les tests sont passés!')
    console.log('✅ Vérifiez maintenant votre email et Google Calendar.')
  } else {
    console.log('\n⚠️  Certains tests ont échoué.')
    console.log('🔧 Vérifiez la configuration avant de tester manuellement.');
  }
}

// Exécuter les tests
runEmailCalendarTests().catch(console.error)

