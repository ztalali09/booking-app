// test/lib/rate-limit.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { rateLimit, getClientIP } from '@/lib/rate-limit'
import { NextRequest } from 'next/server'

describe('Rate Limiting', () => {
  beforeEach(() => {
    // Reset the requests map before each test
    vi.clearAllMocks()
  })

  describe('getClientIP', () => {
    it('should extract IP from x-forwarded-for header', () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          'x-forwarded-for': '192.168.1.1, 10.0.0.1',
        },
      })
      
      expect(getClientIP(request)).toBe('192.168.1.1')
    })

    it('should extract IP from x-real-ip header', () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          'x-real-ip': '192.168.1.2',
        },
      })
      
      expect(getClientIP(request)).toBe('192.168.1.2')
    })

    it('should return unknown if no IP headers found', () => {
      const request = new NextRequest('http://localhost:3000/api/test')
      
      expect(getClientIP(request)).toBe('unknown')
    })
  })

  describe('rateLimit', () => {
    it('should allow requests within limit', () => {
      const limiter = rateLimit({
        windowMs: 60000, // 1 minute
        maxRequests: 5,
      })

      const request = new NextRequest('http://localhost:3000/api/test')
      
      const result1 = limiter(request)
      expect(result1.success).toBe(true)
      expect(result1.remaining).toBe(4)

      const result2 = limiter(request)
      expect(result2.success).toBe(true)
      expect(result2.remaining).toBe(3)
    })

    it('should block requests when limit exceeded', () => {
      const limiter = rateLimit({
        windowMs: 60000, // 1 minute
        maxRequests: 2,
      })

      const request = new NextRequest('http://localhost:3000/api/test')
      
      // First two requests should succeed
      expect(limiter(request).success).toBe(true)
      expect(limiter(request).success).toBe(true)
      
      // Third request should be blocked
      const result = limiter(request)
      expect(result.success).toBe(false)
      expect(result.remaining).toBe(0)
    })

    it('should reset counter after window expires', async () => {
      const limiter = rateLimit({
        windowMs: 100, // 100ms
        maxRequests: 1,
      })

      const request = new NextRequest('http://localhost:3000/api/test')
      
      // First request should succeed
      expect(limiter(request).success).toBe(true)
      
      // Second request should be blocked
      expect(limiter(request).success).toBe(false)
      
      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 150))
      
      // Request should succeed again
      expect(limiter(request).success).toBe(true)
    })

    it('should use custom key generator', () => {
      const limiter = rateLimit({
        windowMs: 60000,
        maxRequests: 2,
        keyGenerator: (req) => 'custom-key',
      })

      const request1 = new NextRequest('http://localhost:3000/api/test')
      const request2 = new NextRequest('http://localhost:3000/api/test')
      
      // Both requests should share the same limit
      expect(limiter(request1).success).toBe(true)
      expect(limiter(request2).success).toBe(true)
      
      // Third request should be blocked
      expect(limiter(request1).success).toBe(false)
    })
  })
})
