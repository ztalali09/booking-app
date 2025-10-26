// app/api/bookings/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createBookingSchema } from '@/lib/validations/booking'
import { sendBookingConfirmation, sendDoctorNotification } from '@/lib/services/email'
import { createCalendarEvent } from '@/lib/services/calendar'
import { bookingRateLimit } from '@/lib/rate-limit'
import { trackBooking, trackError, measureExecutionTime } from '@/lib/monitoring'
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
    const existingBooking = await prisma.booking.findFirst({
      where: {
        date: new Date(validatedData.date),
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

    // 3. Créer la réservation
    const booking = await prisma.booking.create({
      data: {
        ...validatedData,
        date: new Date(validatedData.date),
      }
    })

    // 4. Démarrer les tâches asynchrones (ne pas attendre)
    Promise.all([
      // TODO: Email de confirmation au patient (désactivé temporairement)
      // sendBookingConfirmation(booking.email, {
      //   firstName: booking.firstName,
      //   lastName: booking.lastName,
      //   date: booking.date.toISOString(),
      //   time: booking.time,
      //   period: booking.period,
      //   cancellationToken: booking.cancellationToken,
      // }),
      // TODO: Notification au médecin (désactivé temporairement)
      // sendDoctorNotification({
      //   firstName: booking.firstName,
      //   lastName: booking.lastName,
      //   email: booking.email,
      //   phone: booking.phone,
      //   date: booking.date.toISOString(),
      //   time: booking.time,
      //   period: booking.period,
      //   firstConsultation: booking.firstConsultation,
      //   message: booking.message || undefined,
      // }),
      // Créer l'événement Google Calendar (optionnel)
      process.env.GOOGLE_CLIENT_ID ? createCalendarEvent({
        id: booking.id,
        firstName: booking.firstName,
        lastName: booking.lastName,
        email: booking.email,
        phone: booking.phone,
        date: booking.date.toISOString(),
        time: booking.time,
        period: booking.period,
        firstConsultation: booking.firstConsultation,
        message: booking.message || undefined,
      }).then(googleEventId => {
        // Mettre à jour la réservation avec l'ID de l'événement Google
        return prisma.booking.update({
          where: { id: booking.id },
          data: { 
            googleCalendarEventId: googleEventId,
            syncedWithGoogle: true 
          }
        })
      }) : Promise.resolve(),
      // TODO: sendTelegramNotification(booking),
    ]).catch(error => {
      console.error('Erreur lors des notifications:', error)
      // Ne pas bloquer la réponse si les notifications échouent
    })

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


