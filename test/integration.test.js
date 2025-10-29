#!/usr/bin/env node

/**
 * Tests d'intégration pour l'API de réservation
 * Usage: node test/integration.test.js
 */

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

// Tests d'intégration
async function runIntegrationTests() {
  console.log('🧪 Tests d\'intégration - Application de Réservation\n')
  console.log('═'.repeat(60))
  
  let passedTests = 0
  let failedTests = 0
  
  // Test 1: Vérifier que l'application est accessible
  console.log('\n📋 Test 1: Accessibilité de l\'application')
  console.log('─'.repeat(40))
  try {
    const { response, error } = await makeRequest(BASE_URL)
    if (error) throw error
    
    expect(response.status).toBe(200)
    console.log('✅ Application accessible sur http://localhost:3000')
    passedTests++
  } catch (error) {
    console.error('❌ Application non accessible:', error.message)
    failedTests++
  }
  
  // Test 2: Vérifier l'API de disponibilité des dates
  console.log('\n📋 Test 2: API de disponibilité des dates')
  console.log('─'.repeat(40))
  try {
    const { response, data, error } = await makeRequest(`${BASE_URL}/api/availability/dates?month=11&year=2025`)
    if (error) throw error
    
    expect(response.status).toBe(200)
    expect(data).toBeDefined()
    console.log('✅ API de disponibilité des dates fonctionnelle')
    console.log(`   - Réponse reçue: ${JSON.stringify(data).substring(0, 100)}...`)
    passedTests++
  } catch (error) {
    console.error('❌ API de disponibilité des dates échouée:', error.message)
    failedTests++
  }
  
  // Test 3: Vérifier l'API de disponibilité des périodes
  console.log('\n📋 Test 3: API de disponibilité des périodes')
  console.log('─'.repeat(40))
  try {
    const testDate = '2025-11-15T00:00:00.000Z'
    const { response, data, error } = await makeRequest(`${BASE_URL}/api/availability/periods?date=${testDate}`)
    if (error) throw error
    
    expect(response.status).toBe(200)
    expect(data).toBeDefined()
    console.log('✅ API de disponibilité des périodes fonctionnelle')
    console.log(`   - Périodes disponibles: ${JSON.stringify(data)}`)
    passedTests++
  } catch (error) {
    console.error('❌ API de disponibilité des périodes échouée:', error.message)
    failedTests++
  }
  
  // Test 4: Vérifier l'API de disponibilité des créneaux
  console.log('\n📋 Test 4: API de disponibilité des créneaux')
  console.log('─'.repeat(40))
  try {
    const testDate = '2025-11-15T00:00:00.000Z'
    const { response, data, error } = await makeRequest(`${BASE_URL}/api/availability/slots?date=${testDate}`)
    if (error) throw error
    
    expect(response.status).toBe(200)
    expect(data).toBeDefined()
    expect(data.slots).toBeDefined()
    console.log('✅ API de disponibilité des créneaux fonctionnelle')
    console.log(`   - ${data.slots.length} créneaux disponibles`)
    passedTests++
  } catch (error) {
    console.error('❌ API de disponibilité des créneaux échouée:', error.message)
    failedTests++
  }
  
  // Test 5: Vérifier l'API de récupération des réservations
  console.log('\n📋 Test 5: API de récupération des réservations')
  console.log('─'.repeat(40))
  try {
    const { response, data, error } = await makeRequest(`${BASE_URL}/api/bookings`)
    if (error) throw error
    
    expect(response.status).toBe(200)
    expect(data).toBeDefined()
    expect(data.bookings).toBeDefined()
    console.log('✅ API de récupération des réservations fonctionnelle')
    console.log(`   - ${data.bookings.length} réservation(s) trouvée(s)`)
    passedTests++
  } catch (error) {
    console.error('❌ API de récupération des réservations échouée:', error.message)
    failedTests++
  }
  
  // Test 6: Créer une réservation de test
  console.log('\n📋 Test 6: Création d\'une réservation')
  console.log('─'.repeat(40))
  try {
    const bookingData = {
      firstName: 'Test',
      lastName: 'Integration',
      email: 'test.integration@example.com',
      phone: '0123456789',
      country: 'France',
      date: '2025-11-20T00:00:00.000Z',
      time: '15:00',
      period: 'afternoon',
      firstConsultation: true,
      consultationReason: 'Test d\'intégration automatique',
      message: 'Test de validation de l\'API'
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
    expect(data.booking).toBeDefined()
    expect(data.booking.id).toBeDefined()
    expect(data.booking.cancellationToken).toBeDefined()
    
    console.log('✅ Réservation créée avec succès')
    console.log(`   - ID: ${data.booking.id}`)
    console.log(`   - Token d'annulation: ${data.booking.cancellationToken.substring(0, 10)}...`)
    passedTests++
  } catch (error) {
    console.error('❌ Création de réservation échouée:', error.message)
    failedTests++
  }
  
  // Test 7: Vérifier la validation des données
  console.log('\n📋 Test 7: Validation des données')
  console.log('─'.repeat(40))
  try {
    const invalidBookingData = {
      firstName: 'A', // Trop court
      lastName: 'Test',
      email: 'email-invalide', // Email invalide
      phone: '123', // Trop court
      country: 'France',
      date: '2025-11-20T00:00:00.000Z',
      time: '25:00', // Heure invalide
      period: 'soir', // Période invalide
      firstConsultation: true,
      consultationReason: 'Court' // Trop court
    }
    
    const { response, data, error } = await makeRequest(`${BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidBookingData)
    })
    
    if (error) throw error
    
    expect(response.status).toBe(400)
    expect(data.error).toBeDefined()
    expect(data.details).toBeDefined()
    
    console.log('✅ Validation des données fonctionnelle')
    console.log(`   - Erreur reçue: ${data.error}`)
    console.log(`   - Détails: ${data.details.length} erreur(s) de validation`)
    passedTests++
  } catch (error) {
    console.error('❌ Test de validation échoué:', error.message)
    failedTests++
  }
  
  // Test 8: Vérifier la règle des 15 minutes
  console.log('\n📋 Test 8: Règle des 15 minutes')
  console.log('─'.repeat(40))
  try {
    const now = new Date()
    const tooSoonDate = new Date(now.getTime() + 5 * 60 * 1000) // 5 minutes dans le futur
    
    const bookingData = {
      firstName: 'Test',
      lastName: '15Minutes',
      email: 'test.15min@example.com',
      phone: '0123456789',
      country: 'France',
      date: tooSoonDate.toISOString(),
      time: '14:00',
      period: 'afternoon',
      firstConsultation: true,
      consultationReason: 'Test de la règle des 15 minutes'
    }
    
    const { response, data, error } = await makeRequest(`${BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData)
    })
    
    if (error) throw error
    
    // Si c'est aujourd'hui, la réservation devrait être rejetée
    if (tooSoonDate.getDate() === now.getDate()) {
      expect(response.status).toBe(400)
      expect(data.error).toContain('15 minutes')
      console.log('✅ Règle des 15 minutes appliquée correctement')
    } else {
      console.log('ℹ️  Test de la règle des 15 minutes ignoré (pas aujourd\'hui)')
    }
    passedTests++
  } catch (error) {
    console.error('❌ Test de la règle des 15 minutes échoué:', error.message)
    failedTests++
  }
  
  // Test 9: Vérifier la configuration Google Calendar
  console.log('\n📋 Test 9: Configuration Google Calendar')
  console.log('─'.repeat(40))
  try {
    const requiredEnvVars = [
      'GOOGLE_SERVICE_ACCOUNT_EMAIL',
      'GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY',
      'GOOGLE_SERVICE_ACCOUNT_PROJECT_ID',
      'GOOGLE_CALENDAR_CALENDAR_ID'
    ]
    
    let allConfigured = true
    requiredEnvVars.forEach(envVar => {
      const value = process.env[envVar]
      if (!value) {
        console.log(`❌ ${envVar}: Manquant`)
        allConfigured = false
      } else {
        console.log(`✅ ${envVar}: Configuré`)
      }
    })
    
    if (allConfigured) {
      console.log('✅ Configuration Google Calendar complète')
    } else {
      console.log('⚠️  Configuration Google Calendar incomplète')
    }
    passedTests++
  } catch (error) {
    console.error('❌ Test de configuration Google Calendar échoué:', error.message)
    failedTests++
  }
  
  // Test 10: Vérifier la configuration email
  console.log('\n📋 Test 10: Configuration email')
  console.log('─'.repeat(40))
  try {
    const emailEnvVars = [
      'SMTP_HOST',
      'SMTP_PORT', 
      'SMTP_USER',
      'SMTP_PASSWORD',
      'SMTP_FROM_NAME'
    ]
    
    let allConfigured = true
    emailEnvVars.forEach(envVar => {
      const value = process.env[envVar]
      if (!value) {
        console.log(`❌ ${envVar}: Manquant`)
        allConfigured = false
      } else {
        console.log(`✅ ${envVar}: Configuré`)
      }
    })
    
    if (allConfigured) {
      console.log('✅ Configuration email complète')
    } else {
      console.log('⚠️  Configuration email incomplète')
    }
    passedTests++
  } catch (error) {
    console.error('❌ Test de configuration email échoué:', error.message)
    failedTests++
  }
  
  // Résumé des tests
  console.log('\n📊 Résumé des tests d\'intégration')
  console.log('═'.repeat(60))
  console.log(`✅ Tests réussis: ${passedTests}`)
  console.log(`❌ Tests échoués: ${failedTests}`)
  console.log(`📈 Taux de réussite: ${Math.round((passedTests / (passedTests + failedTests)) * 100)}%`)
  
  if (failedTests > 0) {
    console.log('\n⚠️  Certains tests ont échoué. Vérifiez la configuration.')
    process.exit(1)
  } else {
    console.log('\n🎉 Tous les tests sont passés avec succès!')
    console.log('✅ Votre application de réservation est fonctionnelle.')
  }
}

// Exécuter les tests
runIntegrationTests().catch(console.error)
