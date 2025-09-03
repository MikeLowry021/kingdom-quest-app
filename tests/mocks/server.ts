import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { mockStories } from '../fixtures/stories'
import { mockQuizzes } from '../fixtures/quizzes'
import { mockPrayers } from '../fixtures/prayers'
import { mockUsers } from '../fixtures/users'

// Mock API handlers for testing
export const handlers = [
  // Stories API
  http.get('/api/stories', () => {
    return HttpResponse.json({ data: mockStories })
  }),
  
  http.get('/api/stories/:id', ({ params }) => {
    const story = mockStories.find(s => s.id === params.id)
    return story ? HttpResponse.json({ data: story }) : new HttpResponse(null, { status: 404 })
  }),

  // Quizzes API
  http.get('/api/quizzes', () => {
    return HttpResponse.json({ data: mockQuizzes })
  }),
  
  http.get('/api/quizzes/:id', ({ params }) => {
    const quiz = mockQuizzes.find(q => q.id === params.id)
    return quiz ? HttpResponse.json({ data: quiz }) : new HttpResponse(null, { status: 404 })
  }),

  // Prayers API
  http.get('/api/prayers', () => {
    return HttpResponse.json({ data: mockPrayers })
  }),

  // Authentication API
  http.post('/auth/v1/token', async ({ request }) => {
    const body = await request.json()
    const mockUser = mockUsers.find(u => u.email === body.email)
    
    if (mockUser) {
      return HttpResponse.json({
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        user: mockUser
      })
    }
    
    return new HttpResponse(null, { status: 400 })
  }),

  // User profile API
  http.get('/api/user/profile', () => {
    return HttpResponse.json({ data: mockUsers[0] })
  }),

  // Content validation API
  http.post('/api/validate/content', async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({
      isValid: true,
      violations: [],
      warnings: []
    })
  }),

  // Theology validation API
  http.post('/api/validate/theology', async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({
      isValid: true,
      scriptureAccurate: true,
      translationCorrect: true,
      doctrinallySound: true
    })
  })
]

export const server = setupServer(...handlers)