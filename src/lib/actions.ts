
'use server'

import { cookies } from 'next/headers'
import { loginSchema, type LoginFormValues } from '@/schemas/auth'
import { createCollegeSchema, type CreateCollegeFormValues } from '@/schemas/college';
import { createUserSchema, type CreateUserFormValues } from '@/schemas/user'; // New import
import type { User, UserRole } from '@/types'
import { redirect } from 'next/navigation'
import { SignJWT, jwtVerify, decodeJwt } from 'jose'
import { revalidatePath } from 'next/cache';

const MOCK_JWT_SECRET = process.env.MOCK_JWT_SECRET || 'super-secret-mock-jwt-key-32-chars-long-for-app';

// Mock users for login
const mockUsers: Record<string, Omit<User, 'id' | 'email'> & { email: string, passwordSimple: string, college_id?: number }> = {
  'admin@example.com': { name: 'Admin User', email: 'admin@example.com', role: 'ADMIN', passwordSimple: 'admin123' },
  'collegeadmin@example.com': { name: 'College Admin', email: 'collegeadmin@example.com', role: 'COLLEGE_ADMIN', passwordSimple: 'password', college_id: 1 },
  'teacher@example.com': { name: 'Teacher User', email: 'teacher@example.com', role: 'TEACHER', passwordSimple: 'password', college_id: 1 },
  'student@example.com': { name: 'Student User', email: 'student@example.com', role: 'STUDENT', passwordSimple: 'password', college_id: 1 },
};

// In-memory store for created users (mock)
let mockCreatedUsers: (User & {password: string, college_id?: number})[] = [];


async function createMockToken(userPayload: {
  user_id: number; // Changed to number to match JWT spec typically
  role: UserRole;
  name: string | null;
  email: string | null;
  college_id?: number; // Added college_id to token
}): Promise<string> {
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
  
  let userToAuthData: (typeof mockUsers[string] & { id: string }) | null = null;
  
  // Check against predefined mock users first
  const specificMockUser = mockUsers[email];
  if (specificMockUser && specificMockUser.passwordSimple === password) {
    userToAuthData = { ...specificMockUser, id: String(Object.keys(mockUsers).indexOf(email) + 1) };
  } else {
    // Check against dynamically created mock users (if any)
    const createdUser = mockCreatedUsers.find(u => u.email === email && u.password === password);
    if (createdUser) {
        userToAuthData = {
            id: createdUser.id,
            name: createdUser.name,
            email: createdUser.email,
            role: createdUser.role,
            passwordSimple: createdUser.password, // not ideal but for mock
            college_id: createdUser.college_id
        };
    }
  }


  // Fallback for generic student login if no specific user matched but password is known
  if (!userToAuthData && (password === 'password' || password === 'admin123' || password === 'Test@123')) {
     // Allow any email with 'password' to login as a generic student if not a predefined user
    userToAuthData = {
      id: String(Date.now()), // Or a more stable mock ID generation
      name: `User ${email.split('@')[0]}`,
      email: email,
      role: 'STUDENT',
      passwordSimple: password,
      college_id: 1, // Default college_id for generic student
    };
  }


  if (userToAuthData) {
    const jwtPayload = {
      user_id: parseInt(userToAuthData.id, 10), // Ensure user_id is number for JWT
      role: userToAuthData.role,
      name: userToAuthData.name,
      email: userToAuthData.email,
      college_id: userToAuthData.college_id,
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
        id: userToAuthData.id, // Keep as string for User type
        name: userToAuthData.name,
        email: userToAuthData.email,
        role: userToAuthData.role
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

export async function createCollege(
  values: CreateCollegeFormValues
): Promise<{ success: boolean; error?: string; message?: string; college?: any }> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  const validatedFields = createCollegeSchema.safeParse(values);
  if (!validatedFields.success) {
    return { success: false, error: 'Invalid input for creating college.' };
  }
  
  console.log('Mock Creating college with values:', validatedFields.data);
  const mockCreatedCollege = {
    college_id: Math.floor(Math.random() * 10000) + 100, // mock ID
    ...validatedFields.data,
  };
  // In a real app, you'd add this to a persistent store or call an API.
  // For mocks, you could update a global mock store if you want to see it in the list.
  
  revalidatePath('/admin/colleges'); 

  return {
    success: true,
    message: `College "${validatedFields.data.name}" (mock) created successfully.`,
    college: mockCreatedCollege,
  };
}

// New server action for creating a user (CollegeAdmin)
export async function createUser(
  values: CreateUserFormValues
): Promise<{ success: boolean; error?: string; message?: string; user?: Omit<User, 'id'> & {id: string, college_id?: number} }> {
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call delay

  const validatedFields = createUserSchema.safeParse(values);
  if (!validatedFields.success) {
    console.error("User creation validation errors:", validatedFields.error.flatten().fieldErrors);
    return { success: false, error: 'Invalid input for creating user. Check console for details.' };
  }

  const { email, password, role, college_id, name } = validatedFields.data;

  // Check if user already exists (mock check)
  if (mockUsers[email] || mockCreatedUsers.some(u => u.email === email)) {
    return { success: false, error: `User with email ${email} already exists.` };
  }
  
  // For demonstration, log and simulate success by adding to a mock in-memory store
  const newUserId = String(Date.now()); // Simple mock ID
  const newUser: User & {password: string, college_id?: number} = {
    id: newUserId,
    email,
    name: name || `User ${email.split('@')[0]}`, // Use provided name or generate one
    role, // Should be COLLEGE_ADMIN from schema default
    password, // Store password for mock login
    college_id,
  };

  mockCreatedUsers.push(newUser);
  console.log('Mock Creating user with values:', newUser);
  
  // revalidatePath('/admin/users'); // If there was a user list to update

  return {
    success: true,
    message: `User "${email}" (mock College Admin) created successfully.`,
    user: newUser,
  };
}
