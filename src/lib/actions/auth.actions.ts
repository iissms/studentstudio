
'use server'

import { cookies } from 'next/headers';
import { loginSchema, type LoginFormValues } from '@/schemas/auth';
import type { User, UserRole } from '@/types';
import { redirect } from 'next/navigation';
import { SignJWT } from 'jose';
import { mockUsersDb, mockCreatedUsers } from '../mock-data';
import axios from 'axios';

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
  const validatedFields = loginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { success: false, error: 'Invalid input.' };
  }

  const { email, password } = validatedFields.data;

  try {
    // 🔐 Real login API call
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`, {
      email,
      password
    });

    const token = response.data.token;

    // ✅ Decode token if needed (optional)
    const payload = JSON.parse(atob(token.split('.')[1]));

    // 🍪 Set auth cookie
    (await
      // 🍪 Set auth cookie
      cookies()).set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return {
      success: true,
      user: {
        id: payload.user_id,
        name: payload.name || '',
        email: payload.email,
        role: payload.role,
        college_id: payload.college_id
      }
    };
  } catch (error: any) {
    console.error('Login failed:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || 'Invalid credentials'
    };
  }
}

export async function logoutUser() {
  (await cookies()).delete(AUTH_COOKIE_NAME);
  redirect('/login');
}
