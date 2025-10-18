// app/api/availability/dates/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Vérifier si une date a encore des créneaux disponibles
const hasAvailableSlots = async (date: Date) => {
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  // Récupérer les réservations de ce jour
  const bookings = await prisma.booking.findMany({
    where: {
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
      status: {
        notIn: ['CANCELLED']
      }
    },
    select: {
      time: true,
    }
  })

  // Créneaux disponibles (9h-18h par tranches de 30min = 18 créneaux)
  const totalSlots = 18
  
  // Chaque réservation bloque 2 créneaux (1 heure = 2 x 30min)
  const blockedSlots = new Set<string>()
  bookings.forEach(booking => {
    const [hour, minute] = booking.time.split(':').map(Number)
    const startMinutes = hour * 60 + minute
    
    // Bloquer le créneau et le suivant (1 heure)
    blockedSlots.add(`${hour}:${minute.toString().padStart(2, '0')}`)
    const nextMinutes = startMinutes + 30
    const nextHour = Math.floor(nextMinutes / 60)
    const nextMinute = nextMinutes % 60
    if (nextHour < 18) {
      blockedSlots.add(`${nextHour}:${nextMinute.toString().padStart(2, '0')}`)
    }
  })

  // Si tous les créneaux sont bloqués, la date n'est pas disponible
  return blockedSlots.size < totalSlots
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const monthParam = searchParams.get('month') // 0-11
    const yearParam = searchParams.get('year')

    const month = monthParam ? parseInt(monthParam) : new Date().getMonth()
    const year = yearParam ? parseInt(yearParam) : new Date().getFullYear()

    // Générer les dates disponibles (du jour actuel + 1 jour jusqu'à 60 jours)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const startDate = new Date(today)
    startDate.setDate(startDate.getDate() + 1) // À partir de demain
    
    const endDate = new Date(today)
    endDate.setDate(endDate.getDate() + 60) // Jusqu'à 60 jours

    const availableDates = []
    const currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      // Exclure les dimanches (0 = dimanche)
      if (currentDate.getDay() !== 0) {
        // Si c'est le mois demandé
        if (currentDate.getMonth() === month && currentDate.getFullYear() === year) {
          // Vérifier si la date a des créneaux disponibles
          const hasSlots = await hasAvailableSlots(new Date(currentDate))
          if (hasSlots) {
            availableDates.push(currentDate.getDate())
          }
        }
      }
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return NextResponse.json({
      month,
      year,
      availableDates,
    })

  } catch (error) {
    console.error('Erreur récupération dates:', error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des dates" },
      { status: 500 }
    )
  }
}

