// test/real-email-test.js
// Test avec l'email réel talalizakaria0@gmail.com

const testBookingData1 = {
  firstName: 'Zakaria',
  lastName: 'TALALI',
  email: 'talalizakaria0@gmail.com',
  phone: '0123456789',
  country: 'FR',
  date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Demain
  time: '14:30',
  period: 'afternoon',
  firstConsultation: true,
  consultationReason: 'Consultation de routine et contrôle de la tension artérielle. Le patient souhaite également discuter des résultats de ses derniers examens sanguins.',
  message: 'Bonjour Docteur, j\'aimerais prendre rendez-vous pour un contrôle général. Merci beaucoup.'
}

const testBookingData2 = {
  firstName: 'Marie',
  lastName: 'DUPONT',
  email: 'talalizakaria0@gmail.com',
  phone: '0987654321',
  country: 'FR',
  date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Après-demain
  time: '09:15',
  period: 'morning',
  firstConsultation: false,
  consultationReason: 'Suivi post-opératoire et renouvellement d\'ordonnance pour traitement de l\'hypertension artérielle.',
  message: 'Bonjour, je viens pour mon suivi habituel.'
}

async function testBookingWithRealEmail(bookingData, testName) {
  console.log(`\n🧪 ${testName}...\n`)
  console.log('📋 Données de réservation:')
  console.log(`   Patient: ${bookingData.firstName} ${bookingData.lastName}`)
  console.log(`   Email: ${bookingData.email}`)
  console.log(`   Date: ${new Date(bookingData.date).toLocaleDateString('fr-FR')}`)
  console.log(`   Heure: ${bookingData.time} (${bookingData.period === 'morning' ? 'Matin' : 'Après-midi'})`)
  console.log(`   Motif: ${bookingData.consultationReason.substring(0, 60)}...`)
  console.log(`   Message: ${bookingData.message?.substring(0, 40)}...`)
  console.log('')
  
  try {
    const response = await fetch('http://localhost:3000/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData)
    })
    
    const result = await response.json()
    
    if (response.ok) {
      console.log('✅ Réservation créée avec succès !')
      console.log(`   ID: ${result.booking.id}`)
      console.log(`   Token d'annulation: ${result.booking.cancellationToken}`)
      console.log('')
      console.log('📧 Emails envoyés :')
      console.log('   • Confirmation patient (talalizakaria0@gmail.com)')
      console.log('   • Notification médecin (design professionnel vert)')
      console.log('')
      console.log('🔍 Vérifiez votre boîte email !')
      
      return result.booking
      
    } else {
      console.error('❌ Erreur lors de la création de la réservation:')
      console.error(`   Status: ${response.status}`)
      console.error(`   Erreur: ${result.error}`)
      
      if (result.details) {
        console.error('   Détails:', result.details)
      }
      
      return null
    }
    
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message)
    console.log('💡 Assurez-vous que le serveur Next.js est démarré (npm run dev)')
    return null
  }
}

async function runRealEmailTests() {
  console.log('🚀 Test des emails avec talalizakaria0@gmail.com\n')
  console.log('=' .repeat(70))
  console.log('📧 Ce test va créer des réservations pour tester les emails réels')
  console.log('⚠️  Vérifiez votre boîte email : talalizakaria0@gmail.com')
  console.log('⚠️  Vérifiez aussi l\'email du médecin configuré dans SMTP_USER')
  console.log('=' .repeat(70))
  console.log('')
  
  // Attendre un peu que le serveur démarre
  console.log('⏳ Attente du démarrage du serveur...')
  await new Promise(resolve => setTimeout(resolve, 3000))
  
  const booking1 = await testBookingWithRealEmail(testBookingData1, 'Test 1 - Réservation avec message')
  
  if (booking1) {
    // Attendre un peu entre les réservations
    console.log('⏳ Attente de 2 secondes avant la prochaine réservation...')
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const booking2 = await testBookingWithRealEmail(testBookingData2, 'Test 2 - Réservation sans message')
    
    console.log('\n' + '=' .repeat(70))
    console.log('✨ Tests terminés !')
    console.log('')
    console.log('📧 Emails à vérifier :')
    console.log('   • talalizakaria0@gmail.com - Confirmations patient')
    console.log('   • Email médecin (SMTP_USER) - Notifications médecin')
    console.log('')
    console.log('🎨 Design appliqué :')
    console.log('   • Thème vert professionnel')
    console.log('   • Aucun emoji')
    console.log('   • Structure claire et corporate')
    console.log('   • Format heure "de XX:XX à XX:XX"')
  }
}

// Exécuter les tests si le script est appelé directement
if (require.main === module) {
  runRealEmailTests().catch(console.error)
}

module.exports = { testBookingWithRealEmail, runRealEmailTests }
