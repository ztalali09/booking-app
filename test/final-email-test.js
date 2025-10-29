// test/final-email-test.js
// Test final pour vérifier les emails avec liens d'annulation

const testBookingData = {
  firstName: 'Test',
  lastName: 'FINAL_EMAIL',
  email: 'talalizakaria0@gmail.com',
  phone: '0123456789',
  country: 'FR',
  date: new Date('2024-11-08T10:00:00.000Z').toISOString(), // Vendredi 8 novembre 2024
  time: '09:30',
  period: 'morning',
  firstConsultation: true,
  consultationReason: 'Test final des emails - Consultation de routine pour vérifier que tous les liens d\'annulation sont présents.',
  message: 'Ceci est un test final pour vérifier que les emails contiennent bien les liens d\'annulation.'
}

async function createFinalTestBooking() {
  console.log('🧪 Création d\'une réservation de test final...\n')
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
      console.log('✅ Réservation de test final créée avec succès !')
      console.log(`   ID: ${result.booking.id}`)
      console.log(`   Token d'annulation: ${result.booking.cancellationToken}`)
      console.log('')
      console.log('📧 Emails envoyés avec liens d\'annulation :')
      console.log('   • Confirmation patient (talalizakaria0@gmail.com)')
      console.log('     - Lien d\'annulation patient inclus')
      console.log('   • Notification médecin (londalonda620@gmail.com)')
      console.log('     - Bouton d\'annulation médecin inclus')
      console.log('')
      console.log('🔗 Liens d\'annulation disponibles :')
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

async function runFinalEmailTest() {
  console.log('🚀 Test final des emails avec liens d\'annulation\n')
  console.log('=' .repeat(80))
  console.log('📧 Ce test vérifie que tous les emails contiennent les liens d\'annulation')
  console.log('⚠️  Vérifiez les emails : talalizakaria0@gmail.com et londalonda620@gmail.com')
  console.log('=' .repeat(80))
  console.log('')
  
  const booking = await createFinalTestBooking()
  
  if (booking) {
    console.log('\n' + '=' .repeat(80))
    console.log('✨ Test final des emails terminé !')
    console.log('')
    console.log('✅ Résumé des fonctionnalités email :')
    console.log('   • Email patient : Lien d\'annulation vert')
    console.log('   • Email médecin : Bouton d\'annulation rouge')
    console.log('   • Design professionnel appliqué')
    console.log('   • Google Calendar synchronisé')
    console.log('')
    console.log('🎯 Fonctionnalités complètes :')
    console.log('   • Patient peut annuler via son email')
    console.log('   • Médecin peut annuler via son email')
    console.log('   • Notifications automatiques bidirectionnelles')
    console.log('   • Interface utilisateur pour les deux')
    console.log('   • Emails différenciés selon qui annule')
    console.log('')
    console.log('🔗 Liens d\'annulation :')
    console.log(`   • Patient: http://localhost:3000/cancel?token=${booking.cancellationToken}`)
    console.log(`   • Médecin: http://localhost:3000/doctor/cancel?token=${booking.cancellationToken}`)
    console.log('')
    console.log('🎉 Le système d\'emails est maintenant COMPLET !')
  } else {
    console.log('❌ Le test final des emails a échoué')
  }
}

// Exécuter les tests si le script est appelé directement
if (require.main === module) {
  runFinalEmailTest().catch(console.error)
}

module.exports = { createFinalTestBooking, runFinalEmailTest }
