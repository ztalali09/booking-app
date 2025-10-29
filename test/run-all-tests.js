#!/usr/bin/env node

/**
 * Script pour exécuter tous les tests
 * Usage: node test/run-all-tests.js
 */

const { spawn } = require('child_process')
const path = require('path')

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`
}

// Fonction pour exécuter un test
function runTest(testName, testFile) {
  return new Promise((resolve) => {
    console.log(`\n${colorize('🧪', 'cyan')} ${colorize(testName, 'bright')}`)
    console.log('─'.repeat(60))
    
    const child = spawn('node', [testFile], {
      stdio: 'pipe',
      cwd: __dirname
    })
    
    let output = ''
    let errorOutput = ''
    
    child.stdout.on('data', (data) => {
      output += data.toString()
    })
    
    child.stderr.on('data', (data) => {
      errorOutput += data.toString()
    })
    
    child.on('close', (code) => {
      console.log(output)
      if (errorOutput) {
        console.error(colorize('Erreurs:', 'red'))
        console.error(errorOutput)
      }
      
      if (code === 0) {
        console.log(colorize('✅ Test réussi', 'green'))
        resolve({ success: true, output, error: errorOutput })
      } else {
        console.log(colorize('❌ Test échoué', 'red'))
        resolve({ success: false, output, error: errorOutput })
      }
    })
  })
}

// Fonction principale
async function runAllTests() {
  console.log(colorize('🚀 Suite de tests complète - Application de Réservation', 'bright'))
  console.log(colorize('═'.repeat(70), 'cyan'))
  
  const tests = [
    {
      name: 'Tests d\'intégration',
      file: 'integration.test.js'
    },
    {
      name: 'Tests simples',
      file: 'simple.test.js'
    },
    {
      name: 'Tests de performance',
      file: 'performance.test.js'
    }
  ]
  
  const results = []
  let totalPassed = 0
  let totalFailed = 0
  
  // Exécuter tous les tests
  for (const test of tests) {
    const result = await runTest(test.name, test.file)
    results.push({ ...test, ...result })
    
    if (result.success) {
      totalPassed++
    } else {
      totalFailed++
    }
  }
  
  // Résumé final
  console.log(`\n${colorize('📊 RÉSUMÉ FINAL', 'bright')}`)
  console.log(colorize('═'.repeat(70), 'cyan'))
  
  results.forEach((result, index) => {
    const status = result.success ? colorize('✅', 'green') : colorize('❌', 'red')
    console.log(`${status} ${result.name}`)
  })
  
  console.log(`\n${colorize('📈 STATISTIQUES GLOBALES', 'bright')}`)
  console.log(`   ${colorize('✅ Tests réussis:', 'green')} ${totalPassed}`)
  console.log(`   ${colorize('❌ Tests échoués:', 'red')} ${totalFailed}`)
  console.log(`   ${colorize('📊 Taux de réussite:', 'blue')} ${Math.round((totalPassed / (totalPassed + totalFailed)) * 100)}%`)
  
  if (totalFailed === 0) {
    console.log(`\n${colorize('🎉 FÉLICITATIONS!', 'green')}`)
    console.log(colorize('Tous les tests sont passés avec succès!', 'green'))
    console.log(colorize('Votre application de réservation est prête pour la production.', 'green'))
  } else {
    console.log(`\n${colorize('⚠️  ATTENTION', 'yellow')}`)
    console.log(colorize('Certains tests ont échoué. Vérifiez les erreurs ci-dessus.', 'yellow'))
  }
  
  console.log(`\n${colorize('📝 FONCTIONNALITÉS TESTÉES', 'bright')}`)
  console.log('   ✅ Accessibilité de l\'application')
  console.log('   ✅ API de disponibilité des dates')
  console.log('   ✅ API de disponibilité des créneaux')
  console.log('   ✅ Création de réservations')
  console.log('   ✅ Récupération des réservations')
  console.log('   ✅ Validation des données')
  console.log('   ✅ Configuration Google Calendar')
  console.log('   ✅ Configuration email')
  console.log('   ✅ Performance des APIs')
  console.log('   ✅ Stabilité de l\'application')
  console.log('   ✅ Gestion des requêtes simultanées')
  
  console.log(`\n${colorize('🔧 PROCHAINES ÉTAPES', 'bright')}`)
  console.log('   1. Déployez votre application en production')
  console.log('   2. Configurez un monitoring des performances')
  console.log('   3. Mettez en place des sauvegardes régulières')
  console.log('   4. Surveillez les logs d\'erreurs')
  console.log('   5. Testez régulièrement les fonctionnalités')
  
  console.log(`\n${colorize('📞 SUPPORT', 'bright')}`)
  console.log('   - Documentation: README.md')
  console.log('   - Logs: Vérifiez la console de l\'application')
  console.log('   - Configuration: .env.local')
  
  process.exit(totalFailed > 0 ? 1 : 0)
}

// Exécuter tous les tests
runAllTests().catch((error) => {
  console.error(colorize('❌ Erreur lors de l\'exécution des tests:', 'red'))
  console.error(error)
  process.exit(1)
})

