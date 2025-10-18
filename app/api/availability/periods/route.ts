// app/api/availability/periods/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Générer tous les créneaux de 9h à 18h
const generateTimeSlots = () => {
  const slots = []
  for (let hour = 9; hour < 18; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`)
    slots.push(`${hour.toString().padStart(2, '0')}:30`)
  }
  return slots
}

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

    // Récupérer toutes les réservations non annulées pour cette date
    const date = new Date(dateParam)
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

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

    // Générer tous les créneaux et vérifier leur disponibilité
    const allSlots = generateTimeSlots()
    const availableSlots = allSlots.filter(slot => !isSlotOverlapping(slot, bookings))

    // Organiser par période
    const morningSlots = availableSlots.filter(slot => {
      const hour = parseInt(slot.split(':')[0])
      return hour < 12
    })

    const afternoonSlots = availableSlots.filter(slot => {
      const hour = parseInt(slot.split(':')[0])
      return hour >= 12
    })

    return NextResponse.json({
      date: dateParam,
      morningAvailable: morningSlots.length > 0,
      afternoonAvailable: afternoonSlots.length > 0,
      morningCount: morningSlots.length,
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

