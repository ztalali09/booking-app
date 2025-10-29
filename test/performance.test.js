#!/usr/bin/env node

/**
 * Tests de performance pour l'API de réservation
 * Usage: node test/performance.test.js
 */

require('dotenv').config({ path: '.env.local' })

const BASE_URL = 'http://localhost:3000'

// Fonction pour mesurer le temps d'exécution
async function measureTime(fn) {
  const start = Date.now()
  await fn()
  const end = Date.now()
  return end - start
}

// Fonction pour faire des requêtes HTTP
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, options)
    const data = await response.json()
    return { response, data, success: true }
  } catch (error) {
    return { response: null, data: null, error, success: false }
  }
}

// Tests de performance
async function runPerformanceTests() {
  console.log('⚡ Tests de performance - Application de Réservation\n')
  console.log('═'.repeat(60))
  
  let passedTests = 0
  let failedTests = 0
  
  // Test 1: Performance de l'API de disponibilité des dates
  console.log('\n📋 Test 1: Performance API de disponibilité des dates')
  console.log('─'.repeat(50))
  try {
    const times = []
    const iterations = 5
    
    for (let i = 0; i < iterations; i++) {
      const time = await measureTime(async () => {
        const { success } = await makeRequest(`${BASE_URL}/api/availability/dates?month=11&year=2025`)
        if (!success) throw new Error('Request failed')
      })
      times.push(time)
    }
    
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length
    const minTime = Math.min(...times)
    const maxTime = Math.max(...times)
    
    console.log(`✅ Temps moyen: ${avgTime.toFixed(2)}ms`)
    console.log(`   - Plus rapide: ${minTime}ms`)
    console.log(`   - Plus lent: ${maxTime}ms`)
    console.log(`   - ${iterations} requêtes testées`)
    
    if (avgTime < 1000) {
      console.log('✅ Performance excellente (< 1s)')
    } else if (avgTime < 3000) {
      console.log('⚠️  Performance acceptable (< 3s)')
    } else {
      console.log('❌ Performance lente (> 3s)')
    }
    
    passedTests++
  } catch (error) {
    console.error('❌ Test de performance échoué:', error.message)
    failedTests++
  }
  
  // Test 2: Performance de l'API de créneaux
  console.log('\n📋 Test 2: Performance API de créneaux')
  console.log('─'.repeat(50))
  try {
    const times = []
    const iterations = 3
    const testDate = '2025-11-20T00:00:00.000Z'
    
    for (let i = 0; i < iterations; i++) {
      const time = await measureTime(async () => {
        const { success } = await makeRequest(`${BASE_URL}/api/availability/slots?date=${testDate}`)
        if (!success) throw new Error('Request failed')
      })
      times.push(time)
    }
    
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length
    const minTime = Math.min(...times)
    const maxTime = Math.max(...times)
    
    console.log(`✅ Temps moyen: ${avgTime.toFixed(2)}ms`)
    console.log(`   - Plus rapide: ${minTime}ms`)
    console.log(`   - Plus lent: ${maxTime}ms`)
    console.log(`   - ${iterations} requêtes testées`)
    
    if (avgTime < 2000) {
      console.log('✅ Performance excellente (< 2s)')
    } else if (avgTime < 5000) {
      console.log('⚠️  Performance acceptable (< 5s)')
    } else {
      console.log('❌ Performance lente (> 5s)')
    }
    
    passedTests++
  } catch (error) {
    console.error('❌ Test de performance échoué:', error.message)
    failedTests++
  }
  
  // Test 3: Performance de création de réservations
  console.log('\n📋 Test 3: Performance création de réservations')
  console.log('─'.repeat(50))
  try {
    const times = []
    const iterations = 3
    
    for (let i = 0; i < iterations; i++) {
      const bookingData = {
        firstName: `Test${i}`,
        lastName: 'Performance',
        email: `test.performance${i}@example.com`,
        phone: '0123456789',
        country: 'France',
        date: `2025-11-${25 + i}T00:00:00.000Z`,
        time: '15:00',
        period: 'afternoon',
        firstConsultation: true,
        consultationReason: `Test de performance ${i}`,
        message: 'Test automatique de performance'
      }
      
      const time = await measureTime(async () => {
        const { success } = await makeRequest(`${BASE_URL}/api/bookings`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bookingData)
        })
        if (!success) throw new Error('Request failed')
      })
      times.push(time)
    }
    
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length
    const minTime = Math.min(...times)
    const maxTime = Math.max(...times)
    
    console.log(`✅ Temps moyen: ${avgTime.toFixed(2)}ms`)
    console.log(`   - Plus rapide: ${minTime}ms`)
    console.log(`   - Plus lent: ${maxTime}ms`)
    console.log(`   - ${iterations} réservations créées`)
    
    if (avgTime < 3000) {
      console.log('✅ Performance excellente (< 3s)')
    } else if (avgTime < 8000) {
      console.log('⚠️  Performance acceptable (< 8s)')
    } else {
      console.log('❌ Performance lente (> 8s)')
    }
    
    passedTests++
  } catch (error) {
    console.error('❌ Test de performance échoué:', error.message)
    failedTests++
  }
  
  // Test 4: Test de charge - requêtes simultanées
  console.log('\n📋 Test 4: Test de charge - requêtes simultanées')
  console.log('─'.repeat(50))
  try {
    const concurrentRequests = 5
    const startTime = Date.now()
    
    const promises = Array.from({ length: concurrentRequests }, (_, i) => 
      makeRequest(`${BASE_URL}/api/availability/dates?month=11&year=2025`)
    )
    
    const results = await Promise.all(promises)
    const endTime = Date.now()
    const totalTime = endTime - startTime
    
    const successCount = results.filter(r => r.success).length
    const failureCount = results.filter(r => !r.success).length
    
    console.log(`✅ ${concurrentRequests} requêtes simultanées`)
    console.log(`   - Temps total: ${totalTime}ms`)
    console.log(`   - Temps moyen par requête: ${(totalTime / concurrentRequests).toFixed(2)}ms`)
    console.log(`   - Succès: ${successCount}`)
    console.log(`   - Échecs: ${failureCount}`)
    
    if (successCount === concurrentRequests) {
      console.log('✅ Toutes les requêtes simultanées ont réussi')
    } else {
      console.log('⚠️  Certaines requêtes simultanées ont échoué')
    }
    
    passedTests++
  } catch (error) {
    console.error('❌ Test de charge échoué:', error.message)
    failedTests++
  }
  
  // Test 5: Performance de récupération des réservations
  console.log('\n📋 Test 5: Performance récupération des réservations')
  console.log('─'.repeat(50))
  try {
    const times = []
    const iterations = 3
    
    for (let i = 0; i < iterations; i++) {
      const time = await measureTime(async () => {
        const { success } = await makeRequest(`${BASE_URL}/api/bookings`)
        if (!success) throw new Error('Request failed')
      })
      times.push(time)
    }
    
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length
    const minTime = Math.min(...times)
    const maxTime = Math.max(...times)
    
    console.log(`✅ Temps moyen: ${avgTime.toFixed(2)}ms`)
    console.log(`   - Plus rapide: ${minTime}ms`)
    console.log(`   - Plus lent: ${maxTime}ms`)
    console.log(`   - ${iterations} requêtes testées`)
    
    if (avgTime < 500) {
      console.log('✅ Performance excellente (< 500ms)')
    } else if (avgTime < 1000) {
      console.log('⚠️  Performance acceptable (< 1s)')
    } else {
      console.log('❌ Performance lente (> 1s)')
    }
    
    passedTests++
  } catch (error) {
    console.error('❌ Test de performance échoué:', error.message)
    failedTests++
  }
  
  // Test 6: Test de mémoire et stabilité
  console.log('\n📋 Test 6: Test de stabilité')
  console.log('─'.repeat(50))
  try {
    const iterations = 10
    let successCount = 0
    
    for (let i = 0; i < iterations; i++) {
      const { success } = await makeRequest(`${BASE_URL}/api/availability/dates?month=11&year=2025`)
      if (success) successCount++
      
      // Petite pause entre les requêtes
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    const successRate = (successCount / iterations) * 100
    
    console.log(`✅ ${iterations} requêtes de stabilité`)
    console.log(`   - Taux de succès: ${successRate.toFixed(1)}%`)
    console.log(`   - Succès: ${successCount}`)
    console.log(`   - Échecs: ${iterations - successCount}`)
    
    if (successRate >= 95) {
      console.log('✅ Stabilité excellente (≥ 95%)')
    } else if (successRate >= 90) {
      console.log('⚠️  Stabilité acceptable (≥ 90%)')
    } else {
      console.log('❌ Stabilité insuffisante (< 90%)')
    }
    
    passedTests++
  } catch (error) {
    console.error('❌ Test de stabilité échoué:', error.message)
    failedTests++
  }
  
  // Résumé des tests de performance
  console.log('\n📊 Résumé des tests de performance')
  console.log('═'.repeat(60))
  console.log(`✅ Tests réussis: ${passedTests}`)
  console.log(`❌ Tests échoués: ${failedTests}`)
  console.log(`📈 Taux de réussite: ${Math.round((passedTests / (passedTests + failedTests)) * 100)}%`)
  
  if (failedTests === 0) {
    console.log('\n🎉 Tous les tests de performance sont passés!')
    console.log('✅ Votre application est performante et stable.')
  } else {
    console.log('\n⚠️  Certains tests de performance ont échoué.')
    console.log('🔧 Considérez l\'optimisation des performances.');
  }
  
  console.log('\n📝 Recommandations:')
  console.log('   - Surveillez les temps de réponse en production')
  console.log('   - Utilisez un cache pour les données fréquemment consultées')
  console.log('   - Optimisez les requêtes de base de données si nécessaire')
  console.log('   - Testez régulièrement les performances')
}

// Exécuter les tests de performance
runPerformanceTests().catch(console.error)
