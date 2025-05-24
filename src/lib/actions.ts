
'use server'

import { cookies } from 'next/headers'
import { loginSchema, type LoginFormValues } from '@/schemas/auth'
import type { User } from '@/types'
import { redirect } from 'next/navigation'

// It's better to read env variables inside the function if they might not be available at module load time in all environments.
// However, for server actions, they are generally available.

export async function loginUser(
  values: LoginFormValues
): Promise<{ success: boolean; error?: string; user?: User }> {
  const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'meritmatrix_session_token'
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:5007/api'

  const validatedFields = loginSchema.safeParse(values)

  if (!validatedFields.success) {
    return { success: false, error: 'Invalid input.' }
  }

  const { email, password } = validatedFields.data

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      // Attempt to parse error response from backend
      let errorData = { message: `Login failed with status: ${response.status}` };
      try {
        errorData = await response.json();
      } catch (e) {
        // Backend didn't return JSON or it was malformed
        console.error('Could not parse error response JSON:', e);
      }
      console.error('Login API error:', response.status, errorData);
      return {
        success: false,
        error: errorData.message || `Login failed. Status: ${response.status}`,
      }
    }

    // Backend is expected to set the HttpOnly cookie.
    // The token might be in the response body, but we rely on the cookie being set.
    // If your backend sets the cookie correctly, no further action is needed here regarding the token.
    // const responseData = await response.json(); // Contains { token: "..." }
    // We don't need to manually set the cookie here if the backend does it via Set-Cookie header.

    return { success: true }
  } catch (error) {
    console.error('Login request failed:', error)
    if (error instanceof Error) {
        return { success: false, error: error.message || 'An unexpected network error occurred.' };
    }
    return { success: false, error: 'An unexpected error occurred during login.' }
  }
}

export async function logoutUser() {
  const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'meritmatrix_session_token'
  // Instruct the browser to clear the cookie by setting it to an empty value and a past expiry date
  cookies().set(AUTH_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(0),
    path: '/',
    sameSite: 'lax', // or 'strict' depending on your requirements
  })
  // Redirect to login page after logout
  redirect('/login')
}
