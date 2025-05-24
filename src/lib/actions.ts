
'use server'

import { cookies } from 'next/headers'
import { loginSchema, type LoginFormValues } from '@/schemas/auth'
import type { CreateCollegeFormValues } from '@/schemas/college'; // New import
import type { User, UserRole } from '@/types'
import { redirect } from 'next/navigation'
import { SignJWT, jwtVerify } from 'jose' // jwtVerify might not be needed if backend sets cookie
import { revalidatePath } from 'next/cache'; // New import

// Mock users for login
const mockUsers: Record<string, Omit<User, 'id' | 'email'> & { email: string, passwordSimple: string }> = {
  'admin@example.com': { name: 'Admin User', email: 'admin@example.com', role: 'ADMIN', passwordSimple: 'admin123' },
  'collegeadmin@example.com': { name: 'College Admin', email: 'collegeadmin@example.com', role: 'COLLEGE_ADMIN', passwordSimple: 'password' },
  'teacher@example.com': { name: 'Teacher User', email: 'teacher@example.com', role: 'TEACHER', passwordSimple: 'password' },
  'student@example.com': { name: 'Student User', email: 'student@example.com', role: 'STUDENT', passwordSimple: 'password' },
};

async function createMockToken(userPayload: {
  user_id: number;
  role: UserRole;
  name: string | null;
  email: string | null;
}): Promise<string> {
  const MOCK_JWT_SECRET = process.env.MOCK_JWT_SECRET || 'super-secret-mock-jwt-key-32-chars-long';
  const secret = new TextEncoder().encode(MOCK_JWT_SECRET);
  const alg = 'HS256';

  return await new SignJWT({ ...userPayload })
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}

export async function loginUser(
  values: LoginFormValues
): Promise<{ success: boolean; error?: string; user?: User }> {
  const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'meritmatrix_session_token';
  const validatedFields = loginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { success: false, error: 'Invalid input.' };
  }

  const { email, password } = validatedFields.data;
  let userToAuth: (Omit<User, 'id'> & { id: string }) | null = null;
  const specificMockUser = mockUsers[email];

  if (specificMockUser && specificMockUser.passwordSimple === password) {
    userToAuth = { ...specificMockUser, id: String(Object.keys(mockUsers).indexOf(email) + 1) };
  } else if (!specificMockUser && (password === 'password' || password === 'admin123' || password === 'Test@123')) {
    userToAuth = {
      id: String(Date.now()),
      name: `User ${email.split('@')[0]}`,
      email: email,
      role: 'STUDENT',
    };
  }

  if (userToAuth) {
    const jwtPayload = {
      user_id: parseInt(userToAuth.id, 10) || Date.now(),
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

  return { success: false, error: 'Invalid credentials.' };
}

export async function logoutUser() {
  const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'meritmatrix_session_token';
  cookies().delete(AUTH_COOKIE_NAME, { path: '/' });
  redirect('/login');
}


// New server action for creating a college
export async function createCollege(
  values: CreateCollegeFormValues
): Promise<{ success: boolean; error?: string; message?: string; college?: any }> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // In a real application, you would make an API call here:
  // const response = await fetch('/api/colleges', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json', /* Add Auth token if needed */ },
  //   body: JSON.stringify(values),
  // });
  // if (!response.ok) {
  //   const errorData = await response.json();
  //   return { success: false, error: errorData.message || 'Failed to create college.' };
  // }
  // const newCollege = await response.json();

  // For now, we just log and simulate success
  console.log('Creating college with values:', values);

  // Simulate a successful response
  const mockCreatedCollege = {
    college_id: Math.floor(Math.random() * 1000) + 10, // mock ID
    ...values,
  };

  revalidatePath('/admin/colleges'); // Revalidate the colleges list page

  return {
    success: true,
    message: `College "${values.name}" (mock) created successfully.`,
    college: mockCreatedCollege,
  };
}
