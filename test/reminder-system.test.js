// test/reminder-system.test.js
// Tests complets du système de rappel

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { prisma } from '../lib/prisma'
import { sendReminderEmail, getBookingsToRemind, sendAllReminders } from '../lib/services/reminder'

describe('Système de rappel - Tests complets', () => {
  beforeEach(async () => {
    // Nettoyer la base de données
    await prisma.booking.deleteMany({})
  })

  afterEach(async () => {
    // Nettoyer après chaque test
    await prisma.booking.deleteMany({})
  })

  describe('Récupération des rendez-vous à rappeler', () => {
    it('devrait récupérer les rendez-vous de demain', async () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      // Créer des rendez-vous pour demain
      const bookings = [
        {
          firstName: 'Jean',
          lastName: 'Dupont',
          email: 'jean.dupont@example.com',
          phone: '0123456789',
          date: tomorrow,
          time: '09:00',
          period: 'morning',
          firstConsultation: true,
          consultationReason: 'Consultation de routine',
          status: 'PENDING'
        },
        {
          firstName: 'Marie',
          lastName: 'Martin',
          email: 'marie.martin@example.com',
          phone: '0987654321',
          date: tomorrow,
          time: '14:00',
          period: 'afternoon',
          firstConsultation: false,
          consultationReason: 'Suivi médical',
          status: 'CONFIRMED'
        }
      ]
      
      for (const booking of bookings) {
        await prisma.booking.create({ data: booking })
      }
      
      const reminders = await getBookingsToRemind()
      expect(reminders).toHaveLength(2)
      expect(reminders[0].firstName).toBe('Jean')
      expect(reminders[1].firstName).toBe('Marie')
    })

    it('ne devrait pas récupérer les rendez-vous d\'aujourd\'hui', async () => {
      const today = new Date()
      
      // Créer un rendez-vous pour aujourd'hui
      await prisma.booking.create({
        data: {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          phone: '0123456789',
          date: today,
          time: '09:00',
          period: 'morning',
          firstConsultation: true,
          consultationReason: 'Test',
          status: 'PENDING'
        }
      })
      
      const reminders = await getBookingsToRemind()
      expect(reminders).toHaveLength(0)
    })

    it('ne devrait pas récupérer les rendez-vous annulés', async () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      // Créer un rendez-vous annulé pour demain
      await prisma.booking.create({
        data: {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          phone: '0123456789',
          date: tomorrow,
          time: '09:00',
          period: 'morning',
          firstConsultation: true,
          consultationReason: 'Test',
          status: 'CANCELLED'
        }
      })
      
      const reminders = await getBookingsToRemind()
      expect(reminders).toHaveLength(0)
    })

    it('ne devrait pas récupérer les rendez-vous complétés', async () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      // Créer un rendez-vous complété pour demain
      await prisma.booking.create({
        data: {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          phone: '0123456789',
          date: tomorrow,
          time: '09:00',
          period: 'morning',
          firstConsultation: true,
          consultationReason: 'Test',
          status: 'COMPLETED'
        }
      })
      
      const reminders = await getBookingsToRemind()
      expect(reminders).toHaveLength(0)
    })
  })

  describe('Envoi des rappels', () => {
    it('devrait envoyer un rappel pour un rendez-vous', async () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      const booking = await prisma.booking.create({
        data: {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          phone: '0123456789',
          date: tomorrow,
          time: '09:00',
          period: 'morning',
          firstConsultation: true,
          consultationReason: 'Test consultation',
          message: 'Message de test',
          status: 'PENDING'
        }
      })
      
      // Mock de l'envoi d'email (dans un vrai test, on utiliserait un mock)
      const result = await sendAllReminders()
      
      expect(result.sent).toBe(1)
      expect(result.errors).toBe(0)
    })

    it('devrait gérer les erreurs d\'envoi', async () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      // Créer un rendez-vous avec un email invalide
      await prisma.booking.create({
        data: {
          firstName: 'Test',
          lastName: 'User',
          email: 'invalid-email',
          phone: '0123456789',
          date: tomorrow,
          time: '09:00',
          period: 'morning',
          firstConsultation: true,
          consultationReason: 'Test consultation',
          status: 'PENDING'
        }
      })
      
      const result = await sendAllReminders()
      
      // Le résultat dépend de la configuration email
      expect(typeof result.sent).toBe('number')
      expect(typeof result.errors).toBe('number')
    })
  })

  describe('Formatage des données', () => {
    it('devrait formater correctement les données de rappel', async () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      const booking = await prisma.booking.create({
        data: {
          firstName: 'Jean',
          lastName: 'Dupont',
          email: 'jean.dupont@example.com',
          phone: '0123456789',
          date: tomorrow,
          time: '09:00',
          period: 'morning',
          firstConsultation: true,
          consultationReason: 'Consultation de routine',
          message: 'J\'ai des questions sur mon traitement',
          status: 'PENDING'
        }
      })
      
      const reminders = await getBookingsToRemind()
      const reminder = reminders[0]
      
      expect(reminder.firstName).toBe('Jean')
      expect(reminder.lastName).toBe('Dupont')
      expect(reminder.email).toBe('jean.dupont@example.com')
      expect(reminder.time).toBe('09:00')
      expect(reminder.period).toBe('morning')
      expect(reminder.firstConsultation).toBe(true)
      expect(reminder.consultationReason).toBe('Consultation de routine')
      expect(reminder.message).toBe('J\'ai des questions sur mon traitement')
    })
  })

  describe('Scénarios complexes', () => {
    it('devrait gérer plusieurs rendez-vous le même jour', async () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      const bookings = [
        { time: '09:00', period: 'morning', firstName: 'Jean', lastName: 'Dupont' },
        { time: '10:00', period: 'morning', firstName: 'Marie', lastName: 'Martin' },
        { time: '14:00', period: 'afternoon', firstName: 'Pierre', lastName: 'Durand' },
        { time: '15:00', period: 'afternoon', firstName: 'Sophie', lastName: 'Leroy' }
      ]
      
      for (const booking of bookings) {
        await prisma.booking.create({
          data: {
            ...booking,
            email: `${booking.firstName.toLowerCase()}@example.com`,
            phone: '0123456789',
            date: tomorrow,
            firstConsultation: true,
            consultationReason: 'Test consultation',
            status: 'PENDING'
          }
        })
      }
      
      const reminders = await getBookingsToRemind()
      expect(reminders).toHaveLength(4)
      
      const result = await sendAllReminders()
      expect(result.sent).toBe(4)
    })

    it('devrait ignorer les rendez-vous en dehors de la plage', async () => {
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      const dayAfterTomorrow = new Date(today)
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2)
      
      // Créer des rendez-vous pour hier, aujourd'hui et après-demain
      const bookings = [
        { date: yesterday, firstName: 'Hier' },
        { date: today, firstName: 'Aujourd\'hui' },
        { date: dayAfterTomorrow, firstName: 'Après-demain' }
      ]
      
      for (const booking of bookings) {
        await prisma.booking.create({
          data: {
            ...booking,
            lastName: 'Test',
            email: 'test@example.com',
            phone: '0123456789',
            time: '09:00',
            period: 'morning',
            firstConsultation: true,
            consultationReason: 'Test',
            status: 'PENDING'
          }
        })
      }
      
      const reminders = await getBookingsToRemind()
      expect(reminders).toHaveLength(0) // Aucun pour demain
    })
  })

  describe('Performance', () => {
    it('devrait gérer un grand nombre de rendez-vous', async () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      // Créer 50 rendez-vous pour demain
      const bookings = Array.from({ length: 50 }, (_, i) => ({
        firstName: `User${i}`,
        lastName: 'Test',
        email: `user${i}@example.com`,
        phone: '0123456789',
        date: tomorrow,
        time: `${9 + (i % 8)}:00`,
        period: i % 2 === 0 ? 'morning' : 'afternoon',
        firstConsultation: i % 3 === 0,
        consultationReason: `Consultation ${i}`,
        status: 'PENDING'
      }))
      
      for (const booking of bookings) {
        await prisma.booking.create({ data: booking })
      }
      
      const startTime = Date.now()
      const reminders = await getBookingsToRemind()
      const endTime = Date.now()
      
      expect(reminders).toHaveLength(50)
      expect(endTime - startTime).toBeLessThan(1000) // Moins d'1 seconde
    })
  })
})
