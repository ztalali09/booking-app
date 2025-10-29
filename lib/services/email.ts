// lib/services/email.ts
import nodemailer from 'nodemailer'

// Fonction utilitaire pour formater l'heure avec plage horaire
const formatTimeRange = (time: string, period: string) => {
  const [hours, minutes] = time.split(':').map(Number)
  const startTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  
  // Calculer l'heure de fin (30 minutes plus tard)
  const endMinutes = minutes + 30
  const endHours = hours + Math.floor(endMinutes / 60)
  const finalMinutes = endMinutes % 60
  const endTime = `${endHours.toString().padStart(2, '0')}:${finalMinutes.toString().padStart(2, '0')}`
  
  return `de ${startTime} à ${endTime}`
}

// Configuration du transporteur Gmail
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true pour 465, false pour autres ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
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
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #2d5a27 0%, #4a7c59 100%); padding: 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 0.5px;">
          RÉSERVATION CONFIRMÉE
        </h1>
        <div style="width: 60px; height: 3px; background-color: #ffffff; margin: 15px auto 0;"></div>
      </div>
      
      <!-- Content -->
      <div style="padding: 40px 30px;">
        <p style="color: #2d3748; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
          Bonjour ${bookingData.firstName} ${bookingData.lastName},
        </p>
        
        <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
          Nous vous confirmons votre rendez-vous médical. Veuillez trouver ci-dessous les détails de votre consultation :
        </p>
        
        <!-- Appointment Details -->
        <div style="background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 25px; margin: 30px 0;">
          <h3 style="color: #2d5a27; font-size: 18px; font-weight: 600; margin: 0 0 20px 0; text-transform: uppercase; letter-spacing: 0.5px;">
            Détails du rendez-vous
          </h3>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #4a5568; font-weight: 600; width: 120px;">Date</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #2d3748;">${formattedDate}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #4a5568; font-weight: 600;">Période</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #2d3748;">${bookingData.period === 'morning' ? 'Matin' : 'Après-midi'}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; color: #4a5568; font-weight: 600;">Heure</td>
              <td style="padding: 12px 0; color: #2d3748; font-weight: 600;">${formatTimeRange(bookingData.time, bookingData.period)}</td>
            </tr>
          </table>
        </div>
        
        <!-- Cancellation Info -->
        <div style="background: #fff5f5; border-left: 4px solid #e53e3e; padding: 20px; margin: 30px 0;">
          <p style="color: #4a5568; font-size: 14px; margin: 0 0 15px 0; font-weight: 600;">
            Annulation
          </p>
          <p style="color: #4a5568; font-size: 14px; margin: 0 0 15px 0;">
            Si vous devez annuler votre rendez-vous, vous pouvez le faire jusqu'à 24h avant en utilisant le lien ci-dessous :
          </p>
          <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/cancel?token=${bookingData.cancellationToken}" 
             style="background: #e53e3e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
            Annuler le rendez-vous
          </a>
        </div>
        
        <!-- Footer -->
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

  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || 'Cabinet Médical'}" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Confirmation de votre rendez-vous médical',
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
    period: string
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
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #c53030 0%, #e53e3e 100%); padding: 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 0.5px;">
          RÉSERVATION ANNULÉE
        </h1>
        <div style="width: 60px; height: 3px; background-color: #ffffff; margin: 15px auto 0;"></div>
      </div>
      
      <!-- Content -->
      <div style="padding: 40px 30px;">
        <p style="color: #2d3748; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
          Bonjour ${bookingData.firstName} ${bookingData.lastName},
        </p>
        
        <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
          Nous vous confirmons l'annulation de votre rendez-vous médical.
        </p>
        
        <!-- Cancelled Appointment Details -->
        <div style="background: #fff5f5; border: 1px solid #fed7d7; border-radius: 8px; padding: 25px; margin: 30px 0;">
          <h3 style="color: #c53030; font-size: 18px; font-weight: 600; margin: 0 0 20px 0; text-transform: uppercase; letter-spacing: 0.5px;">
            Rendez-vous annulé
          </h3>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #fed7d7; color: #4a5568; font-weight: 600; width: 120px;">Date</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #fed7d7; color: #2d3748;">${formattedDate}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #fed7d7; color: #4a5568; font-weight: 600;">Période</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #fed7d7; color: #2d3748;">${bookingData.period === 'morning' ? 'Matin' : 'Après-midi'}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; color: #4a5568; font-weight: 600;">Heure</td>
              <td style="padding: 12px 0; color: #2d3748; font-weight: 600;">${formatTimeRange(bookingData.time, bookingData.period)}</td>
            </tr>
          </table>
        </div>
        
        <!-- New Appointment Info -->
        <div style="background: #f0fff4; border-left: 4px solid #2d5a27; padding: 20px; margin: 30px 0;">
          <p style="color: #4a5568; font-size: 14px; margin: 0 0 15px 0; font-weight: 600;">
            Nouveau rendez-vous
          </p>
          <p style="color: #4a5568; font-size: 14px; margin: 0;">
            Si vous souhaitez prendre un nouveau rendez-vous, n'hésitez pas à nous contacter par téléphone ou à utiliser notre système de réservation en ligne.
          </p>
        </div>
        
        <!-- Footer -->
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

  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || 'Cabinet Médical'}" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Annulation de votre rendez-vous médical',
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
    consultationReason: string
    message?: string
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
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #2d5a27 0%, #4a7c59 100%); padding: 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 0.5px;">
          NOUVELLE RÉSERVATION
        </h1>
        <div style="width: 60px; height: 3px; background-color: #ffffff; margin: 15px auto 0;"></div>
      </div>
      
      <!-- Content -->
      <div style="padding: 40px 30px;">
        <p style="color: #2d3748; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
          Une nouvelle réservation a été effectuée. Veuillez trouver ci-dessous les détails complets :
        </p>
        
        <!-- Patient Information -->
        <div style="background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 25px; margin: 30px 0;">
          <h3 style="color: #2d5a27; font-size: 18px; font-weight: 600; margin: 0 0 20px 0; text-transform: uppercase; letter-spacing: 0.5px;">
            Informations patient
          </h3>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #4a5568; font-weight: 600; width: 140px;">Nom complet</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #2d3748;">${bookingData.firstName} ${bookingData.lastName}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #4a5568; font-weight: 600;">Email</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #2d3748;">${bookingData.email}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #4a5568; font-weight: 600;">Téléphone</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #2d3748;">${bookingData.phone}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; color: #4a5568; font-weight: 600;">Première consultation</td>
              <td style="padding: 12px 0; color: #2d3748; font-weight: 600;">${bookingData.firstConsultation ? 'Oui' : 'Non'}</td>
            </tr>
          </table>
        </div>
        
        <!-- Consultation Reason -->
        <div style="background: #fff8e1; border: 1px solid #ffcc02; border-radius: 8px; padding: 25px; margin: 30px 0;">
          <h3 style="color: #b8860b; font-size: 18px; font-weight: 600; margin: 0 0 20px 0; text-transform: uppercase; letter-spacing: 0.5px;">
            Motif de consultation
          </h3>
          <div style="background: #ffffff; padding: 20px; border-radius: 6px; border-left: 4px solid #ffcc02;">
            <p style="color: #2d3748; font-size: 15px; line-height: 1.6; margin: 0;">
              ${bookingData.consultationReason}
            </p>
          </div>
        </div>
        
        ${bookingData.message ? `
        <!-- Patient Message -->
        <div style="background: #e6fffa; border: 1px solid #38b2ac; border-radius: 8px; padding: 25px; margin: 30px 0;">
          <h3 style="color: #2c7a7b; font-size: 18px; font-weight: 600; margin: 0 0 20px 0; text-transform: uppercase; letter-spacing: 0.5px;">
            Message du patient
          </h3>
          <div style="background: #ffffff; padding: 20px; border-radius: 6px; border-left: 4px solid #38b2ac;">
            <p style="color: #2d3748; font-size: 15px; line-height: 1.6; margin: 0; font-style: italic;">
              "${bookingData.message}"
            </p>
          </div>
        </div>
        ` : ''}
        
        <!-- Appointment Details -->
        <div style="background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 25px; margin: 30px 0;">
          <h3 style="color: #2d5a27; font-size: 18px; font-weight: 600; margin: 0 0 20px 0; text-transform: uppercase; letter-spacing: 0.5px;">
            Détails du rendez-vous
          </h3>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #4a5568; font-weight: 600; width: 120px;">Date</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #2d3748;">${formattedDate}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #4a5568; font-weight: 600;">Période</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #2d3748;">${bookingData.period === 'morning' ? 'Matin' : 'Après-midi'}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; color: #4a5568; font-weight: 600;">Heure</td>
              <td style="padding: 12px 0; color: #2d3748; font-weight: 600;">${formatTimeRange(bookingData.time, bookingData.period)}</td>
            </tr>
          </table>
        </div>
        
        <!-- Calendar Note -->
        <div style="background: #f0fff4; border-left: 4px solid #2d5a27; padding: 20px; margin: 30px 0;">
          <p style="color: #4a5568; font-size: 14px; margin: 0; font-weight: 600;">
            Cette réservation a été automatiquement ajoutée à votre Google Calendar.
          </p>
        </div>
        
        <!-- Doctor Actions -->
        <div style="background: #e6f3ff; border: 1px solid #3182ce; border-radius: 8px; padding: 25px; margin: 30px 0;">
          <h3 style="color: #2c5aa0; font-size: 18px; font-weight: 600; margin: 0 0 20px 0; text-transform: uppercase; letter-spacing: 0.5px;">
            Actions disponibles
          </h3>
          <div style="text-align: center;">
            <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/doctor/cancel?token=${bookingData.cancellationToken}" 
               style="display: inline-block; background: linear-gradient(135deg, #dc2626, #b91c1c); color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 10px;">
              Annuler ce rendez-vous
            </a>
          </div>
          <p style="color: #4a5568; font-size: 14px; margin: 15px 0 0 0; text-align: center;">
            Cliquez sur le bouton ci-dessus pour annuler ce rendez-vous. Le patient sera automatiquement notifié.
          </p>
        </div>
        
        <!-- Footer -->
        <div style="border-top: 1px solid #e2e8f0; padding-top: 25px; margin-top: 30px;">
          <p style="color: #718096; font-size: 14px; margin: 0; font-weight: 600;">
            Système de réservation médicale
          </p>
        </div>
      </div>
    </div>
  `

  const mailOptions = {
    from: `"Système de Réservation" <${process.env.SMTP_USER}>`,
    to: process.env.SMTP_USER, // Email du médecin
    subject: `Nouvelle réservation - ${bookingData.firstName} ${bookingData.lastName}`,
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

// Template pour notification d'annulation au patient (quand le médecin annule)
export const sendPatientCancellationNotification = async (booking: {
  firstName: string
  lastName: string
  email: string
  date: string
  time: string
  period: string
  cancelledBy: 'patient' | 'doctor'
  doctorMessage?: string
}) => {
  const transporter = createTransporter()
  
  if (!transporter) {
    console.log('📧 Notification annulation patient ignorée (configuration manquante)')
    return
  }
  
  const formattedDate = new Date(booking.date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  
  const timeRange = formatTimeRange(booking.time, booking.period)
  const periodText = booking.period === 'morning' ? 'Matin' : 'Après-midi'
  
  const isDoctorCancellation = booking.cancelledBy === 'doctor'
  const subject = isDoctorCancellation 
    ? 'Annulation de votre rendez-vous par le médecin'
    : 'Confirmation d\'annulation de votre rendez-vous'

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, ${isDoctorCancellation ? '#dc2626' : '#059669'}, ${isDoctorCancellation ? '#b91c1c' : '#047857'}); padding: 40px 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">
            ${isDoctorCancellation ? 'Annulation par le médecin' : 'Rendez-vous annulé'}
          </h1>
          <div style="width: 60px; height: 3px; background-color: #ffffff; margin: 15px auto 0;"></div>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px;">
          
          <!-- Greeting -->
          <div style="margin-bottom: 30px;">
            <h2 style="color: #1f2937; margin: 0 0 15px 0; font-size: 24px; font-weight: 600;">
              Bonjour ${booking.firstName} ${booking.lastName},
            </h2>
            <p style="color: #6b7280; margin: 0; font-size: 16px; line-height: 1.6;">
              ${isDoctorCancellation 
                ? 'Nous vous informons que votre rendez-vous médical a été annulé par le médecin.' 
                : 'Nous confirmons l\'annulation de votre rendez-vous médical.'}
            </p>
          </div>

          <!-- Booking Details -->
          <div style="background-color: #f8f9fa; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
            <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 18px; font-weight: 600;">
              Détails du rendez-vous annulé
            </h3>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-weight: 500; width: 30%;">Patient</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #1f2937; font-weight: 600;">${booking.firstName} ${booking.lastName}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-weight: 500;">Date</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #1f2937;">${formattedDate}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-weight: 500;">Période</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #1f2937;">${periodText}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; color: #6b7280; font-weight: 500;">Heure</td>
                <td style="padding: 12px 0; color: #1f2937; font-weight: 600;">${timeRange}</td>
              </tr>
            </table>
          </div>

          ${isDoctorCancellation && booking.doctorMessage ? `
          <!-- Doctor Message -->
          <div style="background-color: #e6f3ff; border: 1px solid #3182ce; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
            <h3 style="color: #2c5aa0; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
              Message du médecin
            </h3>
            <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; border-left: 4px solid #3182ce;">
              <p style="color: #1f2937; margin: 0; font-size: 16px; line-height: 1.6; font-style: italic;">
                "${booking.doctorMessage}"
              </p>
            </div>
          </div>
          ` : ''}

          <!-- Next Steps -->
          <div style="background-color: ${isDoctorCancellation ? '#fef2f2' : '#f0fdf4'}; border: 1px solid ${isDoctorCancellation ? '#fecaca' : '#bbf7d0'}; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
            <h3 style="color: ${isDoctorCancellation ? '#dc2626' : '#059669'}; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
              ${isDoctorCancellation ? 'Prochaines étapes' : 'Que faire maintenant ?'}
            </h3>
            <p style="color: ${isDoctorCancellation ? '#991b1b' : '#166534'}; margin: 0 0 15px 0; font-size: 16px; line-height: 1.6;">
              ${isDoctorCancellation 
                ? 'Le médecin vous contactera prochainement pour reprogrammer votre rendez-vous à un moment plus approprié.'
                : 'Vous pouvez reprendre un nouveau rendez-vous en utilisant le lien ci-dessous.'}
            </p>
            ${!isDoctorCancellation && `
              <div style="text-align: center; margin-top: 20px;">
                <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}" 
                   style="display: inline-block; background: linear-gradient(135deg, #059669, #047857); color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Prendre un nouveau rendez-vous
                </a>
              </div>
            `}
          </div>

          <!-- Contact Info -->
          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px;">
              Pour toute question, n'hésitez pas à nous contacter :
            </p>
            <p style="color: #1f2937; margin: 0; font-size: 14px; font-weight: 500;">
              📧 contact@cabinet-medical.com | 📞 01 23 45 67 89
            </p>
          </div>

        </div>

        <!-- Footer -->
        <div style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; margin: 0; font-size: 12px;">
            Cabinet Médical - Système de gestion des rendez-vous
          </p>
        </div>

      </div>
    </body>
    </html>
  `

  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: booking.email,
      subject: subject,
      html: html,
    })

    console.log(`Email d'annulation patient envoyé à ${booking.email}`)
  } catch (error) {
    console.error('Erreur envoi email annulation patient:', error)
    throw error
  }
}

