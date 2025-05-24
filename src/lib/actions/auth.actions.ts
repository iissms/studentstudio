
'use server'

import { cookies } from 'next/headers';
import { loginSchema, type LoginFormValues } from '@/schemas/auth';
import type { User, UserRole } from '@/types';
import { redirect } from 'next/navigation';
import { SignJWT } from 'jose';
import { mockUsersDb, mockCreatedUsers } from '../mock-data';

const MOCK_JWT_SECRET_KEY = process.env.MOCK_JWT_SECRET || 'super-secret-mock-jwt-key-32-chars-long-for-app';
const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'meritmatrix_session_token';

async function createMockJwtToken(payload: {
  user_id: number; // Changed to number to match expected JWT payload
  role: UserRole;
  name: string | null;
  email: string | null;
  college_id?: number;
}): Promise<string> {
  const secret = new TextEncoder().encode(MOCK_JWT_SECRET_KEY);
  const alg = 'HS256';

  return await new SignJWT(payload)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime('7d') 
    .sign(secret);
}

export async function loginUser(
  values: LoginFormValues
): Promise<{ success: boolean; error?: string; user?: User }> {
  console.log("Attempting login with mock data logic for:", values.email);
  const validatedFields = loginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { success: false, error: 'Invalid input.' };
  }

  const { email, password } = validatedFields.data;

  let userToAuthData = mockUsersDb[email];

  // Check mockCreatedUsers if not found in mockUsersDb
  if (!userToAuthData) {
      const createdUser = mockCreatedUsers.find(u => u.email === email);
      if (createdUser) {
          userToAuthData = {
              ...createdUser, 
              id: createdUser.id, 
              passwordSimple: createdUser.password, 
          };
      }
  }
  
  if (!userToAuthData && (password === 'password' || password === 'admin123' || password === 'Test@123')) {
    console.log(`Fallback login for ${email} as STUDENT`);
    userToAuthData = {
      id: String(Date.now()), 
      name: `User ${email.split('@')[0]}`,
      email: email,
      role: 'STUDENT', 
      passwordSimple: password,
      college_id: 1, 
    };
  }

  if (userToAuthData && userToAuthData.passwordSimple === password) {
    const jwtPayload = {
      user_id: parseInt(userToAuthData.id, 10), // Convert string id to number for JWT
      role: userToAuthData.role,
      name: userToAuthData.name,
      email: userToAuthData.email,
      college_id: userToAuthData.college_id,
    };

    try {
      const token = await createMockJwtToken(jwtPayload);
      cookies().set(AUTH_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, 
      });
      console.log("Login successful, mock token set for:", userToAuthData.email);
      return {
        success: true, user: {
          id: userToAuthData.id, 
          name: userToAuthData.name,
          email: userToAuthData.email,
          role: userToAuthData.role,
          college_id: userToAuthData.college_id,
        }
      };
    } catch (error) {
      console.error('Failed to create mock token:', error);
      return { success: false, error: 'Failed to prepare session.' };
    }
  }
  console.log("Login failed for:", values.email);
  return { success: false, error: 'Invalid credentials.' };
}

export async function logoutUser() {
  cookies().delete(AUTH_COOKIE_NAME, { path: '/' });
  redirect('/login');
}
