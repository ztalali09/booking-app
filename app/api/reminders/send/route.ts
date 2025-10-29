// app/api/reminders/send/route.ts
// API pour envoyer les rappels de rendez-vous

import { NextRequest, NextResponse } from 'next/server'
import { sendAllReminders, getBookingsToRemind } from '@/lib/services/reminder'

export async function POST(request: NextRequest) {
  try {
    console.log('📧 Démarrage de l\'envoi des rappels...')
    
    // Vérifier si c'est un appel manuel ou automatique
    const body = await request.json().catch(() => ({}))
    const isManual = body.manual === true
    
    if (isManual) {
      console.log('📧 Envoi manuel des rappels demandé')
    } else {
      console.log('📧 Envoi automatique des rappels')
    }

    // Récupérer les rendez-vous à rappeler
    const bookingsToRemind = await getBookingsToRemind()
    
    if (bookingsToRemind.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Aucun rappel à envoyer',
        data: {
          sent: 0,
          errors: 0,
          total: 0
        }
      })
    }

    // Envoyer tous les rappels
    const result = await sendAllReminders()

    return NextResponse.json({
      success: true,
      message: `Rappels envoyés avec succès`,
      data: {
        sent: result.sent,
        errors: result.errors,
        total: bookingsToRemind.length
      }
    })

  } catch (error) {
    console.error('Erreur envoi rappels:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Erreur lors de l\'envoi des rappels',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Récupérer la liste des rendez-vous à rappeler (sans les envoyer)
    const bookingsToRemind = await getBookingsToRemind()
    
    return NextResponse.json({
      success: true,
      data: {
        bookings: bookingsToRemind.map(booking => ({
          id: booking.id,
          firstName: booking.firstName,
          lastName: booking.lastName,
          email: booking.email,
          date: booking.date.toISOString(),
          time: booking.time,
          period: booking.period,
          firstConsultation: booking.firstConsultation,
          consultationReason: booking.consultationReason
        })),
        total: bookingsToRemind.length
      }
    })

  } catch (error) {
    console.error('Erreur récupération rappels:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Erreur lors de la récupération des rappels',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}
