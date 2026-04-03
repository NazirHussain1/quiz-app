// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock environment variables
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only'
process.env.MONGODB_URI = 'mongodb://localhost:27017/quizapp-test'
process.env.NEXTAUTH_URL = 'http://localhost:3000'
process.env.NEXTAUTH_SECRET = 'test-nextauth-secret-key-for-testing'
process.env.EMAIL_HOST = 'smtp.test.com'
process.env.EMAIL_PORT = '587'
process.env.EMAIL_USER = 'test@test.com'
process.env.EMAIL_PASSWORD = 'test-password'
process.env.EMAIL_FROM = 'Test <test@test.com>'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    }
  },
  useSearchParams() {
    return {
      get: jest.fn(),
    }
  },
  usePathname() {
    return ''
  },
}))

// Suppress console errors in tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
}
