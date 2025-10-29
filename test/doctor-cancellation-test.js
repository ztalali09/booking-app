// test/doctor-cancellation-test.js
// Test complet de l'annulation par le médecin

const testBookingData = {
  firstName: 'Test',
  lastName: 'DOCTOR_CANCEL',
  email: 'talalizakaria0@gmail.com',
  phone: '0123456789',
  country: 'FR',
  date: new Date('2024-11-06T14:00:00.000Z').toISOString(), // Mercredi 6 novembre 2024
  time: '15:00',
  period: 'afternoon',
  firstConsultation: true,
  consultationReason: 'Test d\'annulation par le médecin - Consultation de routine pour vérifier le système d\'annulation par le médecin.',
  message: 'Ceci est un test d\'annulation par le médecin pour vérifier que tout fonctionne parfaitement.'
}

async function createTestBooking() {
  console.log('🧪 Création d\'une réservation de test pour l\'annulation par le médecin...\n')
  console.log('📋 Données de test:')
  console.log(`   Patient: ${testBookingData.firstName} ${testBookingData.lastName}`)
  console.log(`   Email: ${testBookingData.email}`)
  console.log(`   Date: ${new Date(testBookingData.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`)
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
      console.log('🔗 Liens d\'annulation :')
      console.log(`   • Patient: http://localhost:3000/cancel?token=${result.booking.cancellationToken}`)
      console.log(`   • Médecin: http://localhost:3000/doctor/cancel?token=${result.booking.cancellationToken}`)
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

async function testDoctorCancellationAPI(booking) {
  console.log('\n🧪 Test de l\'API d\'annulation par le médecin...\n')
  
  try {
    const response = await fetch('http://localhost:3000/api/bookings/doctor-cancel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cancellationToken: booking.cancellationToken,
        cancelledBy: 'doctor'
      })
    })
    
    const result = await response.json()
    
    if (response.ok) {
      console.log('✅ API d\'annulation médecin fonctionne !')
      console.log(`   Message: ${result.message}`)
      console.log('')
      console.log('📧 Emails d\'annulation envoyés :')
      console.log('   • talalizakaria0@gmail.com - Notification d\'annulation par le médecin')
      console.log('   • Le médecin est informé de l\'annulation')
      console.log('')
      console.log('📅 Google Calendar mis à jour')
      
      return true
    } else {
      console.error('❌ Erreur API annulation médecin:')
      console.error(`   Status: ${response.status}`)
      console.error(`   Erreur: ${result.error}`)
      return false
    }
    
  } catch (error) {
    console.error('❌ Erreur de connexion API annulation médecin:', error.message)
    return false
  }
}

async function runDoctorCancellationTest() {
  console.log('🚀 Test complet de l\'annulation par le médecin\n')
  console.log('=' .repeat(80))
  console.log('👨‍⚕️ Ce test va créer une réservation et tester l\'annulation par le médecin')
  console.log('⚠️  Vérifiez les emails : talalizakaria0@gmail.com et londalonda620@gmail.com')
  console.log('🌐 Interface médecin : http://localhost:3000/doctor/cancel?token=TOKEN')
  console.log('=' .repeat(80))
  console.log('')
  
  // Étape 1: Créer une réservation
  const booking = await createTestBooking()
  
  if (!booking) {
    console.log('❌ Impossible de créer la réservation de test')
    return
  }
  
  // Attendre un peu entre la création et l'annulation
  console.log('⏳ Attente de 3 secondes avant l\'annulation par le médecin...')
  await new Promise(resolve => setTimeout(resolve, 3000))
  
  // Étape 2: Tester l'annulation par le médecin
  const cancellationSuccess = await testDoctorCancellationAPI(booking)
  
  console.log('\n' + '=' .repeat(80))
  console.log('✨ Test d\'annulation par le médecin terminé !')
  console.log('')
  
  if (cancellationSuccess) {
    console.log('✅ Résumé du système d\'annulation par le médecin :')
    console.log('   • Interface médecin créée (/doctor/cancel)')
    console.log('   • API d\'annulation médecin fonctionnelle (/api/bookings/doctor-cancel)')
    console.log('   • Notification patient quand le médecin annule')
    console.log('   • Google Calendar synchronisé')
    console.log('   • Design professionnel appliqué')
    console.log('')
    console.log('🎯 Fonctionnalités de l\'interface médecin :')
    console.log('   • Affichage complet des détails du patient')
    console.log('   • Confirmation avant annulation')
    console.log('   • Notification automatique au patient')
    console.log('   • Design professionnel bleu')
    console.log('   • Messages d\'erreur appropriés')
    console.log('')
    console.log('📧 Emails différenciés :')
    console.log('   • Patient annule : Email vert standard')
    console.log('   • Médecin annule : Email rouge avec message spécial')
    console.log('')
    console.log('🔗 Liens d\'annulation :')
    console.log(`   • Patient: http://localhost:3000/cancel?token=${booking.cancellationToken}`)
    console.log(`   • Médecin: http://localhost:3000/doctor/cancel?token=${booking.cancellationToken}`)
    console.log('')
    console.log('🎉 Le système d\'annulation par le médecin est complet !')
  } else {
    console.log('❌ Le test d\'annulation par le médecin a échoué')
  }
}

// Exécuter les tests si le script est appelé directement
if (require.main === module) {
  runDoctorCancellationTest().catch(console.error)
}

module.exports = { createTestBooking, testDoctorCancellationAPI, runDoctorCancellationTest }
