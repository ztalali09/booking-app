#!/usr/bin/env node

/**
 * Script de test des restrictions Gmail
 * Vérifie les paramètres de sécurité Gmail qui pourraient bloquer l'envoi
 */

const nodemailer = require('nodemailer')

console.log('🔍 Test des restrictions Gmail\n')
console.log('═'.repeat(60))

async function testGmailRestrictions() {
  console.log('📋 Configuration Gmail:')
  console.log('─'.repeat(40))
  
  const config = {
    host: 'smtp.gmail.com',
    port: 587,
    user: 'londalonda620@gmail.com',
    password: 'rmqd arit aukn vkwi',
    fromName: 'M.Cyril Réservation'
  }
  
  console.log(`✅ Host: ${config.host}`)
  console.log(`✅ Port: ${config.port}`)
  console.log(`✅ User: ${config.user}`)
  console.log(`✅ Password: ${config.password ? '✅ Défini' : '❌ Manquant'}`)
  console.log(`✅ From Name: ${config.fromName}`)
  
  console.log('\n🔧 Test de connexion SMTP...')
  
  try {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: false,
      auth: {
        user: config.user,
        pass: config.password,
      },
      connectionTimeout: 10000,
      greetingTimeout: 5000,
      socketTimeout: 10000,
      tls: {
        rejectUnauthorized: false
      },
      pool: false,
      retries: 2,
      retryDelay: 2000
    })
    
    console.log('🔍 Vérification de la connexion SMTP...')
    await transporter.verify()
    console.log('✅ Connexion SMTP réussie!')
    
    console.log('\n📧 Test d\'envoi d\'email simple...')
    
    const testEmail = {
      from: `"${config.fromName}" <${config.user}>`,
      to: config.user,
      subject: 'Test Gmail Restrictions - ' + new Date().toISOString(),
      text: 'Test simple pour vérifier les restrictions Gmail',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2d5a27;">Test Gmail Restrictions</h2>
          <p>Cet email teste les restrictions Gmail.</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <p><strong>Configuration:</strong></p>
          <ul>
            <li>Host: ${config.host}</li>
            <li>Port: ${config.port}</li>
            <li>User: ${config.user}</li>
            <li>From Name: ${config.fromName}</li>
          </ul>
        </div>
      `
    }
    
    console.log('📤 Envoi de l\'email de test...')
    const result = await transporter.sendMail(testEmail)
    
    console.log('✅ Email de test envoyé avec succès!')
    console.log(`✅ Message ID: ${result.messageId}`)
    console.log(`✅ Response: ${result.response}`)
    console.log(`📧 Vérifiez votre boîte email: ${config.user}`)
    
    return true
    
  } catch (error) {
    console.error('❌ Erreur lors du test Gmail:')
    console.error('❌ Message:', error.message)
    console.error('❌ Code:', error.code)
    console.error('❌ Command:', error.command)
    console.error('❌ Response:', error.response)
    
    if (error.code === 'EAUTH') {
      console.log('\n🔧 Problème d\'authentification Gmail:')
      console.log('   1. Vérifiez que la validation en 2 étapes est activée')
      console.log('   2. Régénérez le mot de passe d\'application')
      console.log('   3. Utilisez le mot de passe d\'application, pas votre mot de passe normal')
      console.log('   4. Vérifiez que "Accès moins sécurisé" est désactivé')
    }
    
    if (error.code === 'ECONNECTION') {
      console.log('\n🔧 Problème de connexion:')
      console.log('   1. Vérifiez que le port 587 n\'est pas bloqué')
      console.log('   2. Vérifiez les paramètres de sécurité Gmail')
      console.log('   3. Vérifiez que "Accès moins sécurisé" est désactivé')
    }
    
    if (error.code === 'EMESSAGE') {
      console.log('\n🔧 Problème de message:')
      console.log('   1. Vérifiez le format de l\'email')
      console.log('   2. Vérifiez les restrictions de contenu')
    }
    
    return false
  }
}

async function runGmailTest() {
  console.log('🚀 Test Gmail - Restrictions et Configuration\n')
  console.log('═'.repeat(60))
  
  const success = await testGmailRestrictions()
  
  console.log('\n📊 RÉSULTAT DU TEST GMAIL')
  console.log('═'.repeat(60))
  
  if (success) {
    console.log('✅ CONFIGURATION GMAIL FONCTIONNELLE!')
    console.log('📧 L\'email de test a été envoyé avec succès.')
    console.log('')
    console.log('🎯 Prochaines étapes:')
    console.log('   1. Vérifiez votre boîte email')
    console.log('   2. Si vous ne recevez pas l\'email, vérifiez les spams')
    console.log('   3. Le problème pourrait être dans le code de l\'application')
  } else {
    console.log('❌ PROBLÈME GMAIL DÉTECTÉ!')
    console.log('🔧 Actions à effectuer:')
    console.log('   1. Vérifiez la configuration Gmail')
    console.log('   2. Régénérez le mot de passe d\'application')
    console.log('   3. Vérifiez les paramètres de sécurité')
    console.log('   4. Désactivez "Accès moins sécurisé"')
  }
  
  console.log('\n📋 VÉRIFICATIONS GMAIL RECOMMANDÉES:')
  console.log('   1. Aller sur https://myaccount.google.com/security')
  console.log('   2. Vérifier que "Validation en 2 étapes" est activée')
  console.log('   3. Aller sur "Mots de passe des applications"')
  console.log('   4. Créer un nouveau mot de passe d\'application')
  console.log('   5. Vérifier que "Accès moins sécurisé" est DÉSACTIVÉ')
}

// Exécuter le test
runGmailTest().catch(console.error)
