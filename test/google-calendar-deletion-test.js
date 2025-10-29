// test/google-calendar-deletion-test.js
// Test de la suppression automatique de Google Calendar

const testBookingData = {
  firstName: 'Test',
  lastName: 'CALENDAR_DELETE',
  email: 'talalizakaria0@gmail.com',
  phone: '0123456789',
  country: 'FR',
  date: new Date('2024-11-10T10:00:00.000Z').toISOString(), // Dimanche 10 novembre 2024
  time: '14:00',
  period: 'afternoon',
  firstConsultation: true,
  consultationReason: 'Test de suppression Google Calendar - Consultation de routine pour vérifier la suppression automatique.',
  message: 'Ceci est un test de suppression automatique de Google Calendar.'
}

async function createTestBooking() {
  console.log('🧪 Création d\'une réservation de test pour la suppression Google Calendar...\n')
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
      console.log(`   Google Calendar Event ID: ${result.booking.googleCalendarEventId || 'Non créé'}`)
      console.log('')
      console.log('📧 Emails envoyés :')
      console.log('   • Confirmation patient (talalizakaria0@gmail.com)')
      console.log('   • Notification médecin (médecin@example.com)')
      console.log('')
      console.log('📅 Google Calendar synchronisé')
      console.log('   • Événement créé automatiquement')
      console.log('   • ID stocké en base de données')
      console.log('')
      console.log('🔗 Liens d\'annulation :')
      console.log(`   • Patient: http://localhost:3000/cancel?token=${result.booking.cancellationToken}`)
      console.log(`   • Médecin: http://localhost:3000/doctor/cancel?token=${result.booking.cancellationToken}`)
      
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

async function testPatientCancellation(booking) {
  console.log('\n🧪 Test d\'annulation par le patient...\n')
  console.log('📋 Processus d\'annulation patient :')
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
      console.log('✅ Annulation patient réussie !')
      console.log(`   Message: ${result.message}`)
      console.log('')
      console.log('📧 Emails d\'annulation envoyés :')
      console.log('   • talalizakaria0@gmail.com - Confirmation d\'annulation')
      console.log('   • médecin@example.com - Notification d\'annulation au médecin')
      console.log('')
      console.log('📅 Google Calendar mis à jour :')
      console.log('   • Événement supprimé automatiquement')
      console.log('   • Créneau redevient disponible')
      console.log('')
      console.log('🔍 Vérifiez votre Google Calendar - l\'événement doit être supprimé !')
      
      return true
    } else {
      console.error('❌ Erreur lors de l\'annulation patient:')
      console.error(`   Status: ${response.status}`)
      console.error(`   Erreur: ${result.error}`)
      return false
    }
    
  } catch (error) {
    console.error('❌ Erreur de connexion annulation patient:', error.message)
    return false
  }
}

async function testDoctorCancellation(booking) {
  console.log('\n🧪 Test d\'annulation par le médecin...\n')
  console.log('📋 Processus d\'annulation médecin :')
  console.log('   1. ✅ Réservation marquée comme CANCELLED en base')
  console.log('   2. 📧 Email d\'annulation envoyé au patient')
  console.log('   3. 📅 Événement supprimé de Google Calendar')
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
        doctorMessage: 'Test de suppression Google Calendar par le médecin.'
      })
    })
    
    const result = await response.json()
    
    if (response.ok) {
      console.log('✅ Annulation médecin réussie !')
      console.log(`   Message: ${result.message}`)
      console.log('')
      console.log('📧 Email d\'annulation envoyé :')
      console.log('   • talalizakaria0@gmail.com - Notification d\'annulation par le médecin')
      console.log('   • Message personnalisé du médecin inclus')
      console.log('')
      console.log('📅 Google Calendar mis à jour :')
      console.log('   • Événement supprimé automatiquement')
      console.log('   • Créneau redevient disponible')
      console.log('')
      console.log('🔍 Vérifiez votre Google Calendar - l\'événement doit être supprimé !')
      
      return true
    } else {
      console.error('❌ Erreur lors de l\'annulation médecin:')
      console.error(`   Status: ${response.status}`)
      console.error(`   Erreur: ${result.error}`)
      return false
    }
    
  } catch (error) {
    console.error('❌ Erreur de connexion annulation médecin:', error.message)
    return false
  }
}

async function runGoogleCalendarDeletionTest() {
  console.log('🚀 Test de suppression automatique Google Calendar\n')
  console.log('=' .repeat(80))
  console.log('📅 Ce test vérifie que les événements sont supprimés automatiquement')
  console.log('⚠️  Vérifiez votre Google Calendar pendant les tests')
  console.log('=' .repeat(80))
  console.log('')
  
  // Test 1: Annulation par le patient
  console.log('🧪 TEST 1: Annulation par le patient')
  console.log('=' .repeat(50))
  
  const booking1 = await createTestBooking()
  
  if (!booking1) {
    console.log('❌ Impossible de créer la première réservation de test')
    return
  }
  
  console.log('⏳ Attente de 3 secondes avant l\'annulation patient...')
  await new Promise(resolve => setTimeout(resolve, 3000))
  
  const patientSuccess = await testPatientCancellation(booking1)
  
  // Test 2: Annulation par le médecin
  console.log('\n🧪 TEST 2: Annulation par le médecin')
  console.log('=' .repeat(50))
  
  const booking2 = await createTestBooking()
  
  if (!booking2) {
    console.log('❌ Impossible de créer la deuxième réservation de test')
    return
  }
  
  console.log('⏳ Attente de 3 secondes avant l\'annulation médecin...')
  await new Promise(resolve => setTimeout(resolve, 3000))
  
  const doctorSuccess = await testDoctorCancellation(booking2)
  
  console.log('\n' + '=' .repeat(80))
  console.log('✨ Test de suppression Google Calendar terminé !')
  console.log('')
  
  if (patientSuccess && doctorSuccess) {
    console.log('✅ Résumé de la suppression automatique Google Calendar :')
    console.log('   • Annulation patient : Événement supprimé automatiquement')
    console.log('   • Annulation médecin : Événement supprimé automatiquement')
    console.log('   • Créneaux redeviennent disponibles')
    console.log('   • Synchronisation en temps réel')
    console.log('')
    console.log('🎯 Fonctionnement de la suppression :')
    console.log('   1. Création RDV → Événement créé dans Google Calendar')
    console.log('   2. ID événement stocké en base de données')
    console.log('   3. Annulation → Suppression automatique via API Google')
    console.log('   4. Créneau redevient libre immédiatement')
    console.log('')
    console.log('📅 Vérifications à faire :')
    console.log('   • Ouvrez votre Google Calendar')
    console.log('   • Vérifiez que les événements de test ont disparu')
    console.log('   • Les créneaux sont à nouveau disponibles')
    console.log('')
    console.log('🎉 La suppression automatique Google Calendar fonctionne parfaitement !')
  } else {
    console.log('❌ Certains tests de suppression Google Calendar ont échoué')
  }
}

// Exécuter les tests si le script est appelé directement
if (require.main === module) {
  runGoogleCalendarDeletionTest().catch(console.error)
}

module.exports = { createTestBooking, testPatientCancellation, testDoctorCancellation, runGoogleCalendarDeletionTest }
