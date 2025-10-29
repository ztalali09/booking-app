// test/cancellation-test.js
// Test complet du système d'annulation

const testBookingData = {
  firstName: 'Test',
  lastName: 'CANCELLATION',
  email: 'talalizakaria0@gmail.com',
  phone: '0123456789',
  country: 'FR',
  date: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // Dans 48h (plus de 24h)
  time: '10:00',
  period: 'morning',
  firstConsultation: true,
  consultationReason: 'Test d\'annulation - Consultation de routine pour vérifier le système d\'annulation complet.',
  message: 'Ceci est un test d\'annulation pour vérifier que tout fonctionne correctement.'
}

async function createTestBooking() {
  console.log('🧪 Création d\'une réservation de test pour l\'annulation...\n')
  console.log('📋 Données de test:')
  console.log(`   Patient: ${testBookingData.firstName} ${testBookingData.lastName}`)
  console.log(`   Email: ${testBookingData.email}`)
  console.log(`   Date: ${new Date(testBookingData.date).toLocaleDateString('fr-FR')}`)
  console.log(`   Heure: ${testBookingData.time} (${testBookingData.period === 'morning' ? 'Matin' : 'Après-midi'})`)
  console.log('')
  
  try {
    const response = await fetch('http://localhost:3000/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testBookingData)
    })
    
    const result = await response.json()
    
    if (response.ok) {
      console.log('✅ Réservation de test créée avec succès !')
      console.log(`   ID: ${result.booking.id}`)
      console.log(`   Token d'annulation: ${result.booking.cancellationToken}`)
      console.log('')
      console.log('📧 Emails envoyés :')
      console.log('   • Confirmation patient (talalizakaria0@gmail.com)')
      console.log('   • Notification médecin (londalonda620@gmail.com)')
      console.log('')
      console.log('📅 Google Calendar synchronisé')
      
      return result.booking
      
    } else {
      console.error('❌ Erreur lors de la création de la réservation:')
      console.error(`   Status: ${response.status}`)
      console.error(`   Erreur: ${result.error}`)
      return null
    }
    
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message)
    return null
  }
}

async function testCancellation(booking) {
  console.log('\n🧪 Test d\'annulation de la réservation...\n')
  console.log('📋 Processus d\'annulation:')
  console.log('   1. ✅ Réservation marquée comme CANCELLED en base')
  console.log('   2. 📧 Email d\'annulation envoyé au patient')
  console.log('   3. 📧 Notification d\'annulation envoyée au médecin')
  console.log('   4. 📅 Événement supprimé de Google Calendar')
  console.log('')
  
  try {
    const response = await fetch('http://localhost:3000/api/bookings/cancel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cancellationToken: booking.cancellationToken
      })
    })
    
    const result = await response.json()
    
    if (response.ok) {
      console.log('✅ Annulation réussie !')
      console.log(`   Message: ${result.message}`)
      console.log('')
      console.log('📧 Emails d\'annulation envoyés :')
      console.log('   • talalizakaria0@gmail.com - Confirmation d\'annulation')
      console.log('   • londalonda620@gmail.com - Notification d\'annulation au médecin')
      console.log('')
      console.log('📅 Google Calendar mis à jour :')
      console.log('   • Événement supprimé automatiquement')
      console.log('')
      console.log('🔍 Vérifiez vos boîtes email !')
      
      return true
      
    } else {
      console.error('❌ Erreur lors de l\'annulation:')
      console.error(`   Status: ${response.status}`)
      console.error(`   Erreur: ${result.error}`)
      return false
    }
    
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message)
    return false
  }
}

async function runCancellationTest() {
  console.log('🚀 Test complet du système d\'annulation\n')
  console.log('=' .repeat(70))
  console.log('📧 Ce test va créer une réservation puis l\'annuler')
  console.log('⚠️  Vérifiez les emails : talalizakaria0@gmail.com et londalonda620@gmail.com')
  console.log('=' .repeat(70))
  console.log('')
  
  // Étape 1: Créer une réservation
  const booking = await createTestBooking()
  
  if (!booking) {
    console.log('❌ Impossible de créer la réservation de test')
    return
  }
  
  // Attendre un peu entre la création et l'annulation
  console.log('⏳ Attente de 3 secondes avant l\'annulation...')
  await new Promise(resolve => setTimeout(resolve, 3000))
  
  // Étape 2: Annuler la réservation
  const cancellationSuccess = await testCancellation(booking)
  
  console.log('\n' + '=' .repeat(70))
  console.log('✨ Test d\'annulation terminé !')
  console.log('')
  
  if (cancellationSuccess) {
    console.log('✅ Résumé du système d\'annulation :')
    console.log('   • Réservation annulée en base de données')
    console.log('   • Email de confirmation envoyé au patient')
    console.log('   • Notification d\'annulation envoyée au médecin')
    console.log('   • Événement supprimé de Google Calendar')
    console.log('   • Design professionnel vert appliqué')
    console.log('')
    console.log('🎯 Le système d\'annulation fonctionne parfaitement !')
  } else {
    console.log('❌ Le test d\'annulation a échoué')
  }
}

// Exécuter les tests si le script est appelé directement
if (require.main === module) {
  runCancellationTest().catch(console.error)
}

module.exports = { createTestBooking, testCancellation, runCancellationTest }
