
'use server'

import { cookies } from 'next/headers'
import { loginSchema, type LoginFormValues } from '@/schemas/auth'
import { createCollegeSchema, type CreateCollegeFormValues } from '@/schemas/college';
import { createUserSchema, type CreateUserFormValues } from '@/schemas/user';
import { createDepartmentSchema, type CreateDepartmentFormValues } from '@/schemas/department';
import { createClassSchema, type CreateClassFormValues } from '@/schemas/class';
import { createSubjectSchema, type CreateSubjectFormValues } from '@/schemas/subject';
import { createExamSchema, type CreateExamFormValues } from '@/schemas/exam';
import { assignSubjectsToExamSchema, type AssignSubjectsToExamFormValues } from '@/schemas/examSubjectMap';
import { createStudentSchema, type CreateStudentFormValues } from '@/schemas/student'; 
import type { User, UserRole, Department, College, Class, Subject, Exam, ExamSubjectMap, Student } from '@/types'
import { redirect } from 'next/navigation'
import { SignJWT, jwtVerify, decodeJwt } from 'jose'
import { revalidatePath } from 'next/cache';
import { getUserFromCookies } from './auth-utils';
import { format } from 'date-fns';

const MOCK_JWT_SECRET_KEY = process.env.MOCK_JWT_SECRET || 'super-secret-mock-jwt-key-32-chars-long-for-app';


// In-memory mock databases for entities
const mockUsersDb: Record<string, Omit<User, 'id' | 'email' | 'college_id'> & { id: string, email: string, passwordSimple: string, college_id?: number }> = {
  'admin@example.com': { id: '1', name: 'Admin User', email: 'admin@example.com', role: 'ADMIN', passwordSimple: 'admin123' },
  'collegeadmin@example.com': { id: '2', name: 'College Admin', email: 'collegeadmin@example.com', role: 'COLLEGE_ADMIN', passwordSimple: 'password', college_id: 1 },
  'teacher@example.com': { id: '3', name: 'Teacher User', email: 'teacher@example.com', role: 'TEACHER', passwordSimple: 'password', college_id: 1 },
  'student@example.com': { id: '4', name: 'Student User', email: 'student@example.com', role: 'STUDENT', passwordSimple: 'password', college_id: 1 },
};

let mockCreatedUsers: (User & {password: string, college_id?: number})[] = [];
let mockCreatedColleges: College[] = [];
let mockCreatedDepartments: Department[] = [];
let mockCreatedClasses: Class[] = [];
let mockCreatedSubjects: Subject[] = [];
let mockCreatedExams: Exam[] = [];
let mockExamSubjectMaps: ExamSubjectMap[] = [];
let mockCreatedStudents: Student[] = [];


