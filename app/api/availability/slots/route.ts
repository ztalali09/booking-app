// app/api/availability/slots/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getBlockedSlots, isSlotBlocked } from '@/lib/services/google-calendar'
import { createDateFromString } from '@/lib/utils/date'
import { isDateAvailable, generateTimeSlotsForDay } from '@/lib/config/availability-config'

// Vérifier si un créneau est disponible (pas de chevauchement direct)
const isSlotAvailable = (slotTime: string, bookings: any[]) => {
  const [slotHour, slotMinute] = slotTime.split(':').map(Number)
  const slotStart = slotHour * 60 + slotMinute // en minutes
  const slotEnd = slotStart + 60 // 1 heure après

  // Vérifier les chevauchements directs
  const hasDirectOverlap = bookings.some(booking => {
    const [bookingHour, bookingMinute] = booking.time.split(':').map(Number)
    const bookingStart = bookingHour * 60 + bookingMinute
    const bookingEnd = bookingStart + 60 // 1 heure

    return (slotStart < bookingEnd && slotEnd > bookingStart)
  })

  return !hasDirectOverlap
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
    // Convertir la date YYYY-MM-DD en Date avec fuseau horaire Europe/Paris
    const date = createDateFromString(dateParam)
    const dayOfWeek = date.getDay()
    const startOfDay = createDateFromString(dateParam)
    const endOfDay = new Date(startOfDay)
    endOfDay.setHours(23, 59, 59, 999)

    // Vérifier si la date est disponible selon les règles
    if (!isDateAvailable(date)) {
      return NextResponse.json({
        date: dateParam,
        morning: [],
        afternoon: [],
        all: [],
        message: "Cette date n'est pas disponible"
      })
    }

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

    // Générer les créneaux pour ce jour (selon la config - horaires personnalisés)
    const allSlots = generateTimeSlotsForDay(dayOfWeek)

    // Récupérer les créneaux bloqués depuis Google Calendar
    let blockedSlots: any[] = []
    try {
      blockedSlots = await getBlockedSlots(date)
    } catch (error) {
      console.error('Erreur récupération créneaux bloqués:', error)
      // Continuer sans les créneaux bloqués si Google Calendar échoue
    }

    // Vérifier si c'est le jour actuel
    const today = new Date()
    const isToday = date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()

    // Créer des objets avec statut pour chaque créneau
    const slotsWithStatus = allSlots.map(slot => {
      let available = isSlotAvailable(slot, bookings)

      // Vérifier si le créneau est bloqué dans Google Calendar
      if (available && blockedSlots.length > 0) {
        available = !isSlotBlocked(slot, date, blockedSlots)
      }

      // Si c'est le jour actuel, vérifier que le créneau n'est pas passé
      if (isToday && available) {
        const now = new Date()
        const currentHour = now.getHours()
        const currentMinute = now.getMinutes()
        const currentTime = currentHour * 60 + currentMinute

        const [hours, minutes] = slot.split(':').map(Number)
        const slotTime = hours * 60 + minutes

        // Le créneau doit être dans le futur + 15 minutes minimum
        const minimumAdvanceTime = currentTime + 15
        available = slotTime > minimumAdvanceTime
      }

      return {
        time: slot,
        available: available
      }
    })

    // RÈGLE MÉTIER : Le praticien est disponible uniquement l'après-midi
    // Donc morning est toujours vide
    const morningSlots: typeof slotsWithStatus = [] // Pas de créneaux le matin
    const afternoonSlots = slotsWithStatus // Tous les créneaux sont l'après-midi

    return NextResponse.json({
      date: dateParam,
      morning: morningSlots,
      afternoon: afternoonSlots,
      all: slotsWithStatus,
    })

  } catch (error) {
    console.error('Erreur récupération créneaux:', error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des créneaux" },
      { status: 500 }
    )
  }
}


