
'use server'

import { cookies } from 'next/headers'
import { loginSchema, type LoginFormValues } from '@/schemas/auth'
import type { User, UserRole } from '@/types'
import { redirect } from 'next/navigation'
import { SignJWT } from 'jose'

// Mock users
const mockUsers: Record<string, Omit<User, 'id' | 'email'> & { email: string, passwordSimple: string }> = {
  'admin@example.com': { name: 'Admin User', email: 'admin@example.com', role: 'ADMIN', passwordSimple: 'admin123' }, // Specific password for admin
  'collegeadmin@example.com': { name: 'College Admin', email: 'collegeadmin@example.com', role: 'COLLEGE_ADMIN', passwordSimple: 'password' },
  'teacher@example.com': { name: 'Teacher User', email: 'teacher@example.com', role: 'TEACHER', passwordSimple: 'password' },
  'student@example.com': { name: 'Student User', email: 'student@example.com', role: 'STUDENT', passwordSimple: 'password' },
};

// Function to create a mock JWT
async function createMockToken(userPayload: {
  user_id: number; // JWTs often use numeric IDs
  role: UserRole;
  name: string | null;
  email: string | null;
}): Promise<string> {
  const MOCK_JWT_SECRET = process.env.MOCK_JWT_SECRET || 'super-secret-mock-jwt-key-32-chars-long'; // Ensure it's at least 32 chars for HS256
  const secret = new TextEncoder().encode(MOCK_JWT_SECRET);
  const alg = 'HS256';

  return await new SignJWT({ ...userPayload })
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime('7d') // Token valid for 7 days
    .sign(secret);
}

export async function loginUser(
  values: LoginFormValues
): Promise<{ success: boolean; error?: string; user?: User }> {
  const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'meritmatrix_session_token'

  const validatedFields = loginSchema.safeParse(values)

  if (!validatedFields.success) {
    return { success: false, error: 'Invalid input.' }
  }

  const { email, password } = validatedFields.data

  let userToAuth: (Omit<User, 'id'> & { id: string }) | null = null;

  const specificMockUser = mockUsers[email];

  if (specificMockUser && specificMockUser.passwordSimple === password) {
    userToAuth = { ...specificMockUser, id: String(Object.keys(mockUsers).indexOf(email) + 1) }; // Assign a mock numeric ID string
  } else if (!specificMockUser && (password === 'password' || password === 'admin123' || password === 'Test@123')) {
    // Fallback for any other email with a generic password, treat as STUDENT
    // This covers the "student@example.com" / "password" case if not explicitly in mockUsers,
    // or any other new email entered with "password".
    userToAuth = {
      id: String(Date.now()), // Generate a unique mock ID
      name: `User ${email.split('@')[0]}`,
      email: email,
      role: 'STUDENT',
    };
  }

  if (userToAuth) {
    // Prepare payload for mock JWT
    const jwtPayload = {
      user_id: parseInt(userToAuth.id, 10) || Date.now(), // Ensure user_id is a number
      role: userToAuth.role,
      name: userToAuth.name,
      email: userToAuth.email,
    };

    try {
      const token = await createMockToken(jwtPayload);
      cookies().set(AUTH_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });
      // Return the User object structure expected by the frontend
      return { success: true, user: {
        id: userToAuth.id,
        name: userToAuth.name,
        email: userToAuth.email,
        role: userToAuth.role
      }};
    } catch (error) {
      console.error('Failed to create mock token:', error);
      return { success: false, error: 'Failed to prepare session.' };
    }
  }

  return { success: false, error: 'Invalid credentials.' }
}

export async function logoutUser() {
  const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'meritmatrix_session_token'
  cookies().delete(AUTH_COOKIE_NAME, {
    path: '/',
  });
  redirect('/login')
}
