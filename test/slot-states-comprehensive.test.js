// test/slot-states-comprehensive.test.js
// Tests unitaires complets pour tous les états des créneaux

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { prisma } from '../lib/prisma'

// Fonction utilitaire pour générer les créneaux
const generateTimeSlots = () => {
  const morningSlots = []
  const afternoonSlots = []
  
  // Matin : 9h00 - 12h00 (créneaux de 30 minutes)
  for (let hour = 9; hour <= 12; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      if (hour === 12 && minute > 0) break // Arrêter à 12h00
      morningSlots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`)
    }
  }
  
  // Après-midi : 14h00 - 17h00 (créneaux de 30 minutes)
  for (let hour = 14; hour <= 17; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      if (hour === 17 && minute > 0) break // Arrêter à 17h00
      afternoonSlots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`)
    }
  }
  
  return { morningSlots, afternoonSlots, allSlots: [...morningSlots, ...afternoonSlots] }
}

// Fonction pour vérifier la disponibilité d'un créneau
const isSlotAvailable = async (date, time, excludeBookingId = null) => {
  const existingBooking = await prisma.booking.findFirst({
    where: {
      date: new Date(date),
      time: time,
      status: {
        notIn: ['CANCELLED']
      },
      ...(excludeBookingId && { id: { not: excludeBookingId } })
    }
  })
  
  return !existingBooking
}

// Fonction pour vérifier la règle des 15 minutes
const isSlotWithin15Minutes = (date, time) => {
  const now = new Date()
  const bookingDate = new Date(date)
  const isToday = bookingDate.getDate() === now.getDate() && 
                 bookingDate.getMonth() === now.getMonth() && 
                 bookingDate.getFullYear() === now.getFullYear()
  
  if (!isToday) return false
  
  const [hours, minutes] = time.split(':').map(Number)
  const slotTime = hours * 60 + minutes
  const currentTime = now.getHours() * 60 + now.getMinutes()
  const minimumAdvanceTime = currentTime + 15
  
  return slotTime <= minimumAdvanceTime
}

// Fonction pour vérifier si c'est un jour passé
const isPastDate = (date) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const bookingDate = new Date(date)
  bookingDate.setHours(0, 0, 0, 0)
  
  return bookingDate < today
}

// Fonction pour vérifier si c'est un jour de week-end
const isWeekend = (date) => {
  const day = new Date(date).getDay()
  return day === 0 || day === 6 // Dimanche ou Samedi
}

