
'use server'

import { cookies } from 'next/headers'
import { loginSchema, type LoginFormValues } from '@/schemas/auth'
import { createCollegeSchema, type CreateCollegeFormValues } from '@/schemas/college';
import { createUserSchema, type CreateUserFormValues } from '@/schemas/user';
import { createDepartmentSchema, type CreateDepartmentFormValues } from '@/schemas/department';
import { createClassSchema, type CreateClassFormValues } from '@/schemas/class'; // New import
import type { User, UserRole, Department, College, Class } from '@/types' // Added Class
import { redirect } from 'next/navigation'
import { SignJWT, jwtVerify, decodeJwt } from 'jose'
import { revalidatePath } from 'next/cache';
import { getUserFromCookies } from './auth-utils';

const MOCK_JWT_SECRET = process.env.MOCK_JWT_SECRET || 'super-secret-mock-jwt-key-32-chars-long-for-app';
const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'meritmatrix_session_token';


// Mock users for login
const mockUsers: Record<string, Omit<User, 'id' | 'email' | 'college_id'> & { email: string, passwordSimple: string, college_id?: number }> = {
  'admin@example.com': { name: 'Admin User', email: 'admin@example.com', role: 'ADMIN', passwordSimple: 'admin123' },
  'collegeadmin@example.com': { name: 'College Admin', email: 'collegeadmin@example.com', role: 'COLLEGE_ADMIN', passwordSimple: 'password', college_id: 1 }, // Assuming college_id 1
  'teacher@example.com': { name: 'Teacher User', email: 'teacher@example.com', role: 'TEACHER', passwordSimple: 'password', college_id: 1 },
  'student@example.com': { name: 'Student User', email: 'student@example.com', role: 'STUDENT', passwordSimple: 'password', college_id: 1 },
};

// In-memory store for created entities (mock)
let mockCreatedUsers: (User & {password: string, college_id?: number})[] = [];
let mockCreatedColleges: College[] = [];
let mockCreatedDepartments: Department[] = [];
let mockCreatedClasses: Class[] = []; // New mock store for classes

async function createMockToken(userPayload: {
  user_id: number; // Changed from string to number
  role: UserRole;
  name: string | null;
  email: string | null;
  college_id?: number;
}): Promise<string> {
  const secret = new TextEncoder().encode(MOCK_JWT_SECRET);
  const alg = 'HS256';

  return await new SignJWT(userPayload) // Use the payload directly
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
  
  let userToAuthData: (Omit<User, 'id' | 'email'| 'college_id'> & { id: string, email: string, passwordSimple: string, college_id?: number }) | null = null;
  
  const specificMockUser = mockUsers[email];
  if (specificMockUser && specificMockUser.passwordSimple === password) {
     userToAuthData = { ...specificMockUser, id: String(Object.keys(mockUsers).indexOf(email) + 1) };
  } else {
    const createdUser = mockCreatedUsers.find(u => u.email === email && u.password === password);
    if (createdUser) {
        userToAuthData = {
            id: createdUser.id,
            name: createdUser.name,
            email: createdUser.email,
            role: createdUser.role,
            passwordSimple: createdUser.password, // This is not ideal, but it's how mockUsers is structured
            college_id: createdUser.college_id,
        };
    }
  }
  
  // Fallback for generic student user if password matches common test passwords
  if (!userToAuthData && (password === 'password' || password === 'admin123' || password === 'Test@123')) {
    userToAuthData = {
      id: String(Date.now()), // Generate a somewhat unique ID
      name: `User ${email.split('@')[0]}`,
      email: email,
      role: 'STUDENT', // Default to STUDENT if not a predefined user
      passwordSimple: password,
      college_id: 1, // Default college_id for mock students
    };
  }


  if (userToAuthData) {
    const jwtPayload = {
      user_id: parseInt(userToAuthData.id, 10), // Ensure user_id is a number for the token
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
        id: userToAuthData.id, 
        name: userToAuthData.name,
        email: userToAuthData.email,
        role: userToAuthData.role,
        college_id: userToAuthData.college_id,
      }};
    } catch (error) {
      console.error('Failed to create mock token:', error);
      return { success: false, error: 'Failed to prepare session.' };
    }
  }

  return { success: false, error: 'Invalid credentials.' };
}

export async function logoutUser() {
  const cookieStore = cookies()
  cookieStore.delete(AUTH_COOKIE_NAME, { path: '/' });
  redirect('/login');
}

