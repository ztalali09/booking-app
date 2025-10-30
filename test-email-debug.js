#!/usr/bin/env node

/**
 * Script de diagnostic email pour comparer local vs production
 */

const nodemailer = require('nodemailer')

console.log('🔍 Diagnostic Email Local vs Production\n')
console.log('═'.repeat(60))

async function testEmailConfig() {
  const configs = [
    {
      name: 'Configuration Production (465/TLS)',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
      connectionTimeout: 20000,
      greetingTimeout: 10000,
      socketTimeout: 20000,
      family: 4,
      tls: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: false,
      },
      pool: false,
    },
    {
      name: 'Configuration Local (587/STARTTLS)',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
      connectionTimeout: 20000,
      greetingTimeout: 10000,
      socketTimeout: 20000,
      requireTLS: true,
      family: 4,
      tls: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: false,
      },
      pool: false,
    }
  ]

  for (const config of configs) {
    console.log(`\n🧪 Test: ${config.name}`)
    console.log('─'.repeat(40))
    
    try {
      const transporter = nodemailer.createTransport(config)
      
      console.log('📡 Test de connexion...')
      await transporter.verify()
      console.log('✅ Connexion SMTP réussie!')
      
      console.log('📧 Test d\'envoi...')
      const result = await transporter.sendMail({
        from: `"Test" <${config.auth.user}>`,
        to: config.auth.user,
        subject: `Test ${config.name} - ${new Date().toISOString()}`,
        html: `
          <h2>Test ${config.name}</h2>
          <p>Port: ${config.port}</p>
          <p>Secure: ${config.secure}</p>
          <p>Timestamp: ${new Date().toISOString()}</p>
        `
      })
      
      console.log('✅ Email envoyé!')
      console.log(`   Message ID: ${result.messageId}`)
      console.log(`   Response: ${result.response}`)
      
    } catch (error) {
      console.error('❌ Erreur:', error.message)
      console.error('   Code:', error.code)
      console.error('   Command:', error.command)
    }
  }
}

async function main() {
  console.log('📋 Variables d\'environnement:')
  console.log(`   GMAIL_USER: ${process.env.GMAIL_USER ? '✅ Défini' : '❌ Manquant'}`)
  console.log(`   GMAIL_APP_PASSWORD: ${process.env.GMAIL_APP_PASSWORD ? '✅ Défini' : '❌ Manquant'}`)
  console.log(`   NODE_ENV: ${process.env.NODE_ENV}`)
  
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.log('\n❌ Variables d\'environnement manquantes!')
    console.log('   Créez un fichier .env.local avec:')
    console.log('   GMAIL_USER=votre-email@gmail.com')
    console.log('   GMAIL_APP_PASSWORD=votre-mot-de-passe-application')
    return
  }
  
  await testEmailConfig()
  
  console.log('\n📊 RÉSUMÉ')
  console.log('═'.repeat(60))
  console.log('Si les deux configurations fonctionnent en local mais pas en production:')
  console.log('1. Vérifiez les variables d\'environnement sur Vercel')
  console.log('2. Vérifiez que le port 465 est autorisé')
  console.log('3. Ajoutez EMAIL_DEBUG=true pour plus de logs')
}

main().catch(console.error)
