
import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'
import type { User, UserRole } from '@/types'

// This is a placeholder. In a real app, you'd verify and decode the JWT.
// The backend is responsible for setting HttpOnly cookies.
// This function simulates getting user data that might be stored in a session or decoded from a JWT.
// For Next.js App Router, direct cookie access is available in Server Components & Actions.

// Removed MOCK_AUTH_COOKIE_NAME from module scope

interface MockSessionData {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

// Simulates decoding a JWT or getting session data from a cookie
// In a real app, this would involve JWT verification if the token itself contains user data,
// or a call to a /me endpoint if the cookie is just an opaque session ID.
function decodeMockToken(token: string): MockSessionData | null {
  try {
    // Super simple "mock" decoding: expects "email:role:name:id"
    const parts = token.split(':');
    if (parts.length === 4) {
      return { email: parts[0], role: parts[1] as UserRole, name: parts[2], id: parts[3] };
    }
    return null;
  } catch (error) {
    console.error("Failed to decode mock token", error);
    return null;
  }
}

export async function getUserFromCookies(
  cookies: ReadonlyRequestCookies
): Promise<User | null> {
  const MOCK_AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'meritmatrix_session_token'
  const tokenCookie = cookies.get(MOCK_AUTH_COOKIE_NAME)

  if (!tokenCookie || !tokenCookie.value) {
    return null
  }

  // In a real app, you would verify the JWT here or use it to fetch user data from your backend.
  // For this example, we'll use a mock decoding.
  const decodedData = decodeMockToken(tokenCookie.value);

  if (!decodedData) {
    return null;
  }
  
  return {
    id: decodedData.id,
    name: decodedData.name,
    email: decodedData.email,
    role: decodedData.role,
  }
}

// This function would typically be part of a server action on login.
// It simulates what might be stored in a cookie value for this mock setup.
export function createMockToken(email: string, role: UserRole, name: string, id: string): string {
  return `${email}:${role}:${name}:${id}`;
}
