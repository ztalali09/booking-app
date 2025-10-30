// app/api/bookings/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createBookingSchema } from '@/lib/validations/booking'
import { sendBookingConfirmation, sendDoctorNotification } from '@/lib/services/email'
import { createCalendarEvent } from '@/lib/services/google-calendar'
import { bookingRateLimit } from '@/lib/rate-limit'
import { trackBooking, trackError, measureExecutionTime } from '@/lib/monitoring'
import { formatDateForAPI, createDateFromString } from '@/lib/utils/date'
import { z } from 'zod'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  // 🔒 Rate limiting - Temporairement désactivé pour debug
  // const rateLimitResult = bookingRateLimit(request)
  // if (!rateLimitResult.success) {
  //   trackError(new Error('Rate limit exceeded'), { endpoint: '/api/bookings' })
  //   return NextResponse.json(
  //     { 
  //       error: "Trop de tentatives de réservation. Veuillez réessayer plus tard.",
  //       retryAfter: Math.ceil((rateLimitResult.resetTime! - Date.now()) / 1000)
  //     },
  //     { 
  //       status: 429,
  //       headers: {
  //         'Retry-After': Math.ceil((rateLimitResult.resetTime! - Date.now()) / 1000).toString(),
  //         'X-RateLimit-Remaining': '0',
  //         'X-RateLimit-Reset': rateLimitResult.resetTime!.toString()
  //       }
  //     }
  //   )
  // }
  
  try {
    // 1. Récupérer et valider les données
    const body = await request.json()
    const validatedData = createBookingSchema.parse(body)

    // 2. Vérifier la disponibilité du créneau
    // Convertir la date YYYY-MM-DD en Date avec fuseau horaire Europe/Paris
    const bookingDate = createDateFromString(validatedData.date)
    const existingBooking = await prisma.booking.findFirst({
      where: {
        date: bookingDate,
        time: validatedData.time,
        status: {
          notIn: ['CANCELLED']
        }
      }
    })

    if (existingBooking) {
      return NextResponse.json(
        { error: "Ce créneau est déjà réservé" },
        { status: 409 }
      )
    }

    // 3. Vérifier la règle des 15 minutes minimum
    const now = new Date()
    const isToday = bookingDate.getDate() === now.getDate() && 
                   bookingDate.getMonth() === now.getMonth() && 
                   bookingDate.getFullYear() === now.getFullYear()

    if (isToday) {
      const [hours, minutes] = validatedData.time.split(':').map(Number)
      const slotTime = hours * 60 + minutes
      const currentTime = now.getHours() * 60 + now.getMinutes()
      const minimumAdvanceTime = currentTime + 15

      if (slotTime <= minimumAdvanceTime) {
        return NextResponse.json(
          { error: "Les réservations doivent être faites au moins 15 minutes à l'avance" },
          { status: 400 }
        )
      }
    }

    // 4. Créer la réservation
    const booking = await prisma.booking.create({
      data: {
        ...validatedData,
        date: bookingDate,
      }
    })

    // 4. Démarrer les tâches asynchrones (temporairement synchrone pour debug)
    console.log('🔄 Démarrage des tâches de synchronisation...')
    
    // Synchronisation Google Calendar (synchrone pour debug)
    console.log('🔍 Vérification de la configuration Google Calendar...')
    console.log('GOOGLE_SERVICE_ACCOUNT_EMAIL:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ? '✅ Défini' : '❌ Manquant')
    
    if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
      try {
        console.log('📅 Création de l\'événement Google Calendar...')
        console.log('Données de réservation:', {
          firstName: booking.firstName,
          lastName: booking.lastName,
          email: booking.email,
          date: booking.date,
          time: booking.time
        })
        
        const googleEventId = await createCalendarEvent({
          firstName: booking.firstName,
          lastName: booking.lastName,
          email: booking.email,
          phone: booking.phone,
          date: booking.date,
          time: booking.time,
          consultationReason: booking.consultationReason,
          message: booking.message || undefined,
        })
        
        console.log('✅ Événement Google Calendar créé:', googleEventId)
        
        if (googleEventId) {
          // Mettre à jour la réservation avec l'ID de l'événement Google
          await prisma.booking.update({
            where: { id: booking.id },
            data: { 
              googleCalendarEventId: googleEventId,
              syncedWithGoogle: true 
            }
          })
          
          console.log('✅ Réservation mise à jour avec l\'ID Google Calendar')
        } else {
          console.log('⚠️ Aucun ID d\'événement retourné par createCalendarEvent')
        }
      } catch (error) {
        console.error('❌ Erreur création événement Google Calendar:', error)
        console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace')
      }
    } else {
      console.log('⚠️ Google Calendar non configuré (GOOGLE_SERVICE_ACCOUNT_EMAIL manquant)')
    }
    
    // Autres tâches asynchrones (emails) - ATTENDRE les emails avant de répondre
    console.log('📧 Démarrage des tâches d\'envoi d\'emails...')
    try {
      await Promise.all([
        // Email de confirmation au patient
        (async () => {
          console.log('📧 Envoi email confirmation patient...')
          return sendBookingConfirmation(booking.email, {
            firstName: booking.firstName,
            lastName: booking.lastName,
            date: formatDateForAPI(booking.date), // YYYY-MM-DD format
            time: booking.time,
            period: booking.period,
            cancellationToken: booking.cancellationToken,
          }).catch(error => {
            console.error('❌ Erreur email confirmation:', error)
            return null
          })
        })(),
        // Notification au médecin
        (async () => {
          console.log('📧 Envoi notification médecin...')
          return sendDoctorNotification({
            firstName: booking.firstName,
            lastName: booking.lastName,
            email: booking.email,
            phone: booking.phone,
            date: formatDateForAPI(booking.date), // YYYY-MM-DD format
            time: booking.time,
            period: booking.period,
            firstConsultation: booking.firstConsultation,
            consultationReason: booking.consultationReason,
            message: booking.message || undefined,
            cancellationToken: booking.cancellationToken,
          }).catch(error => {
            console.error('❌ Erreur notification médecin:', error)
            return null
          })
        })(),
      ])
      console.log('✅ Tous les emails ont été traités')
    } catch (error) {
      console.error('❌ Erreur lors des notifications:', error)
      // Ne pas faire échouer la réservation si les notifications échouent
    }

    // 📊 Tracking de la réservation réussie
    const bookingTime = Date.now() - startTime
    trackBooking(true, bookingTime, validatedData.time)

    // 5. Retourner la réservation créée
    return NextResponse.json(
      {
        success: true,
        booking: {
          id: booking.id,
          cancellationToken: booking.cancellationToken,
        }
      },
      { 
        status: 201,
        headers: {
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'X-XSS-Protection': '1; mode=block'
        }
      }
    )

  } catch (error) {
    console.error('Erreur création réservation:', error)
    
    // 📊 Tracking de l'erreur
    const bookingTime = Date.now() - startTime
    trackBooking(false, bookingTime)
    trackError(error instanceof Error ? error : new Error('Unknown error'), { 
      endpoint: '/api/bookings',
      operation: 'booking_creation'
    })
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Erreur lors de la création de la réservation" },
      { status: 500 }
    )
  }
}

// Route GET - Lister les réservations (pour admin)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const date = searchParams.get('date')
    const status = searchParams.get('status')

    const where: any = {}
    
    if (date) {
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)
      
      where.date = {
        gte: startOfDay,
        lte: endOfDay,
      }
    }

    if (status) {
      where.status = status
    }

    const bookings = await prisma.booking.findMany({
      where,
      orderBy: [
        { date: 'asc' },
        { time: 'asc' },
      ],
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
        message: true,
        status: true,
        createdAt: true,
        // Ne pas exposer le cancellationToken ici
      }
    })

    return NextResponse.json({ bookings })

  } catch (error) {
    console.error('Erreur récupération réservations:', error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des réservations" },
      { status: 500 }
    )
  }
}


