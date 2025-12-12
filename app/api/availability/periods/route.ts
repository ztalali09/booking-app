// app/api/availability/periods/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isDateAvailable, generateTimeSlotsForDay } from '@/lib/config/availability-config'

// Vérifier si un créneau chevauche une réservation existante
const isSlotOverlapping = (slotTime: string, bookings: any[]) => {
  const [slotHour, slotMinute] = slotTime.split(':').map(Number)
  const slotStart = slotHour * 60 + slotMinute
  const slotEnd = slotStart + 60 // 1 heure après

  return bookings.some(booking => {
    const [bookingHour, bookingMinute] = booking.time.split(':').map(Number)
    const bookingStart = bookingHour * 60 + bookingMinute
    const bookingEnd = bookingStart + 60 // 1 heure

    return (slotStart < bookingEnd && slotEnd > bookingStart)
  })
}

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

    // Convertir la date YYYY-MM-DD en Date avec fuseau horaire Europe/Paris
    const date = new Date(`${dateParam}T12:00:00+01:00`)
    const dayOfWeek = date.getDay()

    // Vérifier si la date est disponible selon les règles
    if (!isDateAvailable(date)) {
      return NextResponse.json({
        date: dateParam,
        morningAvailable: false,
        afternoonAvailable: false,
        morningCount: 0,
        afternoonCount: 0,
        message: "Cette date n'est pas disponible"
      })
    }

    // Récupérer toutes les réservations non annulées pour cette date
    const startOfDay = new Date(`${dateParam}T00:00:00+01:00`)
    const endOfDay = new Date(`${dateParam}T23:59:59+01:00`)

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

    // Générer les créneaux pour ce jour (selon la config - uniquement après-midi)
    const allSlots = generateTimeSlotsForDay(dayOfWeek)

    // Vérifier si c'est le jour actuel
    const today = new Date()
    const isToday = date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()

    let availableSlots = allSlots.filter(slot => !isSlotOverlapping(slot, bookings))

    // Si c'est le jour actuel, filtrer les créneaux passés
    if (isToday) {
      const now = new Date()
      const currentHour = now.getHours()
      const currentMinute = now.getMinutes()
      const currentTime = currentHour * 60 + currentMinute

      availableSlots = availableSlots.filter(slot => {
        const [hours, minutes] = slot.split(':').map(Number)
        const slotTime = hours * 60 + minutes
        return slotTime > currentTime + 15 // Minimum 15 minutes à l'avance
      })
    }

    // RÈGLE MÉTIER : Le praticien est disponible uniquement l'après-midi
    // Donc morningAvailable est toujours false
    const morningSlots: string[] = [] // Pas de créneaux le matin
    const afternoonSlots = availableSlots // Tous les créneaux sont l'après-midi

    return NextResponse.json({
      date: dateParam,
      morningAvailable: false, // Toujours false - praticien non disponible le matin
      afternoonAvailable: afternoonSlots.length > 0,
      morningCount: 0,
      afternoonCount: afternoonSlots.length,
    })

  } catch (error) {
    console.error('Erreur récupération périodes:', error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des périodes" },
      { status: 500 }
    )
  }
}


