// test/lib/validations.test.ts
import { describe, it, expect } from 'vitest'
import { createBookingSchema } from '@/lib/validations/booking'

describe('Booking Validation', () => {
  describe('createBookingSchema', () => {
    it('should validate correct booking data', () => {
      const validData = {
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean.dupont@example.com',
        phone: '0123456789',
        country: 'FR',
        date: '2025-12-25T10:00:00.000Z',
        time: '10:00',
        period: 'morning',
        firstConsultation: true,
        message: 'Première consultation',
      }

      const result = createBookingSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid email', () => {
      const invalidData = {
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'invalid-email',
        phone: '0123456789',
        country: 'FR',
        date: '2025-12-25T10:00:00.000Z',
        time: '10:00',
        period: 'morning',
        firstConsultation: true,
      }

      const result = createBookingSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Email invalide')
      }
    })

    it('should reject short names', () => {
      const invalidData = {
        firstName: 'J', // Too short
        lastName: 'Dupont',
        email: 'jean.dupont@example.com',
        phone: '0123456789',
        country: 'FR',
        date: '2025-12-25T10:00:00.000Z',
        time: '10:00',
        period: 'morning',
        firstConsultation: true,
      }

      const result = createBookingSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('au moins 2 caractères')
      }
    })

    it('should reject invalid time format', () => {
      const invalidData = {
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean.dupont@example.com',
        phone: '0123456789',
        country: 'FR',
        date: '2025-12-25T10:00:00.000Z',
        time: '25:00', // Invalid time
        period: 'morning',
        firstConsultation: true,
      }

      const result = createBookingSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Format d\'heure invalide')
      }
    })

    it('should reject invalid period', () => {
      const invalidData = {
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean.dupont@example.com',
        phone: '0123456789',
        country: 'FR',
        date: '2025-12-25T10:00:00.000Z',
        time: '10:00',
        period: 'evening', // Invalid period
        firstConsultation: true,
      }

      const result = createBookingSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should accept optional message', () => {
      const validData = {
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean.dupont@example.com',
        phone: '0123456789',
        country: 'FR',
        date: '2025-12-25T10:00:00.000Z',
        time: '10:00',
        period: 'morning',
        firstConsultation: true,
        // message is optional
      }

      const result = createBookingSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should set default country to FR', () => {
      const dataWithoutCountry = {
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean.dupont@example.com',
        phone: '0123456789',
        date: '2025-12-25T10:00:00.000Z',
        time: '10:00',
        period: 'morning',
        firstConsultation: true,
      }

      const result = createBookingSchema.safeParse(dataWithoutCountry)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.country).toBe('FR')
      }
    })
  })
})

