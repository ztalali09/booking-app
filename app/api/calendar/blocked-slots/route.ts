import { NextRequest, NextResponse } from 'next/server'
import { getBlockedSlots, isSlotBlocked } from '@/lib/services/google-calendar'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get('date')
    
    if (!dateParam) {
      return NextResponse.json(
        { error: 'Paramètre date requis' },
        { status: 400 }
      )
    }

    const date = new Date(dateParam)
    
    if (isNaN(date.getTime())) {
      return NextResponse.json(
        { error: 'Format de date invalide' },
        { status: 400 }
      )
    }

    // Récupérer les créneaux bloqués depuis Google Calendar
    const blockedSlots = await getBlockedSlots(date)
    
    return NextResponse.json({
      date: date.toISOString(),
      blockedSlots: blockedSlots.map(slot => ({
        start: slot.start.toISOString(),
        end: slot.end.toISOString(),
        title: slot.title,
        description: slot.description,
        isAllDay: slot.isAllDay,
      }))
    })
  } catch (error) {
    console.error('Erreur API blocked-slots:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des créneaux bloqués' },
      { status: 500 }
    )
  }
}
