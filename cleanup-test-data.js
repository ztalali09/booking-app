#!/usr/bin/env node

/**
 * Script pour nettoyer les données de test
 * Usage: node cleanup-test-data.js
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function cleanupTestData() {
  console.log('🧹 Nettoyage des données de test...\n')
  
  try {
    // Récupérer toutes les réservations
    const allBookings = await prisma.booking.findMany({
      orderBy: { createdAt: 'desc' }
    })
    
    console.log(`📊 Total des réservations: ${allBookings.length}`)
    
    // Identifier les réservations de test
    const testBookings = allBookings.filter(booking => {
      const firstName = booking.firstName.toLowerCase()
      const lastName = booking.lastName.toLowerCase()
      const email = booking.email.toLowerCase()
      const reason = booking.consultationReason.toLowerCase()
      
      return (
        firstName.includes('test') ||
        lastName.includes('test') ||
        firstName.includes('verification') ||
        lastName.includes('final') ||
        firstName.includes('email') ||
        lastName.includes('calendar') ||
        firstName.includes('performance') ||
        lastName.includes('integration') ||
        firstName.includes('simple') ||
        lastName.includes('patient') ||
        email.includes('test') ||
        email.includes('example.com') ||
        reason.includes('test') ||
        reason.includes('vérification') ||
        reason.includes('performance') ||
        reason.includes('intégration')
      )
    })
    
    console.log(`🧪 Réservations de test identifiées: ${testBookings.length}`)
    
    if (testBookings.length === 0) {
      console.log('✅ Aucune donnée de test à nettoyer')
      return
    }
    
    // Afficher les réservations de test
    console.log('\n📋 Réservations de test à supprimer:')
    console.log('─'.repeat(60))
    testBookings.forEach((booking, index) => {
      const date = new Date(booking.date).toLocaleDateString('fr-FR')
      console.log(`${index + 1}. ${booking.firstName} ${booking.lastName} - ${date} ${booking.time}`)
    })
    
    // Supprimer les réservations de test
    console.log('\n🗑️  Suppression en cours...')
    
    const deleteResult = await prisma.booking.deleteMany({
      where: {
        id: {
          in: testBookings.map(b => b.id)
        }
      }
    })
    
    console.log(`✅ ${deleteResult.count} réservation(s) de test supprimée(s)`)
    
    // Vérifier les réservations restantes
    const remainingBookings = await prisma.booking.findMany({
      orderBy: { createdAt: 'desc' }
    })
    
    console.log(`\n📊 Réservations restantes: ${remainingBookings.length}`)
    
    if (remainingBookings.length > 0) {
      console.log('\n📋 Réservations conservées:')
      console.log('─'.repeat(60))
      remainingBookings.forEach((booking, index) => {
        const date = new Date(booking.date).toLocaleDateString('fr-FR')
        console.log(`${index + 1}. ${booking.firstName} ${booking.lastName} - ${date} ${booking.time}`)
      })
    }
    
    console.log('\n🎉 Nettoyage terminé!')
    console.log('✅ Votre base de données est maintenant propre')
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

// Exécuter le nettoyage
cleanupTestData().catch(console.error)
