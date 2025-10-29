// test/test-reminder-complete.js
// Test complet du système de rappel avec données réelles

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testReminderSystem() {
  try {
    console.log('🧪 Test complet du système de rappel...')
    
    // 1. Nettoyer la base de données
    console.log('\n1️⃣ Nettoyage de la base de données...')
    await prisma.booking.deleteMany({})
    console.log('✅ Base de données nettoyée')
    
    // 2. Créer des rendez-vous de test pour demain
    console.log('\n2️⃣ Création des rendez-vous de test...')
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const testBookings = [
      {
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean.dupont@example.com',
        phone: '0123456789',
        date: tomorrow,
        time: '09:00',
        period: 'morning',
        firstConsultation: true,
        consultationReason: 'Première consultation - Douleurs abdominales',
        message: 'J\'ai des douleurs depuis 3 jours',
        status: 'PENDING'
      },
      {
        firstName: 'Marie',
        lastName: 'Martin',
        email: 'marie.martin@example.com',
        phone: '0987654321',
        date: tomorrow,
        time: '10:30',
        period: 'morning',
        firstConsultation: false,
        consultationReason: 'Suivi médical - Contrôle tension',
        message: 'Mes médicaments fonctionnent bien',
        status: 'CONFIRMED'
      },
      {
        firstName: 'Pierre',
        lastName: 'Durand',
        email: 'pierre.durand@example.com',
        phone: '0555123456',
        date: tomorrow,
        time: '14:00',
        period: 'afternoon',
        firstConsultation: true,
        consultationReason: 'Consultation urgente - Fièvre persistante',
        message: 'J\'ai de la fièvre depuis 5 jours',
        status: 'PENDING'
      },
      {
        firstName: 'Sophie',
        lastName: 'Leroy',
        email: 'sophie.leroy@example.com',
        phone: '0666789012',
        date: tomorrow,
        time: '15:30',
        period: 'afternoon',
        firstConsultation: false,
        consultationReason: 'Consultation de routine - Bilan annuel',
        status: 'CONFIRMED'
      }
    ]
    
    for (const booking of testBookings) {
      await prisma.booking.create({ data: booking })
    }
    
    console.log(`✅ ${testBookings.length} rendez-vous créés pour demain`)
    
    // 3. Tester la récupération des rappels
    console.log('\n3️⃣ Test de récupération des rappels...')
    const { getBookingsToRemind } = require('../lib/services/reminder.js')
    const reminders = await getBookingsToRemind()
    
    console.log(`📅 ${reminders.length} rendez-vous à rappeler trouvés`)
    reminders.forEach((booking, index) => {
      const date = new Date(booking.date).toLocaleDateString('fr-FR')
      console.log(`   ${index + 1}. ${booking.firstName} ${booking.lastName} - ${date} à ${booking.time}`)
    })
    
    // 4. Tester l'envoi des rappels
    console.log('\n4️⃣ Test d\'envoi des rappels...')
    const { sendAllReminders } = require('../lib/services/reminder.js')
    
    console.log('📧 Envoi des rappels...')
    const result = await sendAllReminders()
    
    console.log('\n📊 Résultats:')
    console.log(`✅ Rappels envoyés: ${result.sent}`)
    console.log(`❌ Erreurs: ${result.errors}`)
    console.log(`📈 Total traité: ${result.sent + result.errors}`)
    
    // 5. Vérifier les données en base
    console.log('\n5️⃣ Vérification des données en base...')
    const allBookings = await prisma.booking.findMany({
      where: {
        date: {
          gte: tomorrow,
          lt: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)
        }
      },
      orderBy: { time: 'asc' }
    })
    
    console.log(`📋 ${allBookings.length} rendez-vous trouvés en base pour demain`)
    allBookings.forEach((booking, index) => {
      console.log(`   ${index + 1}. ${booking.firstName} ${booking.lastName} - ${booking.time} (${booking.status})`)
    })
    
    // 6. Test des cas d'erreur
    console.log('\n6️⃣ Test des cas d\'erreur...')
    
    // Créer un rendez-vous avec email invalide
    await prisma.booking.create({
      data: {
        firstName: 'Test',
        lastName: 'Error',
        email: 'invalid-email-format',
        phone: '0123456789',
        date: tomorrow,
        time: '16:00',
        period: 'afternoon',
        firstConsultation: true,
        consultationReason: 'Test erreur email',
        status: 'PENDING'
      }
    })
    
    console.log('📧 Test avec email invalide...')
    const { sendAllReminders: sendAllReminders2 } = require('../lib/services/reminder.js')
    const errorResult = await sendAllReminders2()
    console.log(`   Résultat: ${errorResult.sent} envoyés, ${errorResult.errors} erreurs`)
    
    // 7. Test de performance
    console.log('\n7️⃣ Test de performance...')
    const startTime = Date.now()
    const { getBookingsToRemind: getBookingsToRemind2 } = require('../lib/services/reminder.js')
    const performanceReminders = await getBookingsToRemind2()
    const endTime = Date.now()
    
    console.log(`⏱️  Temps de récupération: ${endTime - startTime}ms`)
    console.log(`📊 ${performanceReminders.length} rappels récupérés`)
    
    // 8. Nettoyage final
    console.log('\n8️⃣ Nettoyage final...')
    await prisma.booking.deleteMany({})
    console.log('✅ Base de données nettoyée')
    
    console.log('\n🎉 Test complet terminé avec succès!')
    
  } catch (error) {
    console.error('💥 Erreur lors du test:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Exécuter le test
testReminderSystem()
