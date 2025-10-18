// app/api/availability/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const dateParam = searchParams.get('date')

    if (!dateParam) {
      return NextResponse.json(
        { error: "Date requise" },
        { status: 400 }
      )
    }

    const date = new Date(dateParam)
    
    // Récupérer toutes les réservations du jour (non annulées)
    const bookings = await prisma.booking.findMany({
      where: {
        date: {
          gte: new Date(date.setHours(0, 0, 0, 0)),
          lt: new Date(date.setHours(23, 59, 59, 999)),
        },
        status: {
          notIn: ['CANCELLED']
        }
      },
      select: {
        time: true,
      }
    })

    // Créneaux disponibles (hardcodés pour l'instant)
    const morningSlots = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00"]
    const afternoonSlots = ["12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"]
    const allSlots = [...morningSlots, ...afternoonSlots]

    // Retirer les créneaux déjà réservés
    const bookedTimes = bookings.map(b => b.time)
    const availableSlots = allSlots.filter(slot => !bookedTimes.includes(slot))

    return NextResponse.json({
      date: dateParam,
      availableSlots,
      bookedSlots: bookedTimes.length,
      totalSlots: allSlots.length,
    })

  } catch (error) {
    console.error('Erreur disponibilités:', error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des disponibilités" },
      { status: 500 }
    )
  }
}


