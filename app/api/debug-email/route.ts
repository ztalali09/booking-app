// app/api/debug-email/route.ts
// Endpoint de debug pour tester l'envoi d'email sur Vercel

import { NextRequest, NextResponse } from 'next/server'
import { createTransporter } from '@/lib/services/email'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug Email Vercel - Test Direct')
    console.log('═'.repeat(60))
    
    // Configuration exacte comme dans le code
    const smtpUser = process.env.GMAIL_USER || process.env.SMTP_USER
    const smtpPassword = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASSWORD
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com'
    const smtpPort = process.env.SMTP_PORT || '587'
    const fromName = process.env.SMTP_FROM_NAME || 'Cabinet Médical'
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    
    console.log('📋 Configuration Vercel détectée:')
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
      return NextResponse.json({
        success: false,
        error: 'Configuration email incomplète',
        details: {
          gmailUser: !!process.env.GMAIL_USER,
          gmailAppPassword: !!process.env.GMAIL_APP_PASSWORD,
          smtpUser: !!process.env.SMTP_USER,
          smtpPassword: !!process.env.SMTP_PASSWORD,
          smtpHost,
          smtpPort,
          fromName,
          appUrl,
          nodeEnv: process.env.NODE_ENV
        }
      }, { status: 500 })
    }
    
    console.log('\n🔧 Test de connexion SMTP...')
    
    try {
      const transporter = createTransporter()
      
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
      
      return NextResponse.json({
        success: true,
        message: 'Email de debug envoyé avec succès',
        details: {
          messageId: result.messageId,
          response: result.response,
          configuration: {
            smtpHost,
            smtpPort,
            smtpUser,
            fromName,
            appUrl,
            nodeEnv: process.env.NODE_ENV
          }
        }
      })
      
    } catch (error) {
      console.error('❌ Erreur lors du test email:')
      console.error('❌ Message:', error instanceof Error ? error.message : String(error))
      console.error('❌ Code:', (error as any)?.code)
      console.error('❌ Command:', (error as any)?.command)
      console.error('❌ Response:', (error as any)?.response)
      
      return NextResponse.json({
        success: false,
        error: 'Erreur lors de l\'envoi de l\'email',
        details: {
          message: error instanceof Error ? error.message : String(error),
          code: (error as any)?.code,
          command: (error as any)?.command,
          response: (error as any)?.response,
          configuration: {
            smtpHost,
            smtpPort,
            smtpUser: !!smtpUser,
            smtpPassword: !!smtpPassword,
            fromName,
            appUrl,
            nodeEnv: process.env.NODE_ENV
          }
        }
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur générale',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