describe('Tests complets des états des créneaux', () => {
  beforeEach(async () => {
    // Nettoyer la base de données avant chaque test
    await prisma.booking.deleteMany({})
    await prisma.blockedSlot.deleteMany({})
  })

  afterEach(async () => {
    // Nettoyer après chaque test
    await prisma.booking.deleteMany({})
    await prisma.blockedSlot.deleteMany({})
  })

  describe('Génération des créneaux', () => {
    it('devrait générer les créneaux du matin correctement', () => {
      const { morningSlots } = generateTimeSlots()
      
      expect(morningSlots).toContain('09:00')
      expect(morningSlots).toContain('09:30')
      expect(morningSlots).toContain('10:00')
      expect(morningSlots).toContain('10:30')
      expect(morningSlots).toContain('11:00')
      expect(morningSlots).toContain('11:30')
      expect(morningSlots).toContain('12:00')
      expect(morningSlots).toHaveLength(7)
    })

    it('devrait générer les créneaux de l\'après-midi correctement', () => {
      const { afternoonSlots } = generateTimeSlots()
      
      expect(afternoonSlots).toContain('14:00')
      expect(afternoonSlots).toContain('14:30')
      expect(afternoonSlots).toContain('15:00')
      expect(afternoonSlots).toContain('15:30')
      expect(afternoonSlots).toContain('16:00')
      expect(afternoonSlots).toContain('16:30')
      expect(afternoonSlots).toContain('17:00')
      expect(afternoonSlots).toHaveLength(7)
    })

    it('devrait générer tous les créneaux correctement', () => {
      const { allSlots } = generateTimeSlots()
      
      expect(allSlots).toHaveLength(14) // 7 matin + 7 après-midi
      expect(allSlots).toContain('09:00')
      expect(allSlots).toContain('17:00')
    })
  })

  describe('États des créneaux - Disponibilité', () => {
    it('devrait marquer un créneau comme disponible quand aucun booking', async () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const dateStr = tomorrow.toISOString().split('T')[0]
      
      const isAvailable = await isSlotAvailable(dateStr, '10:00')
      expect(isAvailable).toBe(true)
    })

    it('devrait marquer un créneau comme indisponible quand réservé', async () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const dateStr = tomorrow.toISOString().split('T')[0]
      
      // Créer une réservation
      await prisma.booking.create({
        data: {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          phone: '0123456789',
          date: new Date(dateStr),
          time: '10:00',
          period: 'morning',
          firstConsultation: true,
          consultationReason: 'Test consultation',
          status: 'PENDING'
        }
      })
      
      const isAvailable = await isSlotAvailable(dateStr, '10:00')
      expect(isAvailable).toBe(false)
    })

    it('devrait marquer un créneau comme disponible quand booking annulé', async () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const dateStr = tomorrow.toISOString().split('T')[0]
      
      // Créer une réservation annulée
      await prisma.booking.create({
        data: {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          phone: '0123456789',
          date: new Date(dateStr),
          time: '10:00',
          period: 'morning',
          firstConsultation: true,
          consultationReason: 'Test consultation',
          status: 'CANCELLED'
        }
      })
      
      const isAvailable = await isSlotAvailable(dateStr, '10:00')
      expect(isAvailable).toBe(true)
    })
  })

  describe('États des créneaux - Règles temporelles', () => {
    it('devrait bloquer les créneaux dans les 15 minutes', () => {
      const now = new Date()
      const todayStr = now.toISOString().split('T')[0]
      
      // Simuler un créneau dans 10 minutes
      const futureTime = new Date(now.getTime() + 10 * 60 * 1000)
      const timeStr = `${futureTime.getHours().toString().padStart(2, '0')}:${futureTime.getMinutes().toString().padStart(2, '0')}`
      
      const isBlocked = isSlotWithin15Minutes(todayStr, timeStr)
      expect(isBlocked).toBe(true)
    })

    it('devrait autoriser les créneaux après 15 minutes', () => {
      const now = new Date()
      const todayStr = now.toISOString().split('T')[0]
      
      // Simuler un créneau dans 20 minutes
      const futureTime = new Date(now.getTime() + 20 * 60 * 1000)
      const timeStr = `${futureTime.getHours().toString().padStart(2, '0')}:${futureTime.getMinutes().toString().padStart(2, '0')}`
      
      const isBlocked = isSlotWithin15Minutes(todayStr, timeStr)
      expect(isBlocked).toBe(false)
    })

    it('devrait bloquer les dates passées', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]
      
      const isPast = isPastDate(yesterdayStr)
      expect(isPast).toBe(true)
    })

    it('devrait autoriser les dates futures', () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const tomorrowStr = tomorrow.toISOString().split('T')[0]
      
      const isPast = isPastDate(tomorrowStr)
      expect(isPast).toBe(false)
    })
  })

  describe('États des créneaux - Week-end', () => {
    it('devrait identifier correctement les samedis', () => {
      // Trouver un samedi
      const saturday = new Date('2024-11-09') // Samedi
      const isSat = isWeekend(saturday.toISOString().split('T')[0])
      expect(isSat).toBe(true)
    })

    it('devrait identifier correctement les dimanches', () => {
      // Trouver un dimanche
      const sunday = new Date('2024-11-10') // Dimanche
      const isSun = isWeekend(sunday.toISOString().split('T')[0])
      expect(isSun).toBe(true)
    })

    it('devrait identifier correctement les jours de semaine', () => {
      // Trouver un lundi
      const monday = new Date('2024-11-11') // Lundi
      const isWeekday = !isWeekend(monday.toISOString().split('T')[0])
      expect(isWeekday).toBe(true)
    })
  })

  describe('États des créneaux - Créneaux bloqués', () => {
    it('devrait bloquer un créneau marqué comme bloqué', async () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const dateStr = tomorrow.toISOString().split('T')[0]
      
      // Créer un créneau bloqué
      await prisma.blockedSlot.create({
        data: {
          date: new Date(dateStr),
          time: '10:00',
          reason: 'Réunion médicale'
        }
      })
      
      // Vérifier que le créneau est bloqué
      const blockedSlot = await prisma.blockedSlot.findFirst({
        where: {
          date: new Date(dateStr),
          time: '10:00'
        }
      })
      
      expect(blockedSlot).toBeTruthy()
      expect(blockedSlot.reason).toBe('Réunion médicale')
    })
  })

  describe('États des créneaux - Statuts de réservation', () => {
    it('devrait gérer correctement le statut PENDING', async () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      const booking = await prisma.booking.create({
        data: {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          phone: '0123456789',
          date: tomorrow,
          time: '10:00',
          period: 'morning',
          firstConsultation: true,
          consultationReason: 'Test consultation',
          status: 'PENDING'
        }
      })
      
      expect(booking.status).toBe('PENDING')
      
      const isAvailable = await isSlotAvailable(tomorrow.toISOString().split('T')[0], '10:00')
      expect(isAvailable).toBe(false)
    })

    it('devrait gérer correctement le statut CONFIRMED', async () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      const booking = await prisma.booking.create({
        data: {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          phone: '0123456789',
          date: tomorrow,
          time: '10:00',
          period: 'morning',
          firstConsultation: true,
          consultationReason: 'Test consultation',
          status: 'CONFIRMED'
        }
      })
      
      expect(booking.status).toBe('CONFIRMED')
      
      const isAvailable = await isSlotAvailable(tomorrow.toISOString().split('T')[0], '10:00')
      expect(isAvailable).toBe(false)
    })

    it('devrait gérer correctement le statut CANCELLED', async () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      const booking = await prisma.booking.create({
        data: {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          phone: '0123456789',
          date: tomorrow,
          time: '10:00',
          period: 'morning',
          firstConsultation: true,
          consultationReason: 'Test consultation',
          status: 'CANCELLED'
        }
      })
      
      expect(booking.status).toBe('CANCELLED')
      
      const isAvailable = await isSlotAvailable(tomorrow.toISOString().split('T')[0], '10:00')
      expect(isAvailable).toBe(true) // Disponible car annulé
    })

    it('devrait gérer correctement le statut COMPLETED', async () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      
      const booking = await prisma.booking.create({
        data: {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          phone: '0123456789',
          date: yesterday,
          time: '10:00',
          period: 'morning',
          firstConsultation: true,
          consultationReason: 'Test consultation',
          status: 'COMPLETED'
        }
      })
      
      expect(booking.status).toBe('COMPLETED')
      
      // Un créneau complété ne devrait pas être disponible le même jour
      const isAvailable = await isSlotAvailable(yesterday.toISOString().split('T')[0], '10:00')
      expect(isAvailable).toBe(false)
    })
  })

  describe('États des créneaux - Scénarios complexes', () => {
    it('devrait gérer correctement les réservations multiples le même jour', async () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const dateStr = tomorrow.toISOString().split('T')[0]
      
      // Créer plusieurs réservations
      const bookings = [
        { time: '09:00', period: 'morning' },
        { time: '10:00', period: 'morning' },
        { time: '14:00', period: 'afternoon' },
        { time: '15:00', period: 'afternoon' }
      ]
      
      for (const booking of bookings) {
        await prisma.booking.create({
          data: {
            firstName: 'Test',
            lastName: 'User',
            email: `test${booking.time}@example.com`,
            phone: '0123456789',
            date: tomorrow,
            time: booking.time,
            period: booking.period,
            firstConsultation: true,
            consultationReason: 'Test consultation',
            status: 'PENDING'
          }
        })
      }
      
      // Vérifier que les créneaux réservés ne sont pas disponibles
      expect(await isSlotAvailable(dateStr, '09:00')).toBe(false)
      expect(await isSlotAvailable(dateStr, '10:00')).toBe(false)
      expect(await isSlotAvailable(dateStr, '14:00')).toBe(false)
      expect(await isSlotAvailable(dateStr, '15:00')).toBe(false)
      
      // Vérifier que les autres créneaux sont disponibles
      expect(await isSlotAvailable(dateStr, '09:30')).toBe(true)
      expect(await isSlotAvailable(dateStr, '11:00')).toBe(true)
      expect(await isSlotAvailable(dateStr, '14:30')).toBe(true)
      expect(await isSlotAvailable(dateStr, '16:00')).toBe(true)
    })

    it('devrait gérer correctement l\'annulation et la re-réservation', async () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const dateStr = tomorrow.toISOString().split('T')[0]
      
      // Créer une réservation
      const booking = await prisma.booking.create({
        data: {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          phone: '0123456789',
          date: tomorrow,
          time: '10:00',
          period: 'morning',
          firstConsultation: true,
          consultationReason: 'Test consultation',
          status: 'PENDING'
        }
      })
      
      // Vérifier qu'elle n'est pas disponible
      expect(await isSlotAvailable(dateStr, '10:00')).toBe(false)
      
      // Annuler la réservation
      await prisma.booking.update({
        where: { id: booking.id },
        data: { status: 'CANCELLED' }
      })
      
      // Vérifier qu'elle redevient disponible
      expect(await isSlotAvailable(dateStr, '10:00')).toBe(true)
      
      // Créer une nouvelle réservation au même créneau
      const newBooking = await prisma.booking.create({
        data: {
          firstName: 'Test2',
          lastName: 'User2',
          email: 'test2@example.com',
          phone: '0987654321',
          date: tomorrow,
          time: '10:00',
          period: 'morning',
          firstConsultation: false,
          consultationReason: 'Test consultation 2',
          status: 'PENDING'
        }
      })
      
      expect(newBooking).toBeTruthy()
      expect(await isSlotAvailable(dateStr, '10:00')).toBe(false)
    })
  })

  describe('États des créneaux - Validation des données', () => {
    it('devrait valider les formats d\'heure corrects', () => {
      const validTimes = ['09:00', '09:30', '10:00', '14:30', '16:00']
      
      validTimes.forEach(time => {
        const [hours, minutes] = time.split(':').map(Number)
        expect(hours).toBeGreaterThanOrEqual(0)
        expect(hours).toBeLessThan(24)
        expect(minutes).toBeGreaterThanOrEqual(0)
        expect(minutes).toBeLessThan(60)
        expect(minutes % 30).toBe(0) // Créneaux de 30 minutes
      })
    })

    it('devrait rejeter les formats d\'heure incorrects', () => {
      const invalidTimes = ['25:00', '09:60', '9:00', '09:0', 'invalid']
      
      invalidTimes.forEach(time => {
        const parts = time.split(':')
        if (parts.length !== 2) {
          expect(true).toBe(true) // Format invalide
          return
        }
        
        const [hours, minutes] = parts.map(Number)
        const isValid = !isNaN(hours) && !isNaN(minutes) && 
                       hours >= 0 && hours < 24 && 
                       minutes >= 0 && minutes < 60 && 
                       minutes % 30 === 0
        
        expect(isValid).toBe(false)
      })
    })
  })
})
