#!/usr/bin/env node

/**
 * Script de test des emails sur Vercel
 * Usage: node test-vercel-email.js
 */

const nodemailer = require('nodemailer')

console.log('🔧 Test des emails sur Vercel...\n')

async function testVercelEmailConfig() {
  console.log('📋 Configuration Vercel détectée:')
  console.log('─'.repeat(50))
  
  const config = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || '587',
    user: process.env.GMAIL_USER || process.env.SMTP_USER,
    password: process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASSWORD,
    fromName: process.env.SMTP_FROM_NAME || 'Cabinet Médical',
    appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  }
  
  console.log(`✅ Host: ${config.host}`)
  console.log(`✅ Port: ${config.port}`)
  console.log(`✅ User: ${config.user ? '✅ Défini' : '❌ Manquant'}`)
  console.log(`✅ Password: ${config.password ? '✅ Défini' : '❌ Manquant'}`)
  console.log(`✅ From Name: ${config.fromName}`)
  console.log(`✅ App URL: ${config.appUrl}`)
  console.log(`✅ NODE_ENV: ${process.env.NODE_ENV}`)
  
  if (!config.user || !config.password) {
    console.log('\n❌ Configuration email incomplète!')
    console.log('🔧 Variables manquantes sur Vercel:')
    if (!config.user) console.log('   - SMTP_USER ou GMAIL_USER')
    if (!config.password) console.log('   - SMTP_PASSWORD ou GMAIL_APP_PASSWORD')
    console.log('\n📝 Actions à effectuer:')
    console.log('   1. Allez sur https://vercel.com/hahababamama77-gmailcoms-projects/booking-app')
    console.log('   2. Settings → Environment Variables')
    console.log('   3. Ajoutez les variables manquantes')
    console.log('   4. Redéployez l\'application')
    return false
  }
  
  console.log('\n🔧 Test de connexion SMTP...')
  
  try {
    const transporter = nodemailer.createTransporter({
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
      subject: 'Test Email Vercel - ' + new Date().toISOString(),
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2d5a27;">✅ Test Email Vercel</h2>
          <p>Cet email confirme que votre configuration email fonctionne sur Vercel.</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <p><strong>Configuration:</strong></p>
          <ul>
            <li>Host: ${config.host}</li>
            <li>Port: ${config.port}</li>
            <li>User: ${config.user}</li>
            <li>App URL: ${config.appUrl}</li>
            <li>NODE_ENV: ${process.env.NODE_ENV}</li>
          </ul>
          <p><strong>Test de lien:</strong></p>
          <a href="${config.appUrl}/cancel?token=test-token" style="background: #e53e3e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
            Lien d'annulation de test
          </a>
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
    
    if (error.code === 'EAUTH') {
      console.log('\n🔧 Problème d\'authentification Gmail:')
      console.log('   1. Vérifiez que la validation en 2 étapes est activée')
      console.log('   2. Régénérez le mot de passe d\'application')
      console.log('   3. Utilisez le mot de passe d\'application, pas votre mot de passe normal')
    }
    
    return false
  }
}

async function runVercelTest() {
  console.log('🚀 Test Vercel - Système Email\n')
  console.log('═'.repeat(70))
  
  const success = await testVercelEmailConfig()
  
  console.log('\n📊 RÉSULTAT DU TEST')
  console.log('═'.repeat(70))
  
  if (success) {
    console.log('✅ CONFIGURATION EMAIL VERCEL FONCTIONNELLE!')
    console.log('📧 Les emails devraient être envoyés correctement sur Vercel.')
    console.log('')
    console.log('🎯 Prochaines étapes:')
    console.log('   1. Testez avec une vraie réservation')
    console.log('   2. Surveillez les logs Vercel')
    console.log('   3. Vérifiez que les emails arrivent bien')
  } else {
    console.log('❌ CONFIGURATION EMAIL VERCEL DÉFAILLANTE!')
    console.log('🔧 Actions à effectuer:')
    console.log('   1. Configurez les variables d\'environnement sur Vercel')
    console.log('   2. Redéployez l\'application')
    console.log('   3. Relancez ce test')
  }
}

// Exécuter le test
runVercelTest().catch(console.error)
