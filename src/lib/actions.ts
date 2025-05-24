
'use server'

import { cookies } from 'next/headers'
import { loginSchema, type LoginFormValues } from '@/schemas/auth'
import type { User } from '@/types'
import { redirect } from 'next/navigation'
import type { SignJWT, JWTPayload } from 'jose' // Ensure jose types are available if used for signing, though not directly here.

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
    // The token might be in the response body (as per user's example), but we rely on the HttpOnly cookie being set by the backend.
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
  
  // Use cookies().delete() to remove the cookie.
  // This is a more direct method than setting an expired cookie.
  // The options should match how the cookie was set, especially 'path'.
  cookies().delete(AUTH_COOKIE_NAME, {
    path: '/',
    // httpOnly and secure flags are not specified for delete by default,
    // but path is crucial. If domain or secure was used when setting,
    // they might be needed here too for some browsers/scenarios.
    // For HttpOnly cookies, the browser handles deletion based on name, path, domain.
  });

  // Redirect to login page after logout
  redirect('/login')
}

