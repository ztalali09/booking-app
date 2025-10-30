// app/api/test-email/route.ts
// Endpoint de test pour vérifier la configuration email sur Vercel

import { NextRequest, NextResponse } from 'next/server'
import { createTransporter } from '@/lib/services/email'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Test de configuration email sur Vercel...')
    
    // Vérifier les variables d'environnement (priorité GMAIL comme en local)
    const config = {
      smtpUser: process.env.GMAIL_USER || process.env.SMTP_USER,
      smtpPassword: process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASSWORD,
      smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
      smtpPort: process.env.SMTP_PORT || '587',
      fromName: process.env.SMTP_FROM_NAME || 'Cabinet Médical',
      appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      nodeEnv: process.env.NODE_ENV
    }
    
    console.log('📋 Configuration détectée:')
    console.log('  - GMAIL_USER:', process.env.GMAIL_USER ? '✅ Défini' : '❌ Manquant')
    console.log('  - GMAIL_APP_PASSWORD:', process.env.GMAIL_APP_PASSWORD ? '✅ Défini' : '❌ Manquant')
    console.log('  - SMTP_USER (fallback):', process.env.SMTP_USER ? '✅ Défini' : '❌ Manquant')
    console.log('  - SMTP_PASSWORD (fallback):', process.env.SMTP_PASSWORD ? '✅ Défini' : '❌ Manquant')
    console.log('  - NODE_ENV:', config.nodeEnv)
    console.log('  - APP_URL:', config.appUrl)
    
    if (!config.smtpUser || !config.smtpPassword) {
      return NextResponse.json({
        success: false,
        error: 'Configuration email manquante',
        details: {
          smtpUser: !!config.smtpUser,
          gmailUser: !!process.env.GMAIL_USER,
          smtpPassword: !!config.smtpPassword,
          gmailAppPassword: !!process.env.GMAIL_APP_PASSWORD,
          nodeEnv: config.nodeEnv,
          appUrl: config.appUrl
        },
        instructions: [
          '1. Allez sur https://vercel.com/hahababamama77-gmailcoms-projects/booking-app',
          '2. Settings → Environment Variables',
          '3. Ajoutez SMTP_USER et SMTP_PASSWORD',
          '4. Redéployez l\'application'
        ]
      }, { status: 500 })
    }
    
    // Tester la connexion SMTP
    console.log('🔧 Test de connexion SMTP...')
    const transporter = createTransporter()
    await transporter.verify()
    console.log('✅ Connexion SMTP réussie!')
    
    // Envoyer un email de test
    console.log('📧 Envoi d\'email de test...')
    const testEmail = {
      from: `"${config.fromName}" <${config.smtpUser}>`,
      to: config.smtpUser, // Envoyer à soi-même
      subject: `Test Email Vercel - ${new Date().toISOString()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2d5a27;">✅ Test Email Vercel</h2>
          <p>Cet email confirme que votre configuration email fonctionne sur Vercel.</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <p><strong>Configuration:</strong></p>
          <ul>
            <li>Host: ${config.smtpHost}</li>
            <li>Port: ${config.smtpPort}</li>
            <li>User: ${config.smtpUser}</li>
            <li>App URL: ${config.appUrl}</li>
            <li>NODE_ENV: ${config.nodeEnv}</li>
          </ul>
          <p><strong>Test de lien:</strong></p>
          <a href="${config.appUrl}/cancel?token=test-token" style="background: #e53e3e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
            Lien d'annulation de test
          </a>
        </div>
      `
    }
    
    const result = await transporter.sendMail(testEmail)
    console.log('✅ Email de test envoyé!')
    console.log(`✅ Message ID: ${result.messageId}`)
    
    return NextResponse.json({
      success: true,
      message: 'Configuration email fonctionnelle sur Vercel',
      details: {
        messageId: result.messageId,
        config: {
          host: config.smtpHost,
          port: config.smtpPort,
          user: config.smtpUser,
          fromName: config.fromName,
          appUrl: config.appUrl,
          nodeEnv: config.nodeEnv
        }
      },
      instructions: [
        '✅ Configuration email fonctionnelle!',
        '📧 Vérifiez votre boîte email pour le test',
        '🎯 Vous pouvez maintenant tester avec une vraie réservation'
      ]
    })
    
  } catch (error) {
    console.error('❌ Erreur test email Vercel:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Erreur lors du test email',
      details: {
        message: error instanceof Error ? error.message : String(error),
        code: (error as any)?.code,
        nodeEnv: process.env.NODE_ENV
      },
      troubleshooting: [
        '1. Vérifiez les variables d\'environnement sur Vercel',
        '2. Vérifiez que la validation en 2 étapes Gmail est activée',
        '3. Utilisez un mot de passe d\'application Gmail',
        '4. Redéployez l\'application après correction'
      ]
    }, { status: 500 })
  }
}
