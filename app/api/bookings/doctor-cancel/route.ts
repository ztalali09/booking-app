// app/api/bookings/doctor-cancel/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { deleteCalendarEvent } from '@/lib/services/calendar'
import { sendBookingCancellation, sendPatientCancellationNotification } from '@/lib/services/email'
import { formatDateForAPI } from '@/lib/utils/date'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cancellationToken, cancelledBy, doctorMessage } = body

    if (!cancellationToken) {
      return NextResponse.json(
        { error: "Token d'annulation requis" },
        { status: 400 }
      )
    }

    // Trouver la réservation
    const booking = await prisma.booking.findUnique({
      where: { cancellationToken }
    })

    if (!booking) {
      return NextResponse.json(
        { error: "Réservation non trouvée" },
        { status: 404 }
      )
    }

    if (booking.status === 'CANCELLED') {
      return NextResponse.json(
        { error: "Cette réservation a déjà été annulée" },
        { status: 400 }
      )
    }

    // Mettre à jour le statut
    const updatedBooking = await prisma.booking.update({
      where: { cancellationToken },
      data: { 
        status: 'CANCELLED'
      }
    })

    // Envoyer emails d'annulation et supprimer de Google Calendar
    try {
      await Promise.all([
        // Email d'annulation au patient (avec indication que c'est le médecin qui annule)
        sendPatientCancellationNotification({
          firstName: updatedBooking.firstName,
          lastName: updatedBooking.lastName,
          email: updatedBooking.email,
          date: formatDateForAPI(updatedBooking.date), // YYYY-MM-DD format
          time: updatedBooking.time,
          period: updatedBooking.period,
          cancelledBy: 'doctor',
          doctorMessage: doctorMessage || undefined
        }),
        // Supprimer de Google Calendar si l'événement existe
        updatedBooking.googleCalendarEventId 
          ? deleteCalendarEvent(updatedBooking.googleCalendarEventId)
          : Promise.resolve()
      ])
    } catch (error) {
      console.error('Erreur lors de l\'annulation:', error)
      // Ne pas faire échouer l'annulation si les notifications échouent
    }

    return NextResponse.json({
      success: true,
      message: "La réservation a été annulée avec succès. Le patient a été notifié."
    })

  } catch (error) {
    console.error('Erreur annulation médecin:', error)
    return NextResponse.json(
      { error: "Erreur lors de l'annulation" },
      { status: 500 }
    )
  }
}
