// app/api/availability/dates/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Vérifier si une date a encore des créneaux disponibles
const hasAvailableSlots = async (date: Date, allBookings: Map<string, string[]>) => {
  const dateKey = date.toISOString().split('T')[0]
  const bookings = allBookings.get(dateKey) || []

  // Vérifier si c'est le jour actuel (utiliser le fuseau horaire français)
  const now = new Date()
  const franceTime = new Date(now.toLocaleString("en-US", {timeZone: "Europe/Paris"}))
  const today = new Date(franceTime.getFullYear(), franceTime.getMonth(), franceTime.getDate())
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const isToday = dateOnly.getTime() === today.getTime()
  

  // Créneaux disponibles (9h-18h par tranches de 30min = 18 créneaux)
  const totalSlots = 18
  
  // Chaque réservation bloque 2 créneaux (1 heure = 2 x 30min)
  const blockedSlots = new Set<string>()
  bookings.forEach(time => {
    const [hour, minute] = time.split(':').map(Number)
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

        // Si c'est le jour actuel, vérifier qu'il reste des créneaux futurs
        if (isToday) {
          const currentHour = franceTime.getHours()
          const currentMinute = franceTime.getMinutes()
          const currentTime = currentHour * 60 + currentMinute
    
    // Compter les créneaux futurs non bloqués
    let futureAvailableSlots = 0
    for (let hour = 9; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const slotTime = hour * 60 + minute
        if (slotTime > currentTime) {
          const timeStr = `${hour}:${minute.toString().padStart(2, '0')}`
          if (!blockedSlots.has(timeStr)) {
            futureAvailableSlots++
          }
        }
      }
    }
    
    return futureAvailableSlots > 0
  }

  // Pour les autres jours, vérifier qu'il reste des créneaux
  return blockedSlots.size < totalSlots
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const monthParam = searchParams.get('month') // 0-11
    const yearParam = searchParams.get('year')

    const month = monthParam ? parseInt(monthParam) : new Date().getMonth()
    const year = yearParam ? parseInt(yearParam) : new Date().getFullYear()

    // Générer les dates disponibles (du jour actuel jusqu'à 180 jours)
    // Utiliser le fuseau horaire français
    const now = new Date()
    const franceTime = new Date(now.toLocaleString("en-US", {timeZone: "Europe/Paris"}))
    const today = new Date(franceTime.getFullYear(), franceTime.getMonth(), franceTime.getDate())
    
    const startDate = new Date(today) // Inclure le jour actuel
    
    const endDate = new Date(today)
    endDate.setDate(endDate.getDate() + 180) // Jusqu'à 180 jours (6 mois)

    // 🚀 OPTIMISATION : Une seule requête pour toutes les réservations
    const allBookings = await prisma.booking.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
        status: {
          notIn: ['CANCELLED']
        }
      },
      select: {
        date: true,
        time: true,
      }
    })

    // Organiser les réservations par date pour un accès rapide
    const bookingsByDate = new Map<string, string[]>()
    allBookings.forEach(booking => {
      const dateKey = booking.date.toISOString().split('T')[0]
      if (!bookingsByDate.has(dateKey)) {
        bookingsByDate.set(dateKey, [])
      }
      bookingsByDate.get(dateKey)!.push(booking.time)
    })

    const availableDates = []
    const currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      // Exclure les dimanches (0 = dimanche)
      if (currentDate.getDay() !== 0) {
        // Si c'est le mois demandé
        if (currentDate.getMonth() === month && currentDate.getFullYear() === year) {
          // Vérifier si c'est le jour actuel
          const isToday = currentDate.getDate() === today.getDate() && 
                          currentDate.getMonth() === today.getMonth() && 
                          currentDate.getFullYear() === today.getFullYear()
          
          if (isToday) {
            // Pour le jour actuel, vérifier s'il reste des créneaux futurs
            const hasSlots = await hasAvailableSlots(new Date(currentDate), bookingsByDate)
            if (hasSlots) {
              availableDates.push(currentDate.getDate())
            }
          } else {
            // Pour les autres jours, vérifier normalement
            const hasSlots = await hasAvailableSlots(new Date(currentDate), bookingsByDate)
            if (hasSlots) {
              availableDates.push(currentDate.getDate())
            }
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

