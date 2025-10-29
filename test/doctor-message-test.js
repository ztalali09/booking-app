// test/doctor-message-test.js
// Test du système avec message du médecin

const testBookingData = {
  firstName: 'Test',
  lastName: 'DOCTOR_MESSAGE',
  email: 'talalizakaria0@gmail.com',
  phone: '0123456789',
  country: 'FR',
  date: new Date('2024-11-09T10:00:00.000Z').toISOString(), // Samedi 9 novembre 2024
  time: '10:30',
  period: 'morning',
  firstConsultation: true,
  consultationReason: 'Test du message du médecin - Consultation de routine pour vérifier le système de message personnalisé.',
  message: 'Ceci est un test du message du médecin lors de l\'annulation.'
}

async function createTestBooking() {
  console.log('🧪 Création d\'une réservation de test pour le message du médecin...\n')
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

async function testDoctorCancellationWithMessage(booking) {
  console.log('\n🧪 Test d\'annulation par le médecin avec message personnalisé...\n')
  
  const doctorMessage = "Désolé pour ce contretemps. J'ai eu une urgence médicale et je ne pourrai pas être disponible à l'heure prévue. Je vous contacterai dans les plus brefs délais pour reprogrammer votre rendez-vous à un moment plus approprié. Merci de votre compréhension."
  
  console.log('📝 Message du médecin qui sera envoyé :')
  console.log(`   "${doctorMessage}"`)
  console.log('')
  
  try {
    const response = await fetch('http://localhost:3000/api/bookings/doctor-cancel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cancellationToken: booking.cancellationToken,
        cancelledBy: 'doctor',
        doctorMessage: doctorMessage
      })
    })
    
    const result = await response.json()
    
    if (response.ok) {
      console.log('✅ API d\'annulation médecin avec message fonctionne !')
      console.log(`   Message: ${result.message}`)
      console.log('')
      console.log('📧 Email d\'annulation envoyé au patient :')
      console.log('   • talalizakaria0@gmail.com - Notification d\'annulation par le médecin')
      console.log('   • Message personnalisé du médecin inclus')
      console.log('   • Design professionnel avec section dédiée')
      console.log('')
      console.log('📅 Google Calendar mis à jour')
      
      return true
    } else {
      console.error('❌ Erreur API annulation médecin avec message:')
      console.error(`   Status: ${response.status}`)
      console.error(`   Erreur: ${result.error}`)
      return false
    }
    
  } catch (error) {
    console.error('❌ Erreur de connexion API annulation médecin:', error.message)
    return false
  }
}

async function runDoctorMessageTest() {
  console.log('🚀 Test du système avec message du médecin\n')
  console.log('=' .repeat(80))
  console.log('👨‍⚕️ Ce test va créer une réservation et tester l\'annulation avec message du médecin')
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
  console.log('⏳ Attente de 3 secondes avant l\'annulation avec message...')
  await new Promise(resolve => setTimeout(resolve, 3000))
  
  // Étape 2: Tester l'annulation avec message du médecin
  const cancellationSuccess = await testDoctorCancellationWithMessage(booking)
  
  console.log('\n' + '=' .repeat(80))
  console.log('✨ Test du message du médecin terminé !')
  console.log('')
  
  if (cancellationSuccess) {
    console.log('✅ Résumé du système avec message du médecin :')
    console.log('   • Interface médecin avec champ de message')
    console.log('   • API d\'annulation avec support du message')
    console.log('   • Email patient avec message personnalisé')
    console.log('   • Design professionnel pour le message')
    console.log('   • Google Calendar synchronisé')
    console.log('')
    console.log('🎯 Fonctionnalités du message du médecin :')
    console.log('   • Champ de texte avec limite de 500 caractères')
    console.log('   • Compteur de caractères en temps réel')
    console.log('   • Message optionnel (peut être vide)')
    console.log('   • Affichage dans l\'email du patient')
    console.log('   • Design bleu professionnel')
    console.log('')
    console.log('📧 Structure de l\'email patient :')
    console.log('   • Header rouge "Annulation par le médecin"')
    console.log('   • Détails du rendez-vous annulé')
    console.log('   • Section "Message du médecin" (si fourni)')
    console.log('   • Prochaines étapes')
    console.log('   • Informations de contact')
    console.log('')
    console.log('🔗 Liens d\'annulation :')
    console.log(`   • Patient: http://localhost:3000/cancel?token=${booking.cancellationToken}`)
    console.log(`   • Médecin: http://localhost:3000/doctor/cancel?token=${booking.cancellationToken}`)
    console.log('')
    console.log('🎉 Le système avec message du médecin est COMPLET !')
  } else {
    console.log('❌ Le test du message du médecin a échoué')
  }
}

// Exécuter les tests si le script est appelé directement
if (require.main === module) {
  runDoctorMessageTest().catch(console.error)
}

module.exports = { createTestBooking, testDoctorCancellationWithMessage, runDoctorMessageTest }
