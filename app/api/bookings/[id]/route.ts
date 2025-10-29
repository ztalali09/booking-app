// app/api/bookings/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const booking = await prisma.booking.findUnique({
      where: { id },
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
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: "Réservation non trouvée" },
        { status: 404 }
      )
    }

    return NextResponse.json({ booking })

  } catch (error) {
    console.error('Erreur récupération réservation:', error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération" },
      { status: 500 }
    )
  }
}

// Route DELETE - Annuler une réservation (pour admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const booking = await prisma.booking.update({
      where: { id },
      data: { status: 'CANCELLED' }
    })

    // Envoyer notification d'annulation (Phase 4)
    // await sendCancellationEmail(booking)

    return NextResponse.json({
      success: true,
      message: "Réservation annulée"
    })

  } catch (error) {
    console.error('Erreur annulation:', error)
    return NextResponse.json(
      { error: "Erreur lors de l'annulation" },
      { status: 500 }
    )
  }
}


