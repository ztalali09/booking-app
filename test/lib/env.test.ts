// test/lib/env.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'

describe('Environment Configuration', () => {
  const originalEnv = process.env

  beforeEach(() => {
    // Reset environment variables
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('should validate required environment variables', () => {
    // Set minimal required env vars
    process.env.DATABASE_URL = 'file:./test.db'
    process.env.ADMIN_PASSWORD = 'test-password-123'
    process.env.JWT_SECRET = 'test-jwt-secret-that-is-long-enough-for-validation'

    // This should not throw
    expect(() => {
      // Dynamically import to avoid caching issues
      delete require.cache[require.resolve('@/lib/env')]
      require('@/lib/env')
    }).not.toThrow()
  })

  it('should throw error for missing DATABASE_URL', () => {
    delete process.env.DATABASE_URL
    process.env.ADMIN_PASSWORD = 'test-password-123'
    process.env.JWT_SECRET = 'test-jwt-secret-that-is-long-enough-for-validation'

    expect(() => {
      delete require.cache[require.resolve('@/lib/env')]
      require('@/lib/env')
    }).toThrow('DATABASE_URL est requis')
  })

  it('should throw error for short ADMIN_PASSWORD', () => {
    process.env.DATABASE_URL = 'file:./test.db'
    process.env.ADMIN_PASSWORD = 'short'
    process.env.JWT_SECRET = 'test-jwt-secret-that-is-long-enough-for-validation'

    expect(() => {
      delete require.cache[require.resolve('@/lib/env')]
      require('@/lib/env')
    }).toThrow('ADMIN_PASSWORD doit contenir au moins 8 caractères')
  })

  it('should throw error for short JWT_SECRET', () => {
    process.env.DATABASE_URL = 'file:./test.db'
    process.env.ADMIN_PASSWORD = 'test-password-123'
    process.env.JWT_SECRET = 'short'

    expect(() => {
      delete require.cache[require.resolve('@/lib/env')]
      require('@/lib/env')
    }).toThrow('JWT_SECRET doit contenir au moins 32 caractères')
  })

  it('should set default values for optional variables', () => {
    process.env.DATABASE_URL = 'file:./test.db'
    process.env.ADMIN_PASSWORD = 'test-password-123'
    process.env.JWT_SECRET = 'test-jwt-secret-that-is-long-enough-for-validation'

    delete require.cache[require.resolve('@/lib/env')]
    const { env } = require('@/lib/env')

    expect(env.NEXT_PUBLIC_APP_URL).toBe('http://localhost:3000')
    expect(env.NODE_ENV).toBe('development')
    expect(env.GOOGLE_CALENDAR_CALENDAR_ID).toBe('primary')
  })

  it('should parse numeric environment variables', () => {
    process.env.DATABASE_URL = 'file:./test.db'
    process.env.ADMIN_PASSWORD = 'test-password-123'
    process.env.JWT_SECRET = 'test-jwt-secret-that-is-long-enough-for-validation'
    process.env.RATE_LIMIT_WINDOW_MS = '300000'
    process.env.RATE_LIMIT_MAX_REQUESTS = '10'

    delete require.cache[require.resolve('@/lib/env')]
    const { env } = require('@/lib/env')

    expect(env.RATE_LIMIT_WINDOW_MS).toBe(300000)
    expect(env.RATE_LIMIT_MAX_REQUESTS).toBe(10)
  })
})
