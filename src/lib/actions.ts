'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { loginSchema, type LoginFormValues } from '@/schemas/auth'
import type { UserRole } from '@/types'
import { createMockToken } from '@/lib/auth-utils'

// In a real app, this URL would come from .env
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
const MOCK_AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'meritmatrix_session_token'


export async function loginUser(values: LoginFormValues) {
  const validatedFields = loginSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: 'Invalid fields.', success: false }
  }

  const { email, password } = validatedFields.data

  try {
    // Simulate API call
    // const response = await fetch(`${API_BASE_URL}/auth/login`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ email, password }),
    // })

    // if (!response.ok) {
    //   const errorData = await response.json()
    //   return { error: errorData.message || 'Login failed.', success: false }
    // }

    // // Backend is expected to set HttpOnly cookie.
    // // The response might contain user data.
    // const userData = await response.json() // e.g., { user: { id, name, email, role }, token (if not HttpOnly) }
    
    // Mock successful login
    let role: UserRole = 'STUDENT'
    let name = 'Student User'
    let id = 'student123'

    if (email === 'admin@example.com') {
      role = 'ADMIN'
      name = 'Admin User'
      id = 'admin001'
    } else if (email === 'collegeadmin@example.com') {
      role = 'COLLEGE_ADMIN'
      name = 'College Admin User'
      id = 'cadmin001'
    } else if (email === 'teacher@example.com') {
      role = 'TEACHER'
      name = 'Teacher User'
      id = 'teacher001'
    }

    // For this mock, we set a simple cookie representing the session.
    // In a real app with HttpOnly cookies set by the backend, this frontend cookie might not be necessary
    // or could store non-sensitive UI preferences or a flag.
    // Here, it's used by `getUserFromCookies` for mock purposes.
    const mockTokenValue = createMockToken(email, role, name, id);
    cookies().set(MOCK_AUTH_COOKIE_NAME, mockTokenValue, {
      httpOnly: true, // Still good practice even for mock, though middleware will read it
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    })

    // Return success, redirection will be handled by middleware or client-side effect
    return { success: true, error: null, role }

  } catch (error) {
    console.error('Login action error:', error)
    return { error: 'An unexpected error occurred.', success: false }
  }
}

export async function logoutUser() {
  try {
    // Simulate API call to backend logout endpoint which would clear HttpOnly cookie
    // await fetch(`${API_BASE_URL}/auth/logout`, { method: 'POST' })
  } catch (error) {
    console.error('Logout API call failed:', error)
    // Even if API call fails, proceed to clear local session representation
  }
  
  cookies().delete(MOCK_AUTH_COOKIE_NAME)
  redirect('/login')
}
