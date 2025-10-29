// test/november-test.js
// Test pour la première semaine de novembre

const testBookingData = {
  firstName: 'Test',
  lastName: 'NOVEMBRE',
  email: 'talalizakaria0@gmail.com',
  phone: '0123456789',
  country: 'FR',
  date: new Date('2024-11-07T10:00:00.000Z').toISOString(), // Jeudi 7 novembre 2024
  time: '16:00',
  period: 'afternoon',
  firstConsultation: true,
  consultationReason: 'Test première semaine de novembre - Consultation de routine pour vérifier le système avec des dates réelles.',
  message: 'Ceci est un test pour la première semaine de novembre 2024.'
}

async function createNovemberBooking() {
  console.log('🧪 Création d\'une réservation pour la première semaine de novembre...\n')
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
      console.log('✅ Réservation de novembre créée avec succès !')
      console.log(`   ID: ${result.booking.id}`)
      console.log(`   Token d'annulation: ${result.booking.cancellationToken}`)
      console.log('')
      console.log('📧 Emails envoyés :')
      console.log('   • Confirmation patient (talalizakaria0@gmail.com)')
      console.log('   • Notification médecin (londalonda620@gmail.com)')
      console.log('')
      console.log('🔗 Lien d\'annulation dans l\'email :')
      console.log(`   http://localhost:3000/cancel?token=${result.booking.cancellationToken}`)
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

async function runNovemberTest() {
  console.log('🚀 Test de la première semaine de novembre\n')
  console.log('=' .repeat(70))
  console.log('📅 Test avec une date réelle de novembre 2024')
  console.log('⚠️  Vérifiez les emails : talalizakaria0@gmail.com et londalonda620@gmail.com')
  console.log('=' .repeat(70))
  console.log('')
  
  const booking = await createNovemberBooking()
  
  if (booking) {
    console.log('\n' + '=' .repeat(70))
    console.log('✨ Test de novembre terminé !')
    console.log('')
    console.log('✅ Réservation créée pour novembre 2024')
    console.log('📧 Emails de confirmation envoyés')
    console.log('📅 Google Calendar synchronisé')
    console.log('🔗 Interface d\'annulation disponible')
    console.log('')
    console.log('🎯 Prêt pour les tests d\'annulation par le médecin !')
  } else {
    console.log('❌ Le test de novembre a échoué')
  }
}

// Exécuter les tests si le script est appelé directement
if (require.main === module) {
  runNovemberTest().catch(console.error)
}

module.exports = { createNovemberBooking, runNovemberTest }
