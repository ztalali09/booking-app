// lib/services/email.ts
import nodemailer from 'nodemailer'

// Configuration du transporteur Gmail
const createTransporter = () => {
  return nodemailer.default?.createTransporter ? nodemailer.default.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD, // Mot de passe d'application Gmail
    },
  })
}

// Template pour confirmation de réservation
export const sendBookingConfirmation = async (
  email: string,
  bookingData: {
    firstName: string
    lastName: string
    date: string
    time: string
    period: string
    cancellationToken: string
  }
) => {
  const transporter = createTransporter()
  
  const formattedDate = new Date(bookingData.date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">✅ Réservation confirmée</h2>
      
      <p>Bonjour ${bookingData.firstName} ${bookingData.lastName},</p>
      
      <p>Votre rendez-vous a été confirmé :</p>
      
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>📅 Date :</strong> ${formattedDate}</p>
        <p><strong>🕐 Heure :</strong> ${bookingData.time}</p>
        <p><strong>🌅 Période :</strong> ${bookingData.period === 'morning' ? 'Matin' : 'Après-midi'}</p>
      </div>
      
      <p>Si vous devez annuler votre rendez-vous, vous pouvez le faire jusqu'à 24h avant en cliquant sur le lien ci-dessous :</p>
      
      <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/cancel?token=${bookingData.cancellationToken}" 
         style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
        Annuler le rendez-vous
      </a>
      
      <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
        Merci de votre confiance !<br>
        L'équipe médicale
      </p>
    </div>
  `

  const mailOptions = {
    from: `"Cabinet Médical" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: '✅ Confirmation de votre rendez-vous',
    html,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log(`Email de confirmation envoyé à ${email}`)
  } catch (error) {
    console.error('Erreur envoi email:', error)
    throw new Error('Impossible d\'envoyer l\'email de confirmation')
  }
}

// Template pour annulation
export const sendBookingCancellation = async (
  email: string,
  bookingData: {
    firstName: string
    lastName: string
    date: string
    time: string
  }
) => {
  const transporter = createTransporter()
  
  const formattedDate = new Date(bookingData.date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">❌ Réservation annulée</h2>
      
      <p>Bonjour ${bookingData.firstName} ${bookingData.lastName},</p>
      
      <p>Votre rendez-vous du <strong>${formattedDate}</strong> à <strong>${bookingData.time}</strong> a été annulé.</p>
      
      <p>Si vous souhaitez prendre un nouveau rendez-vous, n'hésitez pas à nous contacter.</p>
      
      <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
        Merci de votre compréhension.<br>
        L'équipe médicale
      </p>
    </div>
  `

  const mailOptions = {
    from: `"Cabinet Médical" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: '❌ Annulation de votre rendez-vous',
    html,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log(`Email d'annulation envoyé à ${email}`)
  } catch (error) {
    console.error('Erreur envoi email:', error)
    throw new Error('Impossible d\'envoyer l\'email d\'annulation')
  }
}

// Template pour notification au médecin
export const sendDoctorNotification = async (
  bookingData: {
    firstName: string
    lastName: string
    email: string
    phone: string
    date: string
    time: string
    period: string
    firstConsultation: boolean
    message?: string
  }
) => {
  const transporter = createTransporter()
  
  const formattedDate = new Date(bookingData.date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #059669;">🆕 Nouvelle réservation</h2>
      
      <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Informations patient :</h3>
        <p><strong>Nom :</strong> ${bookingData.firstName} ${bookingData.lastName}</p>
        <p><strong>Email :</strong> ${bookingData.email}</p>
        <p><strong>Téléphone :</strong> ${bookingData.phone}</p>
        <p><strong>Première consultation :</strong> ${bookingData.firstConsultation ? 'Oui' : 'Non'}</p>
        ${bookingData.message ? `<p><strong>Message :</strong> ${bookingData.message}</p>` : ''}
      </div>
      
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Détails du rendez-vous :</h3>
        <p><strong>📅 Date :</strong> ${formattedDate}</p>
        <p><strong>🕐 Heure :</strong> ${bookingData.time}</p>
        <p><strong>🌅 Période :</strong> ${bookingData.period === 'morning' ? 'Matin' : 'Après-midi'}</p>
      </div>
      
      <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
        Cette réservation a été ajoutée à votre Google Calendar automatiquement.
      </p>
    </div>
  `

  const mailOptions = {
    from: `"Système de Réservation" <${process.env.GMAIL_USER}>`,
    to: process.env.GMAIL_USER, // Email du médecin
    subject: `🆕 Nouvelle réservation - ${bookingData.firstName} ${bookingData.lastName}`,
    html,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log(`Notification médecin envoyée`)
  } catch (error) {
    console.error('Erreur envoi notification médecin:', error)
    // Ne pas faire échouer la réservation si l'email échoue
  }
}
