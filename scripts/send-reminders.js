// scripts/send-reminders.js
// Script pour envoyer les rappels automatiquement

const { sendAllReminders, getBookingsToRemind } = require('../lib/services/reminder')

async function main() {
  try {
    console.log('🚀 Démarrage du script de rappels...')
    console.log('⏰', new Date().toISOString())
    
    // Vérifier les rendez-vous à rappeler
    const bookings = await getBookingsToRemind()
    console.log(`📅 ${bookings.length} rendez-vous trouvés pour demain`)
    
    if (bookings.length === 0) {
      console.log('✅ Aucun rappel à envoyer')
      process.exit(0)
    }
    
    // Afficher les détails des rendez-vous
    console.log('\n📋 Détails des rendez-vous à rappeler:')
    bookings.forEach((booking, index) => {
      const date = new Date(booking.date).toLocaleDateString('fr-FR')
      console.log(`${index + 1}. ${booking.firstName} ${booking.lastName} - ${date} à ${booking.time}`)
    })
    
    // Envoyer les rappels
    console.log('\n📧 Envoi des rappels...')
    const result = await sendAllReminders()
    
    console.log('\n📊 Résultats:')
    console.log(`✅ Rappels envoyés: ${result.sent}`)
    console.log(`❌ Erreurs: ${result.errors}`)
    console.log(`📈 Total traité: ${result.sent + result.errors}`)
    
    if (result.errors > 0) {
      console.log('\n⚠️  Certains rappels ont échoué. Vérifiez les logs pour plus de détails.')
      process.exit(1)
    } else {
      console.log('\n🎉 Tous les rappels ont été envoyés avec succès!')
      process.exit(0)
    }
    
  } catch (error) {
    console.error('💥 Erreur fatale:', error)
    process.exit(1)
  }
}

// Exécuter le script
main()
