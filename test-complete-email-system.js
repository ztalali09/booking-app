#!/usr/bin/env node

/**
 * Test complet du système d'emails
 * Teste tous les types d'emails du système de réservation
 */

const nodemailer = require('nodemailer')

console.log('🧪 Test Complet du Système d\'Emails\n')
console.log('═'.repeat(70))

async function testCompleteEmailSystem() {
  console.log('📋 Configuration du test:')
  console.log('─'.repeat(40))
  
  const config = {
    host: 'smtp.gmail.com',
    port: 587,
    user: 'londalonda620@gmail.com',
    password: 'rmqd arit aukn vkwi',
    fromName: 'M.Cyril Réservation',
    appUrl: 'https://booking-jk1j8vnij-hahababamama77-gmailcoms-projects.vercel.app'
  }
  
  console.log(`✅ Host: ${config.host}`)
  console.log(`✅ Port: ${config.port}`)
  console.log(`✅ User: ${config.user}`)
  console.log(`✅ From Name: ${config.fromName}`)
  console.log(`✅ App URL: ${config.appUrl}`)
  
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
    
    await transporter.verify()
    console.log('✅ Connexion SMTP réussie!')
    
    console.log('\n📧 Test 1: Email de confirmation patient...')
    
    const confirmationEmail = {
      from: `"${config.fromName}" <${config.user}>`,
      to: config.user,
      subject: '🧪 TEST - Confirmation de votre rendez-vous médical',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <div style="background: linear-gradient(135deg, #2d5a27 0%, #4a7c59 100%); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 0.5px;">
              RÉSERVATION CONFIRMÉE
            </h1>
            <div style="width: 60px; height: 3px; background-color: #ffffff; margin: 15px auto 0;"></div>
          </div>
          
          <div style="padding: 40px 30px;">
            <p style="color: #2d3748; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
              Bonjour Test Final,
            </p>
            
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
              Nous vous confirmons votre rendez-vous médical. Veuillez trouver ci-dessous les détails de votre consultation :
            </p>
            
            <div style="background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 25px; margin: 30px 0;">
              <h3 style="color: #2d5a27; font-size: 18px; font-weight: 600; margin: 0 0 20px 0; text-transform: uppercase; letter-spacing: 0.5px;">
                Détails du rendez-vous
              </h3>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #4a5568; font-weight: 600; width: 120px;">Date</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #2d3748;">mercredi 25 décembre 2024</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #4a5568; font-weight: 600;">Période</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #2d3748;">Après-midi</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; color: #4a5568; font-weight: 600;">Heure</td>
                  <td style="padding: 12px 0; color: #2d3748; font-weight: 600;">de 14:00 à 14:30</td>
                </tr>
              </table>
            </div>
            
            <div style="background: #fff5f5; border-left: 4px solid #e53e3e; padding: 20px; margin: 30px 0;">
              <p style="color: #4a5568; font-size: 14px; margin: 0 0 15px 0; font-weight: 600;">
                Annulation
              </p>
              <p style="color: #4a5568; font-size: 14px; margin: 0 0 15px 0;">
                Si vous devez annuler votre rendez-vous, vous pouvez le faire jusqu'à 24h avant en utilisant le lien ci-dessous :
              </p>
              <a href="${config.appUrl}/cancel?token=test-token" 
                 style="background: #e53e3e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                Annuler le rendez-vous
              </a>
            </div>
            
            <div style="border-top: 1px solid #e2e8f0; padding-top: 25px; margin-top: 30px;">
              <p style="color: #718096; font-size: 14px; margin: 0 0 10px 0;">
                Merci de votre confiance.
              </p>
              <p style="color: #718096; font-size: 14px; margin: 0; font-weight: 600;">
                L'équipe médicale
              </p>
            </div>
          </div>
        </div>
      `
    }
    
    const result1 = await transporter.sendMail(confirmationEmail)
    console.log('✅ Email de confirmation envoyé!')
    console.log(`   Message ID: ${result1.messageId}`)
    
    console.log('\n📧 Test 2: Email de notification médecin...')
    
    const doctorEmail = {
      from: `"Système de Réservation" <${config.user}>`,
      to: config.user,
      subject: '🧪 TEST - Nouvelle réservation - Test Final',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <div style="background: linear-gradient(135deg, #2d5a27 0%, #4a7c59 100%); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 0.5px;">
              NOUVELLE RÉSERVATION
            </h1>
            <div style="width: 60px; height: 3px; background-color: #ffffff; margin: 15px auto 0;"></div>
          </div>
          
          <div style="padding: 40px 30px;">
            <p style="color: #2d3748; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
              Une nouvelle réservation a été effectuée. Veuillez trouver ci-dessous les détails complets :
            </p>
            
            <div style="background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 25px; margin: 30px 0;">
              <h3 style="color: #2d5a27; font-size: 18px; font-weight: 600; margin: 0 0 20px 0; text-transform: uppercase; letter-spacing: 0.5px;">
                Informations patient
              </h3>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #4a5568; font-weight: 600; width: 140px;">Nom complet</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #2d3748;">Test Final</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #4a5568; font-weight: 600;">Email</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #2d3748;">londalonda620@gmail.com</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #4a5568; font-weight: 600;">Téléphone</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #2d3748;">0123456789</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; color: #4a5568; font-weight: 600;">Première consultation</td>
                  <td style="padding: 12px 0; color: #2d3748; font-weight: 600;">Non</td>
                </tr>
              </table>
            </div>
            
            <div style="background: #fff8e1; border: 1px solid #ffcc02; border-radius: 8px; padding: 25px; margin: 30px 0;">
              <h3 style="color: #b8860b; font-size: 18px; font-weight: 600; margin: 0 0 20px 0; text-transform: uppercase; letter-spacing: 0.5px;">
                Motif de consultation
              </h3>
              <div style="background: #ffffff; padding: 20px; border-radius: 6px; border-left: 4px solid #ffcc02;">
                <p style="color: #2d3748; font-size: 15px; line-height: 1.6; margin: 0;">
                  Test final du système email après corrections
                </p>
              </div>
            </div>
            
            <div style="background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 25px; margin: 30px 0;">
              <h3 style="color: #2d5a27; font-size: 18px; font-weight: 600; margin: 0 0 20px 0; text-transform: uppercase; letter-spacing: 0.5px;">
                Détails du rendez-vous
              </h3>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #4a5568; font-weight: 600; width: 120px;">Date</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #2d3748;">mercredi 25 décembre 2024</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #4a5568; font-weight: 600;">Période</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #2d3748;">Après-midi</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; color: #4a5568; font-weight: 600;">Heure</td>
                  <td style="padding: 12px 0; color: #2d3748; font-weight: 600;">de 14:00 à 14:30</td>
                </tr>
              </table>
            </div>
            
            <div style="background: #f0fff4; border-left: 4px solid #2d5a27; padding: 20px; margin: 30px 0;">
              <p style="color: #4a5568; font-size: 14px; margin: 0; font-weight: 600;">
                Cette réservation a été automatiquement ajoutée à votre Google Calendar.
              </p>
            </div>
            
            <div style="background: #e6f3ff; border: 1px solid #3182ce; border-radius: 8px; padding: 25px; margin: 30px 0;">
              <h3 style="color: #2c5aa0; font-size: 18px; font-weight: 600; margin: 0 0 20px 0; text-transform: uppercase; letter-spacing: 0.5px;">
                Actions disponibles
              </h3>
              <div style="text-align: center;">
                <a href="${config.appUrl}/doctor/cancel?token=test-token" 
                   style="display: inline-block; background: linear-gradient(135deg, #dc2626, #b91c1c); color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 10px;">
                  Annuler ce rendez-vous
                </a>
              </div>
              <p style="color: #4a5568; font-size: 14px; margin: 15px 0 0 0; text-align: center;">
                Cliquez sur le bouton ci-dessus pour annuler ce rendez-vous. Le patient sera automatiquement notifié.
              </p>
            </div>
            
            <div style="border-top: 1px solid #e2e8f0; padding-top: 25px; margin-top: 30px;">
              <p style="color: #718096; font-size: 14px; margin: 0; font-weight: 600;">
                Système de réservation médicale
              </p>
            </div>
          </div>
        </div>
      `
    }
    
    const result2 = await transporter.sendMail(doctorEmail)
    console.log('✅ Email de notification médecin envoyé!')
    console.log(`   Message ID: ${result2.messageId}`)
    
    console.log('\n📧 Test 3: Email d\'annulation...')
    
    const cancellationEmail = {
      from: `"${config.fromName}" <${config.user}>`,
      to: config.user,
      subject: '🧪 TEST - Annulation de votre rendez-vous médical',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <div style="background: linear-gradient(135deg, #c53030 0%, #e53e3e 100%); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 0.5px;">
              RÉSERVATION ANNULÉE
            </h1>
            <div style="width: 60px; height: 3px; background-color: #ffffff; margin: 15px auto 0;"></div>
          </div>
          
          <div style="padding: 40px 30px;">
            <p style="color: #2d3748; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
              Bonjour Test Final,
            </p>
            
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
              Nous vous confirmons l'annulation de votre rendez-vous médical.
            </p>
            
            <div style="background: #fff5f5; border: 1px solid #fed7d7; border-radius: 8px; padding: 25px; margin: 30px 0;">
              <h3 style="color: #c53030; font-size: 18px; font-weight: 600; margin: 0 0 20px 0; text-transform: uppercase; letter-spacing: 0.5px;">
                Rendez-vous annulé
              </h3>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #fed7d7; color: #4a5568; font-weight: 600; width: 120px;">Date</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #fed7d7; color: #2d3748;">mercredi 25 décembre 2024</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #fed7d7; color: #4a5568; font-weight: 600;">Période</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #fed7d7; color: #2d3748;">Après-midi</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; color: #4a5568; font-weight: 600;">Heure</td>
                  <td style="padding: 12px 0; color: #2d3748; font-weight: 600;">de 14:00 à 14:30</td>
                </tr>
              </table>
            </div>
            
            <div style="background: #f0fff4; border-left: 4px solid #2d5a27; padding: 20px; margin: 30px 0;">
              <p style="color: #4a5568; font-size: 14px; margin: 0 0 15px 0; font-weight: 600;">
                Nouveau rendez-vous
              </p>
              <p style="color: #4a5568; font-size: 14px; margin: 0;">
                Si vous souhaitez prendre un nouveau rendez-vous, n'hésitez pas à nous contacter par téléphone ou à utiliser notre système de réservation en ligne.
              </p>
            </div>
            
            <div style="border-top: 1px solid #e2e8f0; padding-top: 25px; margin-top: 30px;">
              <p style="color: #718096; font-size: 14px; margin: 0 0 10px 0;">
                Merci de votre compréhension.
              </p>
              <p style="color: #718096; font-size: 14px; margin: 0; font-weight: 600;">
                L'équipe médicale
              </p>
            </div>
          </div>
        </div>
      `
    }
    
    const result3 = await transporter.sendMail(cancellationEmail)
    console.log('✅ Email d\'annulation envoyé!')
    console.log(`   Message ID: ${result3.messageId}`)
    
    return true
    
  } catch (error) {
    console.error('❌ Erreur lors du test complet:')
    console.error('❌ Message:', error.message)
    console.error('❌ Code:', error.code)
    return false
  }
}

async function runCompleteTest() {
  console.log('🚀 Test Complet - Système d\'Emails de Réservation\n')
  console.log('═'.repeat(70))
  
  const success = await testCompleteEmailSystem()
  
  console.log('\n📊 RÉSULTAT DU TEST COMPLET')
  console.log('═'.repeat(70))
  
  if (success) {
    console.log('✅ SYSTÈME D\'EMAILS COMPLET FONCTIONNEL!')
    console.log('📧 Tous les types d\'emails ont été envoyés avec succès.')
    console.log('')
    console.log('🎯 Types d\'emails testés:')
    console.log('   1. ✅ Email de confirmation patient')
    console.log('   2. ✅ Email de notification médecin')
    console.log('   3. ✅ Email d\'annulation patient')
    console.log('')
    console.log('📧 Vérifiez votre boîte email: londalonda620@gmail.com')
    console.log('   Vous devriez recevoir 3 emails de test')
  } else {
    console.log('❌ PROBLÈME DÉTECTÉ!')
    console.log('🔧 Actions à effectuer:')
    console.log('   1. Vérifiez la configuration Gmail')
    console.log('   2. Vérifiez les paramètres de sécurité')
  }
}

// Exécuter le test complet
runCompleteTest().catch(console.error)
