#!/usr/bin/env node

/**
 * Script de test pour vérifier les dates disponibles
 * Teste les mois de décembre et janvier
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

async function testDates() {
  console.log('📅 Test des dates disponibles\n');
  
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  console.log(`Date actuelle: ${currentDate.toLocaleDateString('fr-FR')}`);
  console.log(`Mois actuel: ${currentMonth + 1}/${currentYear}\n`);
  
  const tests = [
    { month: currentMonth, year: currentYear, name: `Mois actuel (${currentMonth + 1}/${currentYear})` },
    { month: currentMonth + 1, year: currentYear, name: `Mois suivant (${currentMonth + 2}/${currentYear})` },
    { month: 11, year: currentYear, name: `Décembre ${currentYear}` },
    { month: 0, year: currentYear + 1, name: `Janvier ${currentYear + 1}` },
  ];
  
  for (const test of tests) {
    console.log(`🔍 Test: ${test.name}`);
    
    try {
      const url = `${BASE_URL}/api/availability/dates?month=${test.month}&year=${test.year}`;
      const result = await makeRequest(url);
      
      if (result.status === 200) {
        const dates = result.data.availableDates || [];
        console.log(`   ✅ ${dates.length} dates disponibles`);
        console.log(`   📊 Dates: [${dates.slice(0, 10).join(', ')}${dates.length > 10 ? '...' : ''}]`);
        console.log(`   ⏱️  ${result.responseTime}ms`);
        
        if (dates.length === 0) {
          console.log('   ⚠️  Aucune date disponible !');
        }
      } else {
        console.log(`   ❌ Erreur HTTP: ${result.status}`);
      }
      
    } catch (error) {
      console.log(`   ❌ Erreur: ${error.message}`);
    }
    
    console.log('');
  }
  
  console.log('💡 Vérifications:');
  console.log('- Décembre devrait avoir des dates si nous sommes avant décembre');
  console.log('- Janvier devrait avoir des dates si nous sommes avant janvier');
  console.log('- Les mois passés ne devraient pas avoir de dates');
  console.log('- Limite de réservation : 3 mois dans le futur');
}

// Exécuter le test
if (require.main === module) {
  testDates().catch(console.error);
}

module.exports = { testDates };