async function createMockJwtToken(payload: {
  user_id: number; // Ensure user_id is numeric for JWT standard
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
    .setExpirationTime('7d') // Expires in 7 days
    .sign(secret);
}

export async function loginUser(
  values: LoginFormValues
): Promise<{ success: boolean; error?: string; user?: User }> {
  const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'meritmatrix_session_token'
  const validatedFields = loginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { success: false, error: 'Invalid input.' };
  }

  const { email, password } = validatedFields.data;

  // Check against predefined mock users
  let userToAuthData = mockUsersDb[email];

  // If not found, check against dynamically created users
  if (!userToAuthData) {
      const createdUser = mockCreatedUsers.find(u => u.email === email);
      if (createdUser) {
          userToAuthData = {
              ...createdUser,
              id: createdUser.id, // Keep string id
              passwordSimple: createdUser.password, // for auth check below
          };
      }
  }
  
  // Generic fallback for any unlisted email with 'password', 'admin123' or 'Test@123'
  if (!userToAuthData && (password === 'password' || password === 'admin123' || password === 'Test@123')) {
    userToAuthData = {
      id: String(Date.now()), // A pseudo-unique ID for this mock user
      name: `User ${email.split('@')[0]}`,
      email: email,
      role: 'STUDENT', // Default role for generic fallback
      passwordSimple: password,
      college_id: 1, // Default college_id for generic fallback
    };
  }


  if (userToAuthData && userToAuthData.passwordSimple === password) {
    const jwtPayload = {
      user_id: parseInt(userToAuthData.id, 10), // Convert string ID to number for JWT
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
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
      return {
        success: true, user: {
          id: userToAuthData.id, // Return string ID for User interface
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

  return { success: false, error: 'Invalid credentials.' };
}


export async function logoutUser() {
  const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'meritmatrix_session_token'
  cookies().delete(AUTH_COOKIE_NAME, { path: '/' });
  redirect('/login');
}

export async function createCollege(
  values: CreateCollegeFormValues
): Promise<{ success: boolean; error?: string; message?: string; college?: College }> {
  await new Promise(resolve => setTimeout(resolve, 500));

  const validatedFields = createCollegeSchema.safeParse(values);
  if (!validatedFields.success) {
    return { success: false, error: 'Invalid input for creating college.' };
  }
  
  const mockCreatedCollege: College = {
    college_id: Math.floor(Math.random() * 10000) + 100, 
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
  await new Promise(resolve => setTimeout(resolve, 500));

  const validatedFields = createUserSchema.safeParse(values);
  if (!validatedFields.success) {
    console.error("User creation validation errors:", validatedFields.error.flatten().fieldErrors);
    return { success: false, error: 'Invalid input for creating user. Check console for details.' };
  }

  const { email, password, role, college_id, name } = validatedFields.data;

  if (mockUsersDb[email] || mockCreatedUsers.some(u => u.email === email)) {
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
  
  // revalidatePath('/admin/users');

  return {
    success: true,
    message: `User "${email}" (mock College Admin) created successfully.`,
    user: newUser,
  };
}

export async function createDepartment(
  values: CreateDepartmentFormValues
): Promise<{ success: boolean; error?: string; message?: string; department?: Department }> {
  await new Promise(resolve => setTimeout(resolve, 500)); 

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
  await new Promise(resolve => setTimeout(resolve, 500));

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

  const newClass: Class = {
    class_id: Math.floor(Math.random() * 100000) + 1000, 
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

export async function createSubject(
  values: CreateSubjectFormValues
): Promise<{ success: boolean; error?: string; message?: string; subject?: Subject }> {
  await new Promise(resolve => setTimeout(resolve, 500));

  const user = await getUserFromCookies(cookies());
  if (!user || (user.role !== 'COLLEGE_ADMIN' && user.role !== 'TEACHER') || !user.college_id) {
    return { success: false, error: 'Unauthorized: Only College Admins or Teachers can create subjects, or college ID is missing.' };
  }

  const validatedFields = createSubjectSchema.safeParse(values);
  if (!validatedFields.success) {
    return { success: false, error: 'Invalid input for creating subject.' };
  }

  const { class_id, subject_code, subject_name, type } = validatedFields.data;
  
  const newSubject: Subject = {
    subject_id: Math.floor(Math.random() * 1000000) + 5000, 
    class_id,
    subject_code,
    subject_name,
    type,
    college_id: user.college_id, 
  };

  mockCreatedSubjects.push(newSubject);
  console.log(`Mock Creating subject "${subject_name}" (Code: ${subject_code}) for class ID ${class_id}:`, newSubject);

  revalidatePath('/shared-management/subjects');

  return {
    success: true,
    message: `Subject "${subject_name}" (mock) of type "${type}" added to class ID ${class_id} successfully.`,
    subject: newSubject,
  };
}

export async function createExam(
  values: CreateExamFormValues
): Promise<{ success: boolean; error?: string; message?: string; exam?: Exam }> {
  await new Promise(resolve => setTimeout(resolve, 500));

  const user = await getUserFromCookies(cookies());
  if (!user || (user.role !== 'COLLEGE_ADMIN' && user.role !== 'TEACHER') || !user.college_id) {
    return { success: false, error: 'Unauthorized: Only College Admins or Teachers can create exams, or college ID is missing.' };
  }
  
  const newExam: Exam = {
    exam_id: Math.floor(Math.random() * 1000000) + 10000, 
    ...values, 
    college_id: user.college_id,
  };

  mockCreatedExams.push(newExam);
  console.log(`Mock Creating exam "${newExam.name}" for class ID ${newExam.class_id}:`, newExam);

  revalidatePath('/shared-management/exams');

  return {
    success: true,
    message: `Exam "${newExam.name}" (mock) created successfully for class ID ${newExam.class_id}.`,
    exam: newExam,
  };
}

export async function assignSubjectsToExam(
  values: AssignSubjectsToExamFormValues
): Promise<{ success: boolean; error?: string; message?: string; mappings?: ExamSubjectMap[] }> {
  await new Promise(resolve => setTimeout(resolve, 500));

  const user = await getUserFromCookies(cookies());
  if (!user || (user.role !== 'COLLEGE_ADMIN' && user.role !== 'TEACHER') || !user.college_id) {
    return { success: false, error: 'Unauthorized: Only College Admins or Teachers can assign subjects, or college ID is missing.' };
  }

  const validatedFields = assignSubjectsToExamSchema.safeParse(values);
  if (!validatedFields.success) {
    return { success: false, error: 'Invalid input for assigning subjects to exam.' };
  }

  const { exam_id, subject_ids } = validatedFields.data;
  const collegeId = user.college_id;

  const examExists = mockCreatedExams.some(e => e.exam_id === exam_id && e.college_id === collegeId) || 
                     [301, 302, 303].includes(exam_id); // Allow assignment to initial mock exams from page
  
  if (!examExists) {
    return { success: false, error: `Exam with ID ${exam_id} not found in your college.` };
  }

  const createdMappings: ExamSubjectMap[] = [];

  subject_ids.forEach(subject_id => {
    const mappingExists = mockExamSubjectMaps.some(
      m => m.exam_id === exam_id && m.subject_id === subject_id && m.college_id === collegeId
    );

    if (!mappingExists) {
      const newMapping: ExamSubjectMap = {
        mapping_id: Math.floor(Math.random() * 10000000) + 100000,
        exam_id,
        subject_id,
        college_id: collegeId,
      };
      mockExamSubjectMaps.push(newMapping);
      createdMappings.push(newMapping);
    }
  });

  console.log(`Mock Assigning ${subject_ids.length} subjects to exam ID ${exam_id} for college ID ${collegeId}:`, createdMappings);
  
  const examIndex = mockCreatedExams.findIndex(e => e.exam_id === exam_id);
  if (examIndex > -1) {
    const currentAssigned = new Set(mockCreatedExams[examIndex].assigned_subject_ids || []);
    subject_ids.forEach(id => currentAssigned.add(id));
    mockCreatedExams[examIndex].assigned_subject_ids = Array.from(currentAssigned);
  } else {
    // If exam was one of the initial static mocks, we need to find it and update it too
    // This part is more complex with separate static and dynamic mock lists. For now, actions focus on mockCreatedExams.
  }

  revalidatePath('/shared-management/exams');

  return {
    success: true,
    message: `${createdMappings.length} new subject(s) assigned to exam ID ${exam_id} successfully. Some may have been assigned previously.`,
    mappings: createdMappings,
  };
}

export async function createStudent(
  values: CreateStudentFormValues
): Promise<{ success: boolean; error?: string; message?: string; student?: Student }> {
  await new Promise(resolve => setTimeout(resolve, 500));

  const user = await getUserFromCookies(cookies());
  if (!user || (user.role !== 'COLLEGE_ADMIN' && user.role !== 'TEACHER') || !user.college_id) {
    return { success: false, error: 'Unauthorized: Only College Admins or Teachers can add students, or college ID is missing.' };
  }

  // Validate input using Zod schema
  const validatedFields = createStudentSchema.safeParse(values);
  if (!validatedFields.success) {
    console.error("Student creation validation errors:", validatedFields.error.flatten().fieldErrors);
    return { success: false, error: 'Invalid input for adding student. Check console for details.' };
  }

  const newStudentData = validatedFields.data;

  const newStudent: Student = {
    student_id: Math.floor(Math.random() * 1000000) + 20000, // Generate a mock student_id
    ...newStudentData,
    college_id: user.college_id,
  };

  mockCreatedStudents.push(newStudent);
  console.log(`Mock Creating student "${newStudent.full_name}" for class ID ${newStudent.class_id} in college ID ${user.college_id}:`, newStudent);

  revalidatePath('/shared-management/students'); 

  return {
    success: true,
    message: `Student "${newStudent.full_name}" (mock) added successfully to class ID ${newStudent.class_id}.`,
    student: newStudent,
  };
}
