// app/api/metrics/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { exportMetrics, cleanupMetrics } from '@/lib/monitoring'
import { env } from '@/lib/env'

// Middleware simple pour protéger les métriques
function authenticateRequest(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const expectedToken = `Bearer ${env.ADMIN_PASSWORD}`
  
  return authHeader === expectedToken
}

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    if (!authenticateRequest(request)) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    // Nettoyer les anciennes métriques
    cleanupMetrics()
    
    // Exporter les métriques
    const metrics = exportMetrics()
    
    return NextResponse.json(metrics, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    })

  } catch (error) {
    console.error('Erreur récupération métriques:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// Endpoint pour réinitialiser les métriques (admin seulement)
export async function DELETE(request: NextRequest) {
  try {
    // Vérifier l'authentification
    if (!authenticateRequest(request)) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    // Réinitialiser les métriques
    cleanupMetrics()
    
    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Erreur réinitialisation métriques:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

