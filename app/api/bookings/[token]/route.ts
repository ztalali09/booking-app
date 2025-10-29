// app/api/bookings/[token]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params

    if (!token) {
      return NextResponse.json(
        { error: "Token d'annulation requis" },
        { status: 400 }
      )
    }

    // Trouver la réservation par token
    const booking = await prisma.booking.findUnique({
      where: { cancellationToken: token },
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
        status: true,
        createdAt: true,
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: "Réservation non trouvée" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      booking: {
        ...booking,
        date: booking.date.toISOString(),
      }
    })

  } catch (error) {
    console.error('Erreur récupération réservation:', error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération de la réservation" },
      { status: 500 }
    )
  }
}
