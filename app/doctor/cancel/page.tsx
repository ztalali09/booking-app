'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

interface BookingDetails {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  date: string
  time: string
  period: string
  consultationReason: string
  message?: string
  status: string
  createdAt: string
}

function DoctorCancelContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  const [booking, setBooking] = useState<BookingDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [cancelled, setCancelled] = useState(false)
  const [error, setError] = useState('')
  const [doctorMessage, setDoctorMessage] = useState('')

  useEffect(() => {
    if (token) {
      fetchBookingDetails()
    } else {
      setError('Token de réservation manquant')
      setLoading(false)
    }
  }, [token])

  const fetchBookingDetails = async () => {
    try {
      const response = await fetch(`/api/bookings/by-token?token=${token}`)
      const data = await response.json()
      
      if (response.ok) {
        setBooking(data.booking)
      } else {
        setError(data.error || 'Réservation non trouvée')
      }
    } catch (err) {
      setError('Erreur lors de la récupération des détails')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!token) return
    
    setCancelling(true)
    setError('')
    
    try {
      const response = await fetch('/api/bookings/doctor-cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          cancellationToken: token,
          cancelledBy: 'doctor',
          doctorMessage: doctorMessage.trim() || undefined
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setCancelled(true)
      } else {
        setError(data.error || 'Erreur lors de l\'annulation')
      }
    } catch (err) {
      setError('Erreur lors de l\'annulation')
    } finally {
      setCancelling(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    // Convertir la date UTC en heure locale pour l'affichage
    const localDate = new Date(date.getTime() + (date.getTimezoneOffset() * 60000))
    return localDate.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatTimeRange = (time: string, period: string) => {
    const [hours, minutes] = time.split(':').map(Number)
    const startTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
    
    const endMinutes = minutes
    const endHours = hours + 1
    const finalMinutes = endMinutes % 60
    const endTime = `${endHours.toString().padStart(2, '0')}:${finalMinutes.toString().padStart(2, '0')}`
    
    return `de ${startTime} à ${endTime}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F2E7] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-[#B4B4B4]">Chargement des détails de la réservation...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F5F2E7] flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-500 text-6xl mb-4">
            <svg className="mx-auto h-12 w-12 text-red-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M9.401 1.592a2.25 2.25 0 0 1 3.198 0l9.81 10.183c1.36 1.413.35 3.725-1.6 3.725H1.19c-1.95 0-2.96-2.312-1.6-3.725l9.81-10.183ZM12 7.5a.75.75 0 0 1 .75.75v5.25a.75.75 0 0 1-1.5 0V8.25A.75.75 0 0 1 12 7.5Zm0 9a1.125 1.125 0 1 0 0 2.25A1.125 1.125 0 0 0 12 16.5Z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#4A4A4A] mb-4">Erreur</h1>
          <p className="text-[#B4B4B4] mb-6">{error}</p>
          <a 
            href={process.env.NEXT_PUBLIC_APP_URL || 'https://booking-p70q1smkx-hahababamama77-gmailcoms-projects.vercel.app/'} 
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour à l'accueil
          </a>
        </div>
      </div>
    )
  }

  if (cancelled) {
    return (
      <div className="min-h-screen bg-[#F5F2E7] flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-[#A8C3A0] text-6xl mb-4">
            <svg className="mx-auto h-12 w-12 text-[#A8C3A0]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M12 2.25a9.75 9.75 0 1 0 0 19.5 9.75 9.75 0 0 0 0-19.5ZM10.28 13.97l-2.25-2.25a.75.75 0 1 1 1.06-1.06l1.72 1.72 4.28-4.28a.75.75 0 1 1 1.06 1.06l-4.81 4.81a.75.75 0 0 1-1.06 0Z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#4A4A4A] mb-4">Réservation annulée</h1>
          <p className="text-[#B4B4B4] mb-6">
            La réservation a été annulée avec succès. Le patient a été notifié par email.
          </p>
          <div className="space-y-3">
            <a 
              href={process.env.NEXT_PUBLIC_APP_URL || 'https://booking-p70q1smkx-hahababamama77-gmailcoms-projects.vercel.app/'} 
              className="block w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retour au tableau de bord
            </a>
            <a 
              href="mailto:contact@cabinet-medical.com" 
              className="block w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Nous contacter
            </a>
          </div>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-[#F5F2E7] flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-gray-500 text-6xl mb-4">
            <svg className="mx-auto h-12 w-12 text-gray-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm.75 14.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm1.177-7.927a2.625 2.625 0 0 0-4.554 1.86.75.75 0 0 1-1.5 0 4.125 4.125 0 0 1 7.2-2.82c.72.8 1.077 1.8.977 2.84-.08.81-.47 1.55-1.07 2.08-.27.24-.57.45-.88.64-.39.26-.85.57-.85 1.077v.123a.75.75 0 0 1-1.5 0v-.123c0-1.23.91-1.86 1.5-2.25.26-.173.51-.347.71-.53.34-.31.54-.72.58-1.14.06-.6-.13-1.17-.49-1.58Z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#4A4A4A] mb-4">Réservation non trouvée</h1>
          <p className="text-[#B4B4B4] mb-6">Cette réservation n'existe pas ou a déjà été annulée.</p>
          <a 
            href={process.env.NEXT_PUBLIC_APP_URL || 'https://booking-p70q1smkx-hahababamama77-gmailcoms-projects.vercel.app/'} 
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour à l'accueil
          </a>
        </div>
      </div>
    )
  }

  if (booking.status === 'CANCELLED') {
    return (
      <div className="min-h-screen bg-[#F5F2E7] flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-orange-500 text-6xl mb-4">
            <svg className="mx-auto h-12 w-12 text-orange-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M12 2.25a9.75 9.75 0 1 0 0 19.5 9.75 9.75 0 0 0 0-19.5Zm0 6a1.125 1.125 0 1 1 0 2.25A1.125 1.125 0 0 1 12 8.25Zm-.75 3.75a.75.75 0 0 0-.75.75v4.5c0 .414.336.75.75.75h1.5a.75.75 0 0 0 0-1.5H12v-3h.75a.75.75 0 0 0 0-1.5h-1.5Z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#4A4A4A] mb-4">Déjà annulée</h1>
          <p className="text-[#B4B4B4] mb-6">Cette réservation a déjà été annulée.</p>
          <a 
            href="/" 
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour au tableau de bord
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F2E7] py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
            <h1 className="text-2xl font-bold text-white text-center">
              Annulation de réservation par le médecin
            </h1>
            <div className="w-16 h-1 bg-white mx-auto mt-3"></div>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-[#4A4A4A] mb-4">
                Détails de la réservation
              </h2>
              
              <div className="bg-[#F5F2E7] rounded-lg p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Patient</span>
                    <p className="text-[#4A4A4A] font-semibold">{booking.firstName} {booking.lastName}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Email</span>
                    <p className="text-[#4A4A4A]">{booking.email}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Téléphone</span>
                    <p className="text-[#4A4A4A]">{booking.phone}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Date</span>
                    <p className="text-[#4A4A4A]">{formatDate(booking.date)}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Période</span>
                    <p className="text-[#4A4A4A]">{booking.period === 'morning' ? 'Matin' : 'Après-midi'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Heure</span>
                    <p className="text-[#4A4A4A] font-semibold">{formatTimeRange(booking.time, booking.period)}</p>
                  </div>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-500">Motif de consultation</span>
                  <p className="text-[#4A4A4A]">{booking.consultationReason}</p>
                </div>
                
                {booking.message && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Message du patient</span>
                    <p className="text-[#4A4A4A] italic">"{booking.message}"</p>
                  </div>
                )}
                
                <div>
                  <span className="text-sm font-medium text-gray-500">Réservation créée le</span>
                  <p className="text-[#4A4A4A]">{new Date(booking.createdAt).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
              <div className="flex items-center">
                <div className="text-red-500 text-2xl mr-3">
                  <svg className="h-6 w-6 text-red-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M9.401 1.592a2.25 2.25 0 0 1 3.198 0l9.81 10.183c1.36 1.413.35 3.725-1.6 3.725H1.19c-1.95 0-2.96-2.312-1.6-3.725l9.81-10.183ZM12 7.5a.75.75 0 0 1 .75.75v5.25a.75.75 0 0 1-1.5 0V8.25A.75.75 0 0 1 12 7.5Zm0 9a1.125 1.125 0 1 0 0 2.25A1.125 1.125 0 0 0 12 16.5Z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-red-800">Confirmer l'annulation par le médecin</h3>
                  <p className="text-red-700 mt-1">
                    Êtes-vous sûr de vouloir annuler ce rendez-vous ? Le patient sera automatiquement notifié par email.
                  </p>
                </div>
              </div>
            </div>

            {/* Doctor Message Field */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">
                Message pour le patient (optionnel)
              </h3>
              <p className="text-blue-700 text-sm mb-4">
                Vous pouvez laisser un message personnalisé qui sera envoyé au patient dans l'email d'annulation.
              </p>
              <textarea
                value={doctorMessage}
                onChange={(e) => setDoctorMessage(e.target.value)}
                placeholder="Ex: Désolé pour ce contretemps. Je vous contacterai prochainement pour reprogrammer votre rendez-vous..."
                className="w-full p-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={4}
                maxLength={500}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-blue-600">
                  {doctorMessage.length}/500 caractères
                </span>
                <span className="text-xs text-gray-500">
                  Ce message sera inclus dans l'email d'annulation
                </span>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            <div className="flex space-x-4">
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {cancelling ? 'Annulation en cours...' : 'Confirmer l\'annulation'}
              </button>
              <a
                href={process.env.NEXT_PUBLIC_APP_URL || 'https://booking-p70q1smkx-hahababamama77-gmailcoms-projects.vercel.app/'}
                className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors text-center"
              >
                Annuler
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DoctorCancelPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F5F2E7] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066FF] mx-auto mb-4"></div>
          <p className="text-[#B4B4B4]">Chargement...</p>
        </div>
      </div>
    }>
      <DoctorCancelContent />
    </Suspense>
  )
}
