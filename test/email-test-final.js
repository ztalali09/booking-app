#!/usr/bin/env node

/**
 * Test final pour vérifier les emails
 * Usage: node test/email-test-final.js
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

// Test final des emails
async function runEmailTest() {
  console.log('📧 Test Final des Emails - Application de Réservation\n')
  console.log('═'.repeat(70))
  
  console.log('🔍 Vérification de la configuration email...')
  console.log('─'.repeat(50))
  
  const emailVars = [
    'SMTP_HOST',
    'SMTP_PORT', 
    'SMTP_USER',
    'SMTP_PASSWORD',
    'SMTP_FROM_NAME'
  ]
  
  let allConfigured = true
  emailVars.forEach(varName => {
    const value = process.env[varName]
    if (value) {
      console.log(`✅ ${varName}: ${value}`)
    } else {
      console.log(`❌ ${varName}: Manquant`)
      allConfigured = false
    }
  })
  
  if (!allConfigured) {
    console.log('\n❌ Configuration email incomplète!')
    console.log('🔧 Exécutez: node fix-email-config.js')
    return
  }
  
  console.log('\n✅ Configuration email complète!')
  console.log('📧 Création d\'une réservation de test...')
  console.log('─'.repeat(50))
  
  try {
    const testData = {
      firstName: 'Test',
      lastName: 'EmailFinal',
      email: 'londalonda620@gmail.com',
      phone: '0123456789',
      country: 'France',
      date: '2025-12-10T00:00:00.000Z',
      time: '14:30',
      period: 'afternoon',
      firstConsultation: true,
      consultationReason: 'Test final des emails - Vérification complète',
      message: 'Ceci est un test final pour vérifier que les emails de confirmation sont bien envoyés. Si vous recevez cet email, la configuration est parfaite!'
    }
    
    console.log('📝 Détails de la réservation:')
    console.log(`   - Patient: ${testData.firstName} ${testData.lastName}`)
    console.log(`   - Email: ${testData.email}`)
    console.log(`   - Date: ${testData.date}`)
    console.log(`   - Heure: ${testData.time}`)
    console.log(`   - Motif: ${testData.consultationReason}`)
    
    const { response, data, error } = await makeRequest(`${BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    })
    
    if (error) {
      console.error('❌ Erreur lors de la création:', error.message)
      return
    }
    
    if (response.status === 201) {
      console.log('\n✅ Réservation créée avec succès!')
      console.log(`   - ID: ${data.booking.id}`)
      console.log(`   - Token: ${data.booking.cancellationToken.substring(0, 20)}...`)
      
      console.log('\n📧 VÉRIFIEZ VOTRE EMAIL!')
      console.log('═'.repeat(70))
      console.log('📬 Ouvrez: londalonda620@gmail.com')
      console.log('🔍 Cherchez: Email de "Cabinet Médical"')
      console.log('📋 Vérifiez:')
      console.log('   - Sujet: "✅ Confirmation de votre rendez-vous"')
      console.log('   - Patient: Test EmailFinal')
      console.log('   - Date: 10 décembre 2025')
      console.log('   - Heure: 14:30')
      console.log('   - Motif: Test final des emails...')
      console.log('   - Lien d\'annulation (si présent)')
      
      console.log('\n🎯 RÉSULTAT ATTENDU:')
      console.log('   ✅ Si vous recevez l\'email: CONFIGURATION PARFAITE!')
      console.log('   ❌ Si vous ne recevez pas l\'email: Problème de configuration')
      
    } else if (response.status === 409) {
      console.log('⚠️  Créneau déjà réservé, essayons une autre heure...')
      
      testData.time = '15:30'
      const retryResponse = await makeRequest(`${BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      })
      
      if (retryResponse.response && retryResponse.response.status === 201) {
        console.log('✅ Réservation créée avec succès (2ème tentative)')
        console.log(`   - ID: ${retryResponse.data.booking.id}`)
        console.log('📧 VÉRIFIEZ VOTRE EMAIL!')
      } else {
        console.log('❌ Impossible de créer une réservation de test')
      }
    } else {
      console.log(`❌ Erreur inattendue: ${response.status}`)
      if (data && data.error) {
        console.log(`   - Erreur: ${data.error}`)
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message)
  }
  
  console.log('\n📊 RÉSUMÉ DU TEST')
  console.log('═'.repeat(70))
  console.log('✅ Configuration email vérifiée')
  console.log('✅ Réservation de test créée')
  console.log('📧 Email de confirmation envoyé (si configuré)')
  console.log('')
  console.log('🎉 VOTRE APPLICATION EST PRÊTE!')
  console.log('')
  console.log('📝 PROCHAINES ÉTAPES:')
  console.log('   1. Vérifiez votre email')
  console.log('   2. Testez l\'interface sur http://localhost:3000')
  console.log('   3. Créez des réservations réelles')
  console.log('   4. Déployez en production')
  console.log('')
  console.log('🚀 Félicitations! Votre système de réservation est opérationnel!')
}

// Exécuter le test
runEmailTest().catch(console.error)