// Template pour notification d'annulation au médecin
export const sendDoctorCancellationNotification = async (
  bookingData: {
    firstName: string
    lastName: string
    email: string
    phone: string
    date: string
    time: string
    period: string
    consultationReason: string
    message?: string
  }
) => {
  const transporter = createTransporter()
  
  if (!transporter) {
    console.log('📧 Notification annulation médecin ignorée (configuration manquante)')
    return
  }
  
  const formattedDate = new Date(bookingData.date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #c53030 0%, #e53e3e 100%); padding: 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 0.5px;">
          RÉSERVATION ANNULÉE
        </h1>
        <div style="width: 60px; height: 3px; background-color: #ffffff; margin: 15px auto 0;"></div>
      </div>
      
      <!-- Content -->
      <div style="padding: 40px 30px;">
        <p style="color: #2d3748; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
          Une réservation a été annulée par le patient. Veuillez trouver ci-dessous les détails :
        </p>
        
        <!-- Patient Information -->
        <div style="background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 25px; margin: 30px 0;">
          <h3 style="color: #c53030; font-size: 18px; font-weight: 600; margin: 0 0 20px 0; text-transform: uppercase; letter-spacing: 0.5px;">
            Patient ayant annulé
          </h3>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #4a5568; font-weight: 600; width: 140px;">Nom complet</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #2d3748;">${bookingData.firstName} ${bookingData.lastName}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #4a5568; font-weight: 600;">Email</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #2d3748;">${bookingData.email}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; color: #4a5568; font-weight: 600;">Téléphone</td>
              <td style="padding: 12px 0; color: #2d3748;">${bookingData.phone}</td>
            </tr>
          </table>
        </div>
        
        <!-- Cancelled Appointment Details -->
        <div style="background: #fff5f5; border: 1px solid #fed7d7; border-radius: 8px; padding: 25px; margin: 30px 0;">
          <h3 style="color: #c53030; font-size: 18px; font-weight: 600; margin: 0 0 20px 0; text-transform: uppercase; letter-spacing: 0.5px;">
            Rendez-vous annulé
          </h3>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #fed7d7; color: #4a5568; font-weight: 600; width: 120px;">Date</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #fed7d7; color: #2d3748;">${formattedDate}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #fed7d7; color: #4a5568; font-weight: 600;">Période</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #fed7d7; color: #2d3748;">${bookingData.period === 'morning' ? 'Matin' : 'Après-midi'}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; color: #4a5568; font-weight: 600;">Heure</td>
              <td style="padding: 12px 0; color: #2d3748; font-weight: 600;">${formatTimeRange(bookingData.time, bookingData.period)}</td>
            </tr>
          </table>
        </div>
        
        <!-- Consultation Reason -->
        <div style="background: #fff8e1; border: 1px solid #ffcc02; border-radius: 8px; padding: 25px; margin: 30px 0;">
          <h3 style="color: #b8860b; font-size: 18px; font-weight: 600; margin: 0 0 20px 0; text-transform: uppercase; letter-spacing: 0.5px;">
            Motif de consultation
          </h3>
          <div style="background: #ffffff; padding: 20px; border-radius: 6px; border-left: 4px solid #ffcc02;">
            <p style="color: #2d3748; font-size: 15px; line-height: 1.6; margin: 0;">
              ${bookingData.consultationReason}
            </p>
          </div>
        </div>
        
        ${bookingData.message ? `
        <!-- Patient Message -->
        <div style="background: #e6fffa; border: 1px solid #38b2ac; border-radius: 8px; padding: 25px; margin: 30px 0;">
          <h3 style="color: #2c7a7b; font-size: 18px; font-weight: 600; margin: 0 0 20px 0; text-transform: uppercase; letter-spacing: 0.5px;">
            Message du patient
          </h3>
          <div style="background: #ffffff; padding: 20px; border-radius: 6px; border-left: 4px solid #38b2ac;">
            <p style="color: #2d3748; font-size: 15px; line-height: 1.6; margin: 0; font-style: italic;">
              "${bookingData.message}"
            </p>
          </div>
        </div>
        ` : ''}
        
        <!-- Calendar Note -->
        <div style="background: #f0fff4; border-left: 4px solid #2d5a27; padding: 20px; margin: 30px 0;">
          <p style="color: #4a5568; font-size: 14px; margin: 0; font-weight: 600;">
            Cette réservation a été automatiquement supprimée de votre Google Calendar.
          </p>
        </div>
        
        <!-- Footer -->
        <div style="border-top: 1px solid #e2e8f0; padding-top: 25px; margin-top: 30px;">
          <p style="color: #718096; font-size: 14px; margin: 0; font-weight: 600;">
            Système de réservation médicale
          </p>
        </div>
      </div>
    </div>
  `

  const mailOptions = {
    from: `"Système de Réservation" <${process.env.SMTP_USER}>`,
    to: process.env.SMTP_USER, // Email du médecin
    subject: `Annulation de réservation - ${bookingData.firstName} ${bookingData.lastName}`,
    html,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log(`Notification annulation médecin envoyée`)
  } catch (error) {
    console.error('Erreur envoi notification annulation médecin:', error)
    // Ne pas faire échouer l'annulation si l'email échoue
  }
}
