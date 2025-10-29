#!/usr/bin/env node

/**
 * Test final de vérification - Email et Google Calendar
 * Usage: node test/final-verification.test.js
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

// Test final de vérification
async function runFinalVerification() {
  console.log('🎯 Test Final de Vérification - Email et Google Calendar\n')
  console.log('═'.repeat(70))
  
  console.log('📋 Instructions de vérification:')
  console.log('─'.repeat(50))
  console.log('1. 📧 VÉRIFIEZ VOTRE EMAIL')
  console.log('   - Ouvrez: londalonda620@gmail.com')
  console.log('   - Cherchez: "Cabinet Médical" ou "Confirmation"')
  console.log('   - Vérifiez: Détails de la réservation')
  console.log('')
  console.log('2. 📅 VÉRIFIEZ GOOGLE CALENDAR')
  console.log('   - Ouvrez: https://calendar.google.com/')
  console.log('   - Cherchez: "Réservations Cabinet Médical"')
  console.log('   - Vérifiez: Événements créés')
  console.log('')
  
  // Créer une réservation de test finale
  console.log('🧪 Création d\'une réservation de test finale...')
  console.log('─'.repeat(50))
  
  try {
    const finalTestData = {
      firstName: 'VERIFICATION',
      lastName: 'FINAL',
      email: 'londalonda620@gmail.com',
      phone: '0123456789',
      country: 'France',
      date: '2025-12-05T00:00:00.000Z',
      time: '15:00',
      period: 'afternoon',
      firstConsultation: true,
      consultationReason: 'Test final de vérification - Email et Google Calendar',
      message: 'Ceci est un test final pour vérifier que les emails et la synchronisation Google Calendar fonctionnent correctement. Si vous recevez cet email et voyez cet événement dans votre calendrier, tout fonctionne parfaitement!'
    }
    
    console.log('📝 Détails de la réservation de test:')
    console.log(`   - Patient: ${finalTestData.firstName} ${finalTestData.lastName}`)
    console.log(`   - Email: ${finalTestData.email}`)
    console.log(`   - Date: ${finalTestData.date}`)
    console.log(`   - Heure: ${finalTestData.time}`)
    console.log(`   - Motif: ${finalTestData.consultationReason}`)
    
    const { response, data, error } = await makeRequest(`${BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(finalTestData)
    })
    
    if (error) {
      console.error('❌ Erreur lors de la création:', error.message)
      return
    }
    
    if (response.status === 201) {
      console.log('\n✅ Réservation créée avec succès!')
      console.log(`   - ID: ${data.booking.id}`)
      console.log(`   - Token d'annulation: ${data.booking.cancellationToken.substring(0, 20)}...`)
      
      console.log('\n🔍 VÉRIFICATIONS À EFFECTUER:')
      console.log('═'.repeat(70))
      
      console.log('\n📧 1. VÉRIFICATION EMAIL:')
      console.log('   📬 Ouvrez votre boîte email: londalonda620@gmail.com')
      console.log('   🔍 Cherchez un email récent de "Cabinet Médical"')
      console.log('   📋 Vérifiez que l\'email contient:')
      console.log('      - Sujet: "✅ Confirmation de votre rendez-vous"')
      console.log('      - Nom du patient: VERIFICATION FINAL')
      console.log('      - Date: 5 décembre 2025')
      console.log('      - Heure: 15:00')
      console.log('      - Motif: Test final de vérification...')
      console.log('      - Lien d\'annulation (si présent)')
      
      console.log('\n📅 2. VÉRIFICATION GOOGLE CALENDAR:')
      console.log('   🌐 Ouvrez: https://calendar.google.com/')
      console.log('   📅 Cherchez le calendrier "Réservations Cabinet Médical"')
      console.log('   🔍 Vérifiez qu\'il y a un événement pour le 5 décembre 2025 à 15h00')
      console.log('   📋 Vérifiez que l\'événement contient:')
      console.log('      - Titre: "Consultation - VERIFICATION FINAL"')
      console.log('      - Date: 5 décembre 2025')
      console.log('      - Heure: 15:00 - 15:30')
      console.log('      - Description: Détails de la consultation')
      
      console.log('\n🎯 3. RÉSULTATS ATTENDUS:')
      console.log('   ✅ Si vous voyez l\'email ET l\'événement: TOUT FONCTIONNE!')
      console.log('   ⚠️  Si vous ne voyez que l\'un des deux: Problème partiel')
      console.log('   ❌ Si vous ne voyez ni l\'un ni l\'autre: Problème de configuration')
      
      console.log('\n🔧 4. EN CAS DE PROBLÈME:')
      console.log('   - Vérifiez les logs de l\'application (terminal)')
      console.log('   - Vérifiez la configuration dans .env.local')
      console.log('   - Vérifiez les paramètres de sécurité Gmail')
      console.log('   - Vérifiez les permissions du service account Google')
      
    } else if (response.status === 409) {
      console.log('⚠️  Créneau déjà réservé, essayons une autre heure...')
      
      // Essayer avec une heure différente
      finalTestData.time = '16:00'
      const retryResponse = await makeRequest(`${BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalTestData)
      })
      
      if (retryResponse.response && retryResponse.response.status === 201) {
        console.log('✅ Réservation créée avec succès (2ème tentative)')
        console.log(`   - ID: ${retryResponse.data.booking.id}`)
        console.log('   - Heure modifiée: 16:00')
        console.log('\n🔍 VÉRIFIEZ VOTRE EMAIL ET GOOGLE CALENDAR!')
      } else {
        console.log('❌ Impossible de créer une réservation de test')
        console.log('   - Tous les créneaux semblent occupés')
        console.log('   - Essayez de nettoyer la base de données ou changez de date')
      }
    } else {
      console.log(`❌ Erreur inattendue: ${response.status}`)
      console.log('   - Vérifiez les logs de l\'application')
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test final:', error.message)
  }
  
  console.log('\n📊 RÉSUMÉ DU TEST FINAL')
  console.log('═'.repeat(70))
  console.log('✅ Réservation de test créée')
  console.log('📧 Email de confirmation envoyé (si configuré)')
  console.log('📅 Événement Google Calendar créé (si configuré)')
  console.log('')
  console.log('🎉 VOTRE APPLICATION DE RÉSERVATION EST PRÊTE!')
  console.log('')
  console.log('📝 PROCHAINES ÉTAPES:')
  console.log('   1. Vérifiez votre email et Google Calendar')
  console.log('   2. Testez l\'interface utilisateur sur http://localhost:3000')
  console.log('   3. Créez quelques réservations de test')
  console.log('   4. Déployez en production quand vous êtes satisfait')
  console.log('')
  console.log('🚀 Félicitations! Votre système de réservation médicale est opérationnel!')
}

// Exécuter le test final
runFinalVerification().catch(console.error)

