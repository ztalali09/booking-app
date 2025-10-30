// lib/services/reminder.js
// Système de rappel par email 24h avant le rendez-vous (version JavaScript)

const { PrismaClient } = require('@prisma/client')
const { createTransporter } = require('./email')

const prisma = new PrismaClient()

// Fonction pour formater l'heure
const formatTimeRange = (time, period) => {
  const [hours, minutes] = time.split(':').map(Number)
  const startTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  
  const endMinutes = minutes
  const endHours = hours + 1
  const finalMinutes = endMinutes % 60
  const endTime = `${endHours.toString().padStart(2, '0')}:${finalMinutes.toString().padStart(2, '0')}`
  
  return `de ${startTime} à ${endTime}`
}

// Template email de rappel
const sendReminderEmail = async (booking) => {
  const transporter = createTransporter()
  
  if (!transporter) {
    console.log('📧 Rappel ignoré (configuration email manquante)')
    return
  }
  
  const formattedDate = booking.date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  
  const timeRange = formatTimeRange(booking.time, booking.period)
  const periodText = booking.period === 'morning' ? 'Matin' : 'Après-midi'
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Rappel de votre rendez-vous médical</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 40px 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">
            Rappel de rendez-vous
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
              Nous vous rappelons que vous avez un rendez-vous médical demain.
            </p>
          </div>

          <!-- Appointment Details -->
          <div style="background-color: #f8f9fa; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
            <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 18px; font-weight: 600;">
              Détails de votre rendez-vous
            </h3>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-weight: 500; width: 30%;">Date</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #1f2937; font-weight: 600;">${formattedDate}</td>
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

          <!-- Consultation Details -->
          <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
            <h3 style="color: #92400e; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
              Motif de consultation
            </h3>
            <p style="color: #92400e; margin: 0; font-size: 16px; line-height: 1.6;">
              ${booking.consultationReason}
            </p>
            ${booking.firstConsultation ? `
              <div style="background-color: #ffffff; padding: 15px; border-radius: 8px; margin-top: 15px; border-left: 4px solid #f59e0b;">
                <p style="color: #92400e; margin: 0; font-weight: 600; font-size: 14px;">
                  ⭐ Première consultation - Merci d'apporter une pièce d'identité et votre carte vitale
                </p>
              </div>
            ` : ''}
          </div>

          ${booking.message ? `
          <!-- Patient Message -->
          <div style="background-color: #e0f2fe; border: 1px solid #0891b2; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
            <h3 style="color: #0c4a6e; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
              Votre message
            </h3>
            <p style="color: #0c4a6e; margin: 0; font-size: 16px; line-height: 1.6; font-style: italic;">
              "${booking.message}"
            </p>
          </div>
          ` : ''}

          <!-- Important Reminders -->
          <div style="background-color: #fef2f2; border: 1px solid #dc2626; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
            <h3 style="color: #dc2626; margin: 0 0 20px 0; font-size: 18px; font-weight: 600;">
              Rappels importants
            </h3>
            <ul style="color: #dc2626; margin: 0; padding-left: 20px; font-size: 16px; line-height: 1.6;">
              <li>Arrivez 10 minutes avant votre rendez-vous</li>
              <li>Apportez une pièce d'identité et votre carte vitale</li>
              <li>Si vous devez annuler, faites-le au moins 24h à l'avance</li>
              <li>En cas d'urgence, contactez-nous par téléphone</li>
            </ul>
          </div>

          <!-- Actions -->
          <div style="background-color: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
            <h3 style="color: #0c4a6e; margin: 0 0 20px 0; font-size: 18px; font-weight: 600;">
              Actions disponibles
            </h3>
            <div style="text-align: center;">
              <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/cancel?token=${booking.cancellationToken}" 
                 style="display: inline-block; background: linear-gradient(135deg, #dc2626, #b91c1c); color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 10px;">
                Annuler le rendez-vous
              </a>
              <a href="tel:+33123456789" 
                 style="display: inline-block; background: linear-gradient(135deg, #059669, #047857); color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 10px;">
                Nous appeler
              </a>
            </div>
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
            Cabinet Médical - Système de rappel automatique
          </p>
        </div>

      </div>
    </body>
    </html>
  `

  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || 'Cabinet Médical'}" <${process.env.SMTP_USER}>`,
    to: booking.email,
    subject: `Rappel - Votre rendez-vous médical demain`,
    html,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log(`📧 Rappel envoyé à ${booking.email} pour le ${formattedDate}`)
    return true
  } catch (error) {
    console.error('Erreur envoi rappel:', error)
    throw error
  }
}

// Fonction pour récupérer les rendez-vous à rappeler (24h avant)
const getBookingsToRemind = async () => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  
  const endOfTomorrow = new Date(tomorrow)
  endOfTomorrow.setHours(23, 59, 59, 999)

  const bookings = await prisma.booking.findMany({
    where: {
      date: {
        gte: tomorrow,
        lte: endOfTomorrow
      },
      status: {
        in: ['PENDING', 'CONFIRMED']
      }
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      date: true,
      time: true,
      period: true,
      firstConsultation: true,
      consultationReason: true,
      message: true,
      cancellationToken: true
    }
  })

  console.log(`📅 ${bookings.length} rendez-vous à rappeler pour demain`)
  return bookings
}

// Fonction pour envoyer tous les rappels
const sendAllReminders = async () => {
  try {
    const bookings = await getBookingsToRemind()
    
    if (bookings.length === 0) {
      console.log('📧 Aucun rappel à envoyer')
      return { sent: 0, errors: 0 }
    }

    let sent = 0
    let errors = 0

    for (const booking of bookings) {
      try {
        await sendReminderEmail(booking)
        sent++
      } catch (error) {
        console.error(`Erreur rappel pour ${booking.email}:`, error)
        errors++
      }
    }

    console.log(`📧 Rappels envoyés: ${sent}, Erreurs: ${errors}`)
    return { sent, errors }

  } catch (error) {
    console.error('Erreur envoi rappels:', error)
    throw error
  }
}

module.exports = {
  sendReminderEmail,
  getBookingsToRemind,
  sendAllReminders
}
