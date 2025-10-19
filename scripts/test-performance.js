#!/usr/bin/env node

/**
 * Script de test de performance pour l'API des dates
 * Teste les temps de réponse et l'efficacité du cache
 */

const https = require('https');
const http = require('http');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        try {
          const jsonData = JSON.parse(data);
          resolve({
            responseTime,
            data: jsonData,
            status: res.statusCode
          });
        } catch (error) {
          reject(new Error(`Erreur parsing JSON: ${error.message}`));
        }
      });
    }).on('error', reject);
  });
}

async function testPerformance() {
  console.log('🚀 Test de performance de l\'API des dates\n');
  
  const tests = [
    { month: 0, year: 2024, name: 'Janvier 2024' },
    { month: 1, year: 2024, name: 'Février 2024' },
    { month: 2, year: 2024, name: 'Mars 2024' },
    { month: 0, year: 2024, name: 'Janvier 2024 (cache)' }, // Test du cache
  ];
  
  const results = [];
  
  for (const test of tests) {
    console.log(`📅 Test: ${test.name}`);
    
    try {
      const url = `${BASE_URL}/api/availability/dates?month=${test.month}&year=${test.year}`;
      const result = await makeRequest(url);
      
      results.push({
        ...test,
        responseTime: result.responseTime,
        status: result.status,
        cached: result.data.cached || false,
        datesCount: result.data.availableDates?.length || 0
      });
      
      console.log(`   ✅ ${result.responseTime}ms - ${result.data.availableDates?.length || 0} dates disponibles`);
      if (result.data.cached) {
        console.log('   🚀 Chargé depuis le cache !');
      }
      
    } catch (error) {
      console.log(`   ❌ Erreur: ${error.message}`);
      results.push({
        ...test,
        responseTime: -1,
        status: 'error',
        error: error.message
      });
    }
    
    // Pause entre les tests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Résumé des performances
  console.log('\n📊 Résumé des performances:');
  console.log('='.repeat(50));
  
  const successfulTests = results.filter(r => r.responseTime > 0);
  const cacheTests = results.filter(r => r.cached);
  
  if (successfulTests.length > 0) {
    const avgTime = successfulTests.reduce((sum, r) => sum + r.responseTime, 0) / successfulTests.length;
    const minTime = Math.min(...successfulTests.map(r => r.responseTime));
    const maxTime = Math.max(...successfulTests.map(r => r.responseTime));
    
    console.log(`⏱️  Temps moyen: ${Math.round(avgTime)}ms`);
    console.log(`⚡ Temps minimum: ${minTime}ms`);
    console.log(`🐌 Temps maximum: ${maxTime}ms`);
    
    if (cacheTests.length > 0) {
      const cacheAvgTime = cacheTests.reduce((sum, r) => sum + r.responseTime, 0) / cacheTests.length;
      console.log(`🚀 Temps moyen (cache): ${Math.round(cacheAvgTime)}ms`);
    }
  }
  
  // Recommandations
  console.log('\n💡 Recommandations:');
  if (successfulTests.some(r => r.responseTime > 1000)) {
    console.log('⚠️  Certaines requêtes sont lentes (>1s). Vérifiez la base de données.');
  } else if (successfulTests.some(r => r.responseTime > 500)) {
    console.log('⚡ Performance acceptable, mais peut être améliorée.');
  } else {
    console.log('🎉 Excellente performance !');
  }
  
  if (cacheTests.length === 0) {
    console.log('💾 Le cache ne semble pas fonctionner. Vérifiez la configuration.');
  }
}

// Exécuter le test
if (require.main === module) {
  testPerformance().catch(console.error);
}

module.exports = { testPerformance };
