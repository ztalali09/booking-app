import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Test email simple sur Vercel...')
    
    // Configuration simple comme en local
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    })
    
    console.log('📡 Test de connexion...')
    await transporter.verify()
    console.log('✅ Connexion SMTP réussie!')
    
    console.log('📧 Test d\'envoi...')
    const result = await transporter.sendMail({
      from: `"Test Simple" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      subject: `Test Simple Vercel - ${new Date().toISOString()}`,
      html: `
        <h2>Test Simple Vercel</h2>
        <p>Configuration: Port 587, STARTTLS</p>
        <p>Timestamp: ${new Date().toISOString()}</p>
        <p>NODE_ENV: ${process.env.NODE_ENV}</p>
      `
    })
    
    console.log('✅ Email envoyé!')
    console.log(`Message ID: ${result.messageId}`)
    
    return NextResponse.json({
      success: true,
      message: 'Email envoyé avec succès',
      messageId: result.messageId,
      response: result.response,
      config: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        user: process.env.GMAIL_USER ? '✅ Défini' : '❌ Manquant',
        password: process.env.GMAIL_APP_PASSWORD ? '✅ Défini' : '❌ Manquant',
        nodeEnv: process.env.NODE_ENV
      }
    })
    
  } catch (error) {
    console.error('❌ Erreur test email:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      code: (error as any)?.code,
      command: (error as any)?.command,
      config: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        user: process.env.GMAIL_USER ? '✅ Défini' : '❌ Manquant',
        password: process.env.GMAIL_APP_PASSWORD ? '✅ Défini' : '❌ Manquant',
        nodeEnv: process.env.NODE_ENV
      }
    }, { status: 500 })
  }
}
