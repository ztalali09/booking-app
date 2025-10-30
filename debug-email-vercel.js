#!/usr/bin/env node

/**
 * Script de debug email pour Vercel
 * Teste directement l'envoi d'email avec la configuration Vercel
 */

const nodemailer = require('nodemailer')

console.log('🔍 Debug Email Vercel - Test Direct\n')
console.log('═'.repeat(60))

async function debugEmailVercel() {
  console.log('📋 Configuration Vercel détectée:')
  console.log('─'.repeat(40))
  
  // Configuration exacte comme dans le code
  const smtpUser = process.env.GMAIL_USER || process.env.SMTP_USER
  const smtpPassword = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASSWORD
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com'
  const smtpPort = process.env.SMTP_PORT || '587'
  const fromName = process.env.SMTP_FROM_NAME || 'Cabinet Médical'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  
  console.log(`✅ SMTP_HOST: ${smtpHost}`)
  console.log(`✅ SMTP_PORT: ${smtpPort}`)
  console.log(`✅ GMAIL_USER: ${process.env.GMAIL_USER ? '✅ Défini' : '❌ Manquant'}`)
  console.log(`✅ GMAIL_APP_PASSWORD: ${process.env.GMAIL_APP_PASSWORD ? '✅ Défini' : '❌ Manquant'}`)
  console.log(`✅ SMTP_USER (fallback): ${process.env.SMTP_USER ? '✅ Défini' : '❌ Manquant'}`)
  console.log(`✅ SMTP_PASSWORD (fallback): ${process.env.SMTP_PASSWORD ? '✅ Défini' : '❌ Manquant'}`)
  console.log(`✅ SMTP_FROM_NAME: ${fromName}`)
  console.log(`✅ NEXT_PUBLIC_APP_URL: ${appUrl}`)
  console.log(`✅ NODE_ENV: ${process.env.NODE_ENV}`)
  
  if (!smtpUser || !smtpPassword) {
    console.log('\n❌ Configuration email incomplète!')
    console.log('🔧 Variables manquantes:')
    if (!smtpUser) console.log('   - GMAIL_USER ou SMTP_USER')
    if (!smtpPassword) console.log('   - GMAIL_APP_PASSWORD ou SMTP_PASSWORD')
    return false
  }
  
  console.log('\n🔧 Test de connexion SMTP...')
  
  try {
    // Configuration exacte comme dans createTransporter()
    const transporter = nodemailer.createTransporter({
      host: smtpHost,
      port: parseInt(smtpPort),
      secure: false, // true pour 465, false pour autres ports
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
      // Configuration optimisée pour Vercel
      connectionTimeout: 5000,  // 5 secondes
      greetingTimeout: 3000,    // 3 secondes
      socketTimeout: 5000,      // 5 secondes
      // Configuration TLS standard
      tls: {
        rejectUnauthorized: false
      },
      // Désactiver le pool pour éviter les blocages
      pool: false,
      // Configuration de retry
      retries: 1,
      retryDelay: 1000
    })
    
    console.log('🔍 Vérification de la connexion SMTP...')
    await transporter.verify()
    console.log('✅ Connexion SMTP réussie!')
    
    console.log('\n📧 Test d\'envoi d\'email de debug...')
    
    const testEmail = {
      from: `"${fromName}" <${smtpUser}>`,
      to: smtpUser, // Envoyer à soi-même pour le test
      subject: `🔍 Debug Email Vercel - ${new Date().toISOString()}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <div style="background: linear-gradient(135deg, #2d5a27 0%, #4a7c59 100%); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">
              🔍 DEBUG EMAIL VERCEL
            </h1>
            <div style="width: 60px; height: 3px; background-color: #ffffff; margin: 15px auto 0;"></div>
          </div>
          
          <div style="padding: 40px 30px;">
            <p style="color: #2d3748; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
              Cet email confirme que votre configuration email fonctionne sur Vercel.
            </p>
            
            <div style="background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 25px; margin: 30px 0;">
              <h3 style="color: #2d5a27; font-size: 18px; font-weight: 600; margin: 0 0 20px 0;">
                Configuration utilisée
              </h3>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #4a5568; font-weight: 600; width: 140px;">Host</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #2d3748;">${smtpHost}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #4a5568; font-weight: 600;">Port</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #2d3748;">${smtpPort}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #4a5568; font-weight: 600;">User</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #2d3748;">${smtpUser}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #4a5568; font-weight: 600;">App URL</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #2d3748;">${appUrl}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; color: #4a5568; font-weight: 600;">NODE_ENV</td>
                  <td style="padding: 12px 0; color: #2d3748;">${process.env.NODE_ENV || 'undefined'}</td>
                </tr>
              </table>
            </div>
            
            <div style="background: #e6f3ff; border-left: 4px solid #3182ce; padding: 20px; margin: 30px 0;">
              <p style="color: #4a5568; font-size: 14px; margin: 0; font-weight: 600;">
                ✅ Si vous recevez cet email, votre configuration Vercel fonctionne !
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${appUrl}" 
                 style="background: #2d5a27; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">
                Tester l'application
              </a>
            </div>
          </div>
        </div>
      `
    }
    
    console.log('📤 Envoi de l\'email de debug...')
    const result = await transporter.sendMail(testEmail)
    
    console.log('✅ Email de debug envoyé avec succès!')
    console.log(`✅ Message ID: ${result.messageId}`)
    console.log(`✅ Response: ${result.response}`)
    console.log(`📧 Vérifiez votre boîte email: ${smtpUser}`)
    
    return true
    
  } catch (error) {
    console.error('❌ Erreur lors du test email:')
    console.error('❌ Message:', error.message)
    console.error('❌ Code:', error.code)
    console.error('❌ Command:', error.command)
    console.error('❌ Response:', error.response)
    
    if (error.code === 'EAUTH') {
      console.log('\n🔧 Problème d\'authentification Gmail:')
      console.log('   1. Vérifiez que la validation en 2 étapes est activée')
      console.log('   2. Régénérez le mot de passe d\'application')
      console.log('   3. Utilisez le mot de passe d\'application, pas votre mot de passe normal')
    }
    
    if (error.code === 'ECONNECTION') {
      console.log('\n🔧 Problème de connexion:')
      console.log('   1. Vérifiez que le port 587 n\'est pas bloqué')
      console.log('   2. Vérifiez les paramètres de sécurité Gmail')
    }
    
    return false
  }
}

async function runDebug() {
  console.log('🚀 Debug Email Vercel - Test Complet\n')
  console.log('═'.repeat(60))
  
  const success = await debugEmailVercel()
  
  console.log('\n📊 RÉSULTAT DU DEBUG')
  console.log('═'.repeat(60))
  
  if (success) {
    console.log('✅ CONFIGURATION EMAIL VERCEL FONCTIONNELLE!')
    console.log('📧 L\'email de debug a été envoyé avec succès.')
    console.log('')
    console.log('🎯 Prochaines étapes:')
    console.log('   1. Vérifiez votre boîte email')
    console.log('   2. Si vous ne recevez pas l\'email, vérifiez les spams')
    console.log('   3. Testez avec une vraie réservation')
  } else {
    console.log('❌ PROBLÈME DÉTECTÉ!')
    console.log('🔧 Actions à effectuer:')
    console.log('   1. Vérifiez la configuration Gmail')
    console.log('   2. Régénérez le mot de passe d\'application')
    console.log('   3. Vérifiez les paramètres de sécurité')
  }
}

// Exécuter le debug
runDebug().catch(console.error)
