// app/api/bookings/cancel/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendBookingCancellation } from '@/lib/services/email'
import { deleteCalendarEvent } from '@/lib/services/calendar'

export async function POST(request: NextRequest) {
  try {
    const { cancellationToken } = await request.json()

    if (!cancellationToken) {
      return NextResponse.json(
        { error: "Token d'annulation requis" },
        { status: 400 }
      )
    }

    // Trouver et annuler la réservation
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
        { error: "Cette réservation est déjà annulée" },
        { status: 400 }
      )
    }

    // Vérifier que la réservation n'est pas dans moins de 24h
    const now = new Date()
    const bookingDate = new Date(booking.date)
    const hoursUntilBooking = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (hoursUntilBooking < 24) {
      return NextResponse.json(
        { error: "Impossible d'annuler moins de 24h avant le rendez-vous. Veuillez contacter le cabinet." },
        { status: 400 }
      )
    }

    // Annuler
    const updatedBooking = await prisma.booking.update({
      where: { cancellationToken },
      data: { status: 'CANCELLED' }
    })

    // Envoyer email d'annulation et supprimer de Google Calendar
    try {
      await Promise.all([
        // Email d'annulation
        sendBookingCancellation(updatedBooking.email, {
          firstName: updatedBooking.firstName,
          lastName: updatedBooking.lastName,
          date: updatedBooking.date.toISOString(),
          time: updatedBooking.time,
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
      message: "Votre rendez-vous a été annulé avec succès"
    })

  } catch (error) {
    console.error('Erreur annulation publique:', error)
    return NextResponse.json(
      { error: "Erreur lors de l'annulation" },
      { status: 500 }
    )
  }
}