export async function createCollege(
  values: CreateCollegeFormValues
): Promise<{ success: boolean; error?: string; message?: string; college?: College }> {
  await new Promise(resolve => setTimeout(resolve, 1000));

  const validatedFields = createCollegeSchema.safeParse(values);
  if (!validatedFields.success) {
    return { success: false, error: 'Invalid input for creating college.' };
  }
  
  const mockCreatedCollege: College = {
    college_id: Math.floor(Math.random() * 10000) + 100, // Ensure unique enough ID for mock
    ...validatedFields.data,
  };
  mockCreatedColleges.push(mockCreatedCollege);
  console.log('Mock Creating college:', mockCreatedCollege);
  
  revalidatePath('/admin/colleges'); 

  return {
    success: true,
    message: `College "${validatedFields.data.name}" (mock) created successfully.`,
    college: mockCreatedCollege,
  };
}

export async function createUser(
  values: CreateUserFormValues
): Promise<{ success: boolean; error?: string; message?: string; user?: User & { college_id?: number } }> {
  await new Promise(resolve => setTimeout(resolve, 1000));

  const validatedFields = createUserSchema.safeParse(values);
  if (!validatedFields.success) {
    console.error("User creation validation errors:", validatedFields.error.flatten().fieldErrors);
    return { success: false, error: 'Invalid input for creating user. Check console for details.' };
  }

  const { email, password, role, college_id, name } = validatedFields.data;

  if (mockUsers[email] || mockCreatedUsers.some(u => u.email === email)) {
    return { success: false, error: `User with email ${email} already exists.` };
  }
  
  const newUserId = String(Date.now());
  const newUser: User & {password: string, college_id?: number} = {
    id: newUserId,
    email,
    name: name || `User ${email.split('@')[0]}`,
    role,
    password, 
    college_id,
  };

  mockCreatedUsers.push(newUser);
  console.log('Mock Creating user:', newUser);
  
  // revalidatePath('/admin/users'); // Consider if user list display is implemented

  return {
    success: true,
    message: `User "${email}" (mock College Admin) created successfully.`,
    user: newUser,
  };
}

export async function createDepartment(
  values: CreateDepartmentFormValues
): Promise<{ success: boolean; error?: string; message?: string; department?: Department }> {
  await new Promise(resolve => setTimeout(resolve, 1000)); 

  const user = await getUserFromCookies(cookies());

  if (!user || user.role !== 'COLLEGE_ADMIN' || !user.college_id) {
    return { success: false, error: 'Unauthorized: Only College Admins can create departments, or college ID is missing.' };
  }

  const validatedFields = createDepartmentSchema.safeParse(values);
  if (!validatedFields.success) {
    return { success: false, error: 'Invalid input for creating department.' };
  }

  const { name } = validatedFields.data;
  const collegeId = user.college_id;

  const newDepartment: Department = {
    department_id: Math.floor(Math.random() * 10000) + 500, 
    name,
    college_id: collegeId,
  };

  mockCreatedDepartments.push(newDepartment);
  console.log(`Mock Creating department "${name}" for college ID ${collegeId}:`, newDepartment);
  
  revalidatePath('/college-admin/departments');

  return {
    success: true,
    message: `Department "${name}" (mock) created successfully for your college.`,
    department: newDepartment,
  };
}

export async function createClass(
  values: CreateClassFormValues
): Promise<{ success: boolean; error?: string; message?: string; class?: Class }> {
  await new Promise(resolve => setTimeout(resolve, 1000));

  const user = await getUserFromCookies(cookies());
  if (!user || user.role !== 'COLLEGE_ADMIN' || !user.college_id) {
    return { success: false, error: 'Unauthorized: Only College Admins can create classes, or college ID is missing.' };
  }

  const validatedFields = createClassSchema.safeParse(values);
  if (!validatedFields.success) {
    return { success: false, error: 'Invalid input for creating class.' };
  }

  const { class_name, department_id, academic_year } = validatedFields.data;
  const collegeId = user.college_id;

  // Optional: Validate if department_id belongs to the user's college_id (more complex for mocks)
  // For now, we assume the dropdown in the form correctly lists departments for the admin's college.

  const newClass: Class = {
    class_id: Math.floor(Math.random() * 100000) + 1000, // Mock ID
    class_name,
    department_id,
    academic_year,
    college_id: collegeId,
  };

  mockCreatedClasses.push(newClass);
  console.log(`Mock Creating class "${class_name}" for college ID ${collegeId}, department ID ${department_id}:`, newClass);

  revalidatePath('/college-admin/classes');

  return {
    success: true,
    message: `Class "${class_name}" (mock) for academic year ${academic_year} created successfully.`,
    class: newClass,
  };
}
