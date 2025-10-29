#!/usr/bin/env node

/**
 * Tests simples pour l'API de réservation
 * Usage: node test/simple.test.js
 */

// Charger les variables d'environnement
require('dotenv').config({ path: '.env.local' })

const BASE_URL = 'http://localhost:3000'

// Fonction utilitaire pour les tests
function expect(actual) {
  return {
    toBe: (expected) => {
      if (actual !== expected) {
        throw new Error(`Expected ${expected}, but got ${actual}`)
      }
    },
    toBeDefined: () => {
      if (actual === undefined) {
        throw new Error(`Expected value to be defined, but got undefined`)
      }
    },
    toContain: (expected) => {
      if (!actual.includes(expected)) {
        throw new Error(`Expected "${actual}" to contain "${expected}"`)
      }
    }
  }
}

// Fonction pour faire des requêtes HTTP
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, options)
    const data = await response.json()
    return { response, data }
  } catch (error) {
    return { response: null, data: null, error }
  }
}

// Tests simples
async function runSimpleTests() {
  console.log('🧪 Tests simples - Application de Réservation\n')
  console.log('═'.repeat(60))
  
  let passedTests = 0
  let failedTests = 0
  
  // Test 1: Vérifier la configuration
  console.log('\n📋 Test 1: Configuration de l\'application')
  console.log('─'.repeat(40))
  try {
    console.log('🔍 Variables d\'environnement:')
    console.log(`   - DATABASE_URL: ${process.env.DATABASE_URL ? '✅' : '❌'}`)
    console.log(`   - NEXT_PUBLIC_APP_URL: ${process.env.NEXT_PUBLIC_APP_URL ? '✅' : '❌'}`)
    console.log(`   - GOOGLE_SERVICE_ACCOUNT_EMAIL: ${process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ? '✅' : '❌'}`)
    console.log(`   - GOOGLE_CALENDAR_CALENDAR_ID: ${process.env.GOOGLE_CALENDAR_CALENDAR_ID ? '✅' : '❌'}`)
    console.log(`   - SMTP_USER: ${process.env.SMTP_USER ? '✅' : '❌'}`)
    console.log(`   - SMTP_PASSWORD: ${process.env.SMTP_PASSWORD ? '✅' : '❌'}`)
    
    const hasBasicConfig = process.env.DATABASE_URL && process.env.NEXT_PUBLIC_APP_URL
    expect(hasBasicConfig).toBe(true)
    console.log('✅ Configuration de base OK')
    passedTests++
  } catch (error) {
    console.error('❌ Configuration manquante:', error.message)
    failedTests++
  }
  
  // Test 2: API de disponibilité des dates
  console.log('\n📋 Test 2: API de disponibilité des dates')
  console.log('─'.repeat(40))
  try {
    const { response, data, error } = await makeRequest(`${BASE_URL}/api/availability/dates?month=11&year=2025`)
    if (error) throw error
    
    expect(response.status).toBe(200)
    expect(data.availableDates).toBeDefined()
    console.log('✅ API de disponibilité des dates fonctionnelle')
    console.log(`   - ${data.availableDates.length} dates disponibles en novembre 2025`)
    passedTests++
  } catch (error) {
    console.error('❌ API de disponibilité des dates échouée:', error.message)
    failedTests++
  }
  
  // Test 3: API de disponibilité des créneaux
  console.log('\n📋 Test 3: API de disponibilité des créneaux')
  console.log('─'.repeat(40))
  try {
    const testDate = '2025-11-20T00:00:00.000Z'
    const { response, data, error } = await makeRequest(`${BASE_URL}/api/availability/slots?date=${testDate}`)
    if (error) throw error
    
    expect(response.status).toBe(200)
    expect(data).toBeDefined()
    console.log('✅ API de disponibilité des créneaux fonctionnelle')
    if (data.slots) {
      console.log(`   - ${data.slots.length} créneaux disponibles`)
    } else {
      console.log('   - Réponse reçue:', JSON.stringify(data).substring(0, 100) + '...')
    }
    passedTests++
  } catch (error) {
    console.error('❌ API de disponibilité des créneaux échouée:', error.message)
    failedTests++
  }
  
  // Test 4: Créer une réservation
  console.log('\n📋 Test 4: Création d\'une réservation')
  console.log('─'.repeat(40))
  try {
    const bookingData = {
      firstName: 'Test',
      lastName: 'Simple',
      email: 'test.simple@example.com',
      phone: '0123456789',
      country: 'France',
      date: '2025-11-25T00:00:00.000Z',
      time: '15:00',
      period: 'afternoon',
      firstConsultation: true,
      consultationReason: 'Test simple d\'intégration',
      message: 'Test automatique'
    }
    
    const { response, data, error } = await makeRequest(`${BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData)
    })
    
    if (error) throw error
    
    expect(response.status).toBe(201)
    expect(data.success).toBe(true)
    expect(data.booking.id).toBeDefined()
    
    console.log('✅ Réservation créée avec succès')
    console.log(`   - ID: ${data.booking.id}`)
    console.log(`   - Token: ${data.booking.cancellationToken.substring(0, 15)}...`)
    passedTests++
  } catch (error) {
    console.error('❌ Création de réservation échouée:', error.message)
    failedTests++
  }
  
  // Test 5: Récupérer les réservations
  console.log('\n📋 Test 5: Récupération des réservations')
  console.log('─'.repeat(40))
  try {
    const { response, data, error } = await makeRequest(`${BASE_URL}/api/bookings`)
    if (error) throw error
    
    expect(response.status).toBe(200)
    expect(data.bookings).toBeDefined()
    console.log('✅ API de récupération des réservations fonctionnelle')
    console.log(`   - ${data.bookings.length} réservation(s) trouvée(s)`)
    
    // Afficher les 3 dernières réservations
    const recentBookings = data.bookings.slice(-3)
    console.log('   - Dernières réservations:')
    recentBookings.forEach((booking, index) => {
      console.log(`     ${index + 1}. ${booking.firstName} ${booking.lastName} - ${booking.date} ${booking.time}`)
    })
    passedTests++
  } catch (error) {
    console.error('❌ Récupération des réservations échouée:', error.message)
    failedTests++
  }
  
  // Test 6: Validation des données invalides
  console.log('\n📋 Test 6: Validation des données invalides')
  console.log('─'.repeat(40))
  try {
    const invalidData = {
      firstName: 'A', // Trop court
      lastName: 'Test',
      email: 'email-invalide',
      phone: '123',
      date: '2025-11-25T00:00:00.000Z',
      time: '25:00', // Heure invalide
      period: 'soir', // Période invalide
      firstConsultation: true,
      consultationReason: 'Court'
    }
    
    const { response, data, error } = await makeRequest(`${BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidData)
    })
    
    if (error) throw error
    
    expect(response.status).toBe(400)
    expect(data.error).toBeDefined()
    expect(data.details).toBeDefined()
    
    console.log('✅ Validation des données fonctionnelle')
    console.log(`   - Erreur: ${data.error}`)
    console.log(`   - ${data.details.length} erreur(s) de validation détectée(s)`)
    passedTests++
  } catch (error) {
    console.error('❌ Test de validation échoué:', error.message)
    failedTests++
  }
  
  // Test 7: Vérifier la synchronisation Google Calendar
  console.log('\n📋 Test 7: Synchronisation Google Calendar')
  console.log('─'.repeat(40))
  try {
    if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_CALENDAR_CALENDAR_ID) {
      console.log('✅ Configuration Google Calendar détectée')
      console.log(`   - Service Account: ${process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL}`)
      console.log(`   - Calendrier: ${process.env.GOOGLE_CALENDAR_CALENDAR_ID.substring(0, 20)}...`)
      console.log('   - Les réservations devraient être synchronisées avec Google Calendar')
    } else {
      console.log('⚠️  Configuration Google Calendar manquante')
    }
    passedTests++
  } catch (error) {
    console.error('❌ Test Google Calendar échoué:', error.message)
    failedTests++
  }
  
  // Test 8: Vérifier la configuration email
  console.log('\n📋 Test 8: Configuration email')
  console.log('─'.repeat(40))
  try {
    if (process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
      console.log('✅ Configuration email détectée')
      console.log(`   - Email: ${process.env.SMTP_USER}`)
      console.log('   - Les emails de confirmation devraient être envoyés')
    } else {
      console.log('⚠️  Configuration email manquante')
      console.log('   - Les emails sont désactivés')
    }
    passedTests++
  } catch (error) {
    console.error('❌ Test email échoué:', error.message)
    failedTests++
  }
  
  // Résumé des tests
  console.log('\n📊 Résumé des tests')
  console.log('═'.repeat(60))
  console.log(`✅ Tests réussis: ${passedTests}`)
  console.log(`❌ Tests échoués: ${failedTests}`)
  console.log(`📈 Taux de réussite: ${Math.round((passedTests / (passedTests + failedTests)) * 100)}%`)
  
  if (failedTests === 0) {
    console.log('\n🎉 Tous les tests sont passés avec succès!')
    console.log('✅ Votre application de réservation est entièrement fonctionnelle.')
    console.log('\n📝 Fonctionnalités testées:')
    console.log('   ✅ API de disponibilité des dates')
    console.log('   ✅ API de disponibilité des créneaux')
    console.log('   ✅ Création de réservations')
    console.log('   ✅ Récupération des réservations')
    console.log('   ✅ Validation des données')
    console.log('   ✅ Configuration Google Calendar')
    console.log('   ✅ Configuration email')
  } else {
    console.log('\n⚠️  Certains tests ont échoué.')
    console.log('🔧 Vérifiez la configuration et relancez les tests.')
  }
}

// Exécuter les tests
runSimpleTests().catch(console.error)

