// app/api/sync/calendar/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { syncCalendarToDatabase } from '@/lib/services/calendar'

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification admin (simple)
    const authHeader = request.headers.get('authorization')
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
    
    if (authHeader !== `Bearer ${adminPassword}`) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      )
    }

    // Synchroniser Google Calendar vers la base de données
    const events = await syncCalendarToDatabase()
    
    return NextResponse.json({
      success: true,
      message: `Synchronisation terminée. ${events.length} événements traités.`,
      eventsCount: events.length
    })

  } catch (error) {
    console.error('Erreur synchronisation:', error)
    return NextResponse.json(
      { error: "Erreur lors de la synchronisation" },
      { status: 500 }
    )
  }
}

// Route GET pour déclencher la synchronisation manuellement
export async function GET(request: NextRequest) {
  try {
    const events = await syncCalendarToDatabase()
    
    return NextResponse.json({
      success: true,
      message: `Synchronisation terminée. ${events.length} événements trouvés.`,
      events: events.map(event => ({
        id: event.id,
        summary: event.summary,
        start: event.start?.dateTime,
        end: event.end?.dateTime,
      }))
    })

  } catch (error) {
    console.error('Erreur synchronisation:', error)
    return NextResponse.json(
      { error: "Erreur lors de la synchronisation" },
      { status: 500 }
    )
  }
}
