#!/usr/bin/env node

/**
 * Script de test des emails en production
 * Usage: node test-production-email.js
 */

const nodemailer = require('nodemailer')

console.log('🔧 Test des emails en production...\n')

// Charger les variables d'environnement
require('dotenv').config({ path: '.env.production' })

async function testEmailConfiguration() {
  console.log('📋 Configuration détectée:')
  console.log('─'.repeat(50))
  
  const config = {
    host: process.env.SMTP_HOST || process.env.GMAIL_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || process.env.GMAIL_PORT || '587',
    user: process.env.SMTP_USER || process.env.GMAIL_USER,
    password: process.env.SMTP_PASSWORD || process.env.GMAIL_APP_PASSWORD,
    fromName: process.env.SMTP_FROM_NAME || 'Cabinet Médical'
  }
  
  console.log(`✅ Host: ${config.host}`)
  console.log(`✅ Port: ${config.port}`)
  console.log(`✅ User: ${config.user ? '✅ Défini' : '❌ Manquant'}`)
  console.log(`✅ Password: ${config.password ? '✅ Défini' : '❌ Manquant'}`)
  console.log(`✅ From Name: ${config.fromName}`)
  
  if (!config.user || !config.password) {
    console.log('\n❌ Configuration email incomplète!')
    console.log('🔧 Variables manquantes:')
    if (!config.user) console.log('   - SMTP_USER ou GMAIL_USER')
    if (!config.password) console.log('   - SMTP_PASSWORD ou GMAIL_APP_PASSWORD')
    return false
  }
  
  console.log('\n🔧 Test de connexion SMTP...')
  
  try {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: parseInt(config.port),
      secure: false,
      auth: {
        user: config.user,
        pass: config.password,
      },
    })
    
    await transporter.verify()
    console.log('✅ Connexion SMTP réussie!')
    
    console.log('\n📧 Test d\'envoi d\'email...')
    
    const testEmail = {
      from: `"${config.fromName}" <${config.user}>`,
      to: config.user, // Envoyer à soi-même pour le test
      subject: 'Test Email Production - ' + new Date().toISOString(),
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2d5a27;">✅ Test Email Production</h2>
          <p>Cet email confirme que votre configuration email fonctionne en production.</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <p><strong>Configuration:</strong></p>
          <ul>
            <li>Host: ${config.host}</li>
            <li>Port: ${config.port}</li>
            <li>User: ${config.user}</li>
          </ul>
        </div>
      `
    }
    
    const result = await transporter.sendMail(testEmail)
    console.log('✅ Email de test envoyé avec succès!')
    console.log(`✅ Message ID: ${result.messageId}`)
    console.log(`📧 Vérifiez votre boîte email: ${config.user}`)
    
    return true
    
  } catch (error) {
    console.error('❌ Erreur de connexion SMTP:', error.message)
    console.error('🔍 Détails:', error)
    return false
  }
}

async function runProductionTest() {
  console.log('🚀 Test de Production - Système Email\n')
  console.log('═'.repeat(70))
  
  const success = await testEmailConfiguration()
  
  console.log('\n📊 RÉSULTAT DU TEST')
  console.log('═'.repeat(70))
  
  if (success) {
    console.log('✅ CONFIGURATION EMAIL FONCTIONNELLE!')
    console.log('📧 Les emails devraient être envoyés correctement en production.')
    console.log('')
    console.log('🔧 Si les emails ne s\'envoient toujours pas:')
    console.log('   1. Vérifiez les logs de l\'application Vercel')
    console.log('   2. Vérifiez que les variables d\'environnement sont bien définies')
    console.log('   3. Vérifiez les paramètres de sécurité Gmail')
    console.log('   4. Testez avec une réservation réelle')
  } else {
    console.log('❌ CONFIGURATION EMAIL DÉFAILLANTE!')
    console.log('🔧 Actions à effectuer:')
    console.log('   1. Vérifiez les variables d\'environnement dans Vercel')
    console.log('   2. Régénérez le mot de passe d\'application Gmail')
    console.log('   3. Vérifiez que la validation en 2 étapes est activée')
    console.log('   4. Redéployez l\'application après correction')
  }
  
  console.log('\n🎯 PROCHAINES ÉTAPES:')
  console.log('   1. Corrigez la configuration si nécessaire')
  console.log('   2. Redéployez sur Vercel')
  console.log('   3. Testez avec une vraie réservation')
  console.log('   4. Surveillez les logs Vercel')
}

// Exécuter le test
runProductionTest().catch(console.error)
