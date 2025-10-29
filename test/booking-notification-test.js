// test/booking-notification-test.js
// Test complet des notifications via l'API de réservation

const testBookingData = {
  firstName: 'Jean',
  lastName: 'Dupont',
  email: 'jean.dupont@example.com',
  phone: '0123456789',
  country: 'FR',
  date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Demain
  time: '14:30',
  period: 'afternoon',
  firstConsultation: true,
  consultationReason: 'Douleurs abdominales persistantes depuis 3 jours, accompagnées de nausées et de fièvre légère. Le patient souhaite un examen approfondi pour écarter toute pathologie digestive.',
  message: 'Bonjour Docteur, j\'aimerais prendre rendez-vous car j\'ai des douleurs au ventre qui ne passent pas. Merci beaucoup.'
}

async function testBookingWithNotification() {
  console.log('🧪 Test de réservation avec notification médecin améliorée...\n')
  console.log('📋 Données de test:')
  console.log(`   Patient: ${testBookingData.firstName} ${testBookingData.lastName}`)
  console.log(`   Email: ${testBookingData.email}`)
  console.log(`   Motif: ${testBookingData.consultationReason.substring(0, 80)}...`)
  console.log(`   Message: ${testBookingData.message?.substring(0, 50)}...`)
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
      console.log('✅ Réservation créée avec succès !')
      console.log(`   ID: ${result.booking.id}`)
      console.log(`   Token d'annulation: ${result.booking.cancellationToken}`)
      console.log('')
      console.log('📧 Vérifiez votre boîte email pour:')
      console.log('   - Email de confirmation au patient')
      console.log('   - Notification au médecin (avec motif et message)')
      
    } else {
      console.error('❌ Erreur lors de la création de la réservation:')
      console.error(`   Status: ${response.status}`)
      console.error(`   Erreur: ${result.error}`)
      
      if (result.details) {
        console.error('   Détails:', result.details)
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message)
    console.log('💡 Assurez-vous que le serveur Next.js est démarré (npm run dev)')
  }
}

async function testBookingWithoutMessage() {
  console.log('\n🧪 Test de réservation sans message optionnel...\n')
  
  const testDataWithoutMessage = {
    ...testBookingData,
    firstName: 'Marie',
    lastName: 'Martin',
    email: 'marie.martin@example.com',
    phone: '0987654321',
    time: '09:15',
    period: 'morning',
    firstConsultation: false,
    consultationReason: 'Contrôle de routine et renouvellement d\'ordonnance pour traitement de l\'hypertension artérielle.',
    message: undefined // Pas de message optionnel
  }
  
  console.log('📋 Données de test:')
  console.log(`   Patient: ${testDataWithoutMessage.firstName} ${testDataWithoutMessage.lastName}`)
  console.log(`   Motif: ${testDataWithoutMessage.consultationReason.substring(0, 80)}...`)
  console.log(`   Message: ${testDataWithoutMessage.message || 'Aucun'}`)
  console.log('')
  
  try {
    const response = await fetch('http://localhost:3000/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testDataWithoutMessage)
    })
    
    const result = await response.json()
    
    if (response.ok) {
      console.log('✅ Réservation créée avec succès !')
      console.log(`   ID: ${result.booking.id}`)
      console.log('')
      console.log('📧 Vérifiez votre boîte email pour:')
      console.log('   - Email de confirmation au patient')
      console.log('   - Notification au médecin (avec motif, sans message)')
      
    } else {
      console.error('❌ Erreur lors de la création de la réservation:')
      console.error(`   Status: ${response.status}`)
      console.error(`   Erreur: ${result.error}`)
    }
    
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message)
  }
}

async function runTests() {
  console.log('🚀 Test des notifications email améliorées\n')
  console.log('=' .repeat(70))
  console.log('📧 Ce test va créer des réservations pour tester les emails')
  console.log('⚠️  Assurez-vous que le serveur Next.js est démarré (npm run dev)')
  console.log('⚠️  Configurez les variables SMTP pour recevoir les emails')
  console.log('=' .repeat(70))
  console.log('')
  
  await testBookingWithNotification()
  await testBookingWithoutMessage()
  
  console.log('\n' + '=' .repeat(70))
  console.log('✨ Tests terminés !')
  console.log('')
  console.log('📋 Améliorations apportées aux notifications médecin :')
  console.log('   ✅ Motif de consultation mis en évidence dans une section dédiée')
  console.log('   ✅ Message optionnel du patient formaté et stylisé')
  console.log('   ✅ Design amélioré avec sections colorées et organisées')
  console.log('   ✅ Indicateurs visuels (✅/❌) pour première consultation')
  console.log('   ✅ Informations mieux structurées et lisibles')
  console.log('')
  console.log('🔧 Configuration email requise :')
  console.log('   - SMTP_USER: Votre email Gmail')
  console.log('   - SMTP_PASSWORD: Mot de passe d\'application Gmail')
  console.log('   - SMTP_FROM_NAME: Nom d\'affichage (optionnel)')
}

// Exécuter les tests si le script est appelé directement
if (require.main === module) {
  runTests().catch(console.error)
}

module.exports = { testBookingWithNotification, testBookingWithoutMessage, runTests }
