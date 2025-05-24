
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
const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'meritmatrix_session_token';

// In-memory mock databases for entities
const mockUsersDb: Record<string, Omit<User, 'id' | 'email' | 'college_id'> & { id: string, email: string, passwordSimple: string, college_id?: number }> = {
  'admin@example.com': { id: '1', name: 'Admin User', email: 'admin@example.com', role: 'ADMIN', passwordSimple: 'admin123' },
  'collegeadmin@example.com': { id: '2', name: 'College Admin', email: 'collegeadmin@example.com', role: 'COLLEGE_ADMIN', passwordSimple: 'password', college_id: 1 },
  'teacher@example.com': { id: '3', name: 'Teacher User', email: 'teacher@example.com', role: 'TEACHER', passwordSimple: 'password', college_id: 1 },
  'student@example.com': { id: '4', name: 'Student User', email: 'student@example.com', role: 'STUDENT', passwordSimple: 'password', college_id: 1 },
};

let mockCreatedUsers: (User & {password: string, college_id?: number})[] = [];

// --- Centralized Mock Data Store ---
let mockInitialColleges: College[] = [
    { college_id: 1, name: "Global Institute of Technology", address: "123 Tech Park, Silicon Valley", email: "contact@git.com", phone: "123-456-7890" },
    { college_id: 2, name: "National College of Arts", address: "456 Art Lane, Culture City", email: "info@nca.edu", phone: "098-765-4321" },
    { college_id: 3, name: "United Business School", address: "789 Commerce Ave, Metro City", email: "admin@ubs.biz" },
    { college_id: 4, name: "CMC Institute", address: "Bengaluru", email: "info@cmc.edu", phone: "080-123456" },
];
let mockCreatedColleges: College[] = [];

let mockInitialDepartments: Department[] = [
    { department_id: 1, name: "Science Department", college_id: 1 },
    { department_id: 2, name: "Humanities Department", college_id: 1 },
    { department_id: 3, name: "Commerce Studies", college_id: 1 },
    { department_id: 5, name: "Engineering Dept", college_id: 2 },
];
let mockCreatedDepartments: Department[] = [];

let mockInitialClasses: Class[] = [
    { class_id: 101, class_name: "1st PUC Science", department_id: 1, academic_year: "2024-2025", college_id: 1 },
    { class_id: 102, class_name: "2nd PUC Commerce", department_id: 3, academic_year: "2024-2025", college_id: 1 },
    { class_id: 103, class_name: "B.A. History Sem 1", department_id: 2, academic_year: "2025-2026", college_id: 1 },
    { class_id: 104, class_name: "Mech Engg Year 1", department_id: 5, academic_year: "2024-2025", college_id: 2 },
];
let mockCreatedClasses: Class[] = [];

let mockInitialStudents: Student[] = [
    { student_id: 2001, class_id: 101, college_id: 1, roll_number: "SC001", full_name: "Alice Wonderland", dob: "2005-03-10", gender: "Female", email: "alice@example.com", phone: "1234567890", address: "123 Fantasy Lane", admission_date: "2023-06-01"},
    { student_id: 2002, class_id: 102, college_id: 1, roll_number: "CM001", full_name: "Bob The Builder", dob: "2004-07-15", gender: "Male", email: "bob@example.com", phone: "0987654321", address: "456 Tool Street", admission_date: "2022-07-01"},
    { student_id: 2003, class_id: 104, college_id: 2, roll_number: "ENG001", full_name: "Charlie Brown", dob: "2005-08-20", gender: "Male", email: "charlie@example.com", phone: "555-1234", address: "789 Engineering Rd", admission_date: "2023-07-15"},
];
let mockCreatedStudents: Student[] = [];

let mockInitialSubjects: Subject[] = [
    { subject_id: 201, class_id: 101, subject_code: "PHY101", subject_name: "Physics", type: "Theory", college_id: 1 },
    { subject_id: 202, class_id: 101, subject_code: "CHEM101", subject_name: "Chemistry", type: "Theory", college_id: 1 },
    { subject_id: 203, class_id: 102, subject_code: "ACC101", subject_name: "Accountancy", type: "Theory", college_id: 1 },
    { subject_id: 204, class_id: 101, subject_code: "PHY101L", subject_name: "Physics Lab", type: "Practical", college_id: 1 },
    { subject_id: 205, class_id: 104, subject_code: "MECH101", subject_name: "Mechanics", type: "Theory", college_id: 2 },
];
let mockCreatedSubjects: Subject[] = [];

let mockInitialExams: Exam[] = [
    { exam_id: 301, class_id: 101, name: "Physics Midterm I", marks: 50, min_marks: 17, start_date: "2024-08-15", end_date: "2024-08-15", college_id: 1, assigned_subject_ids: [201, 204] },
    { exam_id: 302, class_id: 102, name: "Accountancy Unit Test 1", marks: 25, min_marks: 9, start_date: "2024-09-01", end_date: "2024-09-01", college_id: 1, assigned_subject_ids: [203] },
    { exam_id: 303, class_id: 101, name: "Chemistry Final Practical", marks: 30, min_marks: 10, start_date: "2025-03-10", end_date: "2025-03-12", college_id: 1 },
    { exam_id: 304, class_id: 104, name: "Mechanics Midterm", marks: 100, min_marks: 40, start_date: "2024-10-15", end_date: "2024-10-15", college_id: 2, assigned_subject_ids: [205] },
];
let mockCreatedExams: Exam[] = [];

let mockExamSubjectMaps: ExamSubjectMap[] = [
    { mapping_id: 1, exam_id: 301, subject_id: 201, college_id: 1 },
    { mapping_id: 2, exam_id: 301, subject_id: 204, college_id: 1 },
    { mapping_id: 3, exam_id: 302, subject_id: 203, college_id: 1 },
    { mapping_id: 4, exam_id: 304, subject_id: 205, college_id: 2 },
];
// --- End Centralized Mock Data Store ---

async function createMockJwtToken(payload: {
  user_id: string; 
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

  let userToAuthData = mockUsersDb[email];

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
      user_id: userToAuthData.id, 
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

  return { success: false, error: 'Invalid credentials.' };
}

export async function logoutUser() {
  cookies().delete(AUTH_COOKIE_NAME, { path: '/' });
  redirect('/login');
}

// --- Fetch Actions (Simulating API calls) ---

export async function fetchColleges(): Promise<College[]> {
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
  return [...mockInitialColleges, ...mockCreatedColleges];
}

export async function fetchDepartmentsForCollegeAdmin(): Promise<Department[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  const user = await getUserFromCookies(cookies());
  if (!user || (user.role !== 'COLLEGE_ADMIN' && user.role !== 'TEACHER') || !user.college_id) {
    console.warn('fetchDepartmentsForCollegeAdmin: Unauthorized or no college_id for user:', user);
    return [];
  }
  const allDepartments = [...mockInitialDepartments, ...mockCreatedDepartments];
  return allDepartments.filter(dept => dept.college_id === user.college_id);
}

export async function fetchClassesForCollegeAdmin(): Promise<Class[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  const user = await getUserFromCookies(cookies());
  if (!user || (user.role !== 'COLLEGE_ADMIN' && user.role !== 'TEACHER') || !user.college_id) {
    console.warn('fetchClassesForCollegeAdmin: Unauthorized or no college_id for user:', user);
    return [];
  }
  
  const allDepartments = [...mockInitialDepartments, ...mockCreatedDepartments];
  const collegeDepartments = allDepartments.filter(dept => dept.college_id === user.college_id);
  
  const allCollegeClasses = [...mockInitialClasses, ...mockCreatedClasses].filter(c => c.college_id === user.college_id);

  return allCollegeClasses.map(cls => ({
    ...cls,
    department_name: collegeDepartments.find(d => d.department_id === cls.department_id)?.name || "Unknown Dept."
  }));
}

export async function fetchStudentsForCollegeAdmin(): Promise<Student[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const user = await getUserFromCookies(cookies());
    if (!user || (user.role !== 'COLLEGE_ADMIN' && user.role !== 'TEACHER') || !user.college_id) {
        return [];
    }
    const collegeId = user.college_id;
    const allClasses = [...mockInitialClasses, ...mockCreatedClasses];
    const allStudents = [...mockInitialStudents, ...mockCreatedStudents];

    return allStudents
        .filter(s => s.college_id === collegeId)
        .map(student => ({
            ...student,
            class_name: allClasses.find(c => c.class_id === student.class_id && c.college_id === collegeId)?.class_name || "Unknown Class"
        }));
}

export async function fetchSubjectsForCollegeAdmin(): Promise<Subject[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const user = await getUserFromCookies(cookies());
     if (!user || (user.role !== 'COLLEGE_ADMIN' && user.role !== 'TEACHER') || !user.college_id) {
        return [];
    }
    const collegeId = user.college_id;
    const allClasses = [...mockInitialClasses, ...mockCreatedClasses];
    const allSubjects = [...mockInitialSubjects, ...mockCreatedSubjects];

    return allSubjects
        .filter(s => s.college_id === collegeId)
        .map(subject => ({
            ...subject,
            class_name: allClasses.find(c => c.class_id === subject.class_id && c.college_id === collegeId)?.class_name || "Unknown Class"
        }));
}

export async function fetchSubjectsForClass(classId: number): Promise<Subject[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const user = await getUserFromCookies(cookies());
    if (!user || (user.role !== 'COLLEGE_ADMIN' && user.role !== 'TEACHER') || !user.college_id) {
        return [];
    }
    const collegeId = user.college_id;
    const allSubjects = [...mockInitialSubjects, ...mockCreatedSubjects];
    return allSubjects.filter(s => s.class_id === classId && s.college_id === collegeId);
}


export async function fetchExamsForCollegeAdmin(): Promise<Exam[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const user = await getUserFromCookies(cookies());
    if (!user || (user.role !== 'COLLEGE_ADMIN' && user.role !== 'TEACHER') || !user.college_id) {
        return [];
    }
    const collegeId = user.college_id;
    const allClasses = [...mockInitialClasses, ...mockCreatedClasses];
    const allExams = [...mockInitialExams, ...mockCreatedExams];

    return allExams
        .filter(e => e.college_id === collegeId)
        .map(exam => ({
            ...exam,
            class_name: allClasses.find(c => c.class_id === exam.class_id && c.college_id === collegeId)?.class_name || "Unknown Class"
        }));
}


// --- CRUD Actions ---

// College Actions
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
  
  revalidatePath('/admin/colleges'); 

  return {
    success: true,
    message: `College "${validatedFields.data.name}" (mock) created successfully.`,
    college: mockCreatedCollege,
  };
}

export async function updateCollege(
  collegeId: number,
  values: CreateCollegeFormValues
): Promise<{ success: boolean; error?: string; message?: string; college?: College }> {
  await new Promise(resolve => setTimeout(resolve, 500));

  const validatedFields = createCollegeSchema.safeParse(values);
  if (!validatedFields.success) {
    return { success: false, error: 'Invalid input for updating college.' };
  }

  let collegeIndex = mockCreatedColleges.findIndex(c => c.college_id === collegeId);
  if (collegeIndex !== -1) {
    mockCreatedColleges[collegeIndex] = { ...mockCreatedColleges[collegeIndex], ...validatedFields.data };
    revalidatePath('/admin/colleges');
    return { success: true, message: `College "${validatedFields.data.name}" updated.`, college: mockCreatedColleges[collegeIndex] };
  }
  
  collegeIndex = mockInitialColleges.findIndex(c => c.college_id === collegeId);
  if (collegeIndex !== -1) {
    mockInitialColleges[collegeIndex] = { ...mockInitialColleges[collegeIndex], ...validatedFields.data };
    revalidatePath('/admin/colleges');
    return { success: true, message: `College "${validatedFields.data.name}" updated.`, college: mockInitialColleges[collegeIndex] };
  }

  return { success: false, error: `College with ID ${collegeId} not found for update.` };
}

export async function deleteCollege(
  collegeId: number
): Promise<{ success: boolean; error?: string; message?: string }> {
  await new Promise(resolve => setTimeout(resolve, 500));

  const initialCreatedLength = mockCreatedColleges.length;
  mockCreatedColleges = mockCreatedColleges.filter(c => c.college_id !== collegeId);

  if (mockCreatedColleges.length < initialCreatedLength) {
    revalidatePath('/admin/colleges');
    return {
      success: true,
      message: `College with ID ${collegeId} (mock dynamic) deleted successfully.`,
    };
  }
  
  const initialStaticLength = mockInitialColleges.length;
  mockInitialColleges = mockInitialColleges.filter(c => c.college_id !== collegeId);
   if (mockInitialColleges.length < initialStaticLength) {
    revalidatePath('/admin/colleges');
    return {
      success: true,
      message: `College with ID ${collegeId} (mock static) deleted successfully.`,
    };
  }

  return { success: false, error: `College with ID ${collegeId} not found.` };
}

// User Actions
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
  
  revalidatePath('/admin/users');

  return {
    success: true,
    message: `User "${email}" (mock College Admin) created successfully.`,
    user: newUser,
  };
}

// Department Actions
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
  
  revalidatePath('/college-admin/departments');

  return {
    success: true,
    message: `Department "${name}" (mock) created successfully for your college.`,
    department: newDepartment,
  };
}

export async function updateDepartment(
  departmentId: number,
  values: CreateDepartmentFormValues
): Promise<{ success: boolean; error?: string; message?: string; department?: Department }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const user = await getUserFromCookies(cookies());
    if (!user || user.role !== 'COLLEGE_ADMIN' || !user.college_id) {
        return { success: false, error: 'Unauthorized or college ID missing.' };
    }

    const validatedFields = createDepartmentSchema.safeParse(values);
    if (!validatedFields.success) {
        return { success: false, error: 'Invalid input for updating department.' };
    }

    let deptIndex = mockCreatedDepartments.findIndex(d => d.department_id === departmentId && d.college_id === user.college_id);
    if (deptIndex !== -1) {
        mockCreatedDepartments[deptIndex] = { ...mockCreatedDepartments[deptIndex], ...validatedFields.data, college_id: user.college_id };
        revalidatePath('/college-admin/departments');
        return { success: true, message: `Department "${validatedFields.data.name}" updated.`, department: mockCreatedDepartments[deptIndex] };
    }
    
    deptIndex = mockInitialDepartments.findIndex(d => d.department_id === departmentId && d.college_id === user.college_id);
    if (deptIndex !== -1) {
        mockInitialDepartments[deptIndex] = { ...mockInitialDepartments[deptIndex], ...validatedFields.data, college_id: user.college_id };
        revalidatePath('/college-admin/departments');
        return { success: true, message: `Department "${validatedFields.data.name}" updated.`, department: mockInitialDepartments[deptIndex] };
    }

    return { success: false, error: `Department with ID ${departmentId} not found in your college.` };
}

// Class Actions
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

  revalidatePath('/college-admin/classes');

  return {
    success: true,
    message: `Class "${class_name}" (mock) for academic year ${academic_year} created successfully.`,
    class: newClass,
  };
}

export async function updateClass(
  classId: number,
  values: CreateClassFormValues
): Promise<{ success: boolean; error?: string; message?: string; class?: Class }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const user = await getUserFromCookies(cookies());
    if (!user || user.role !== 'COLLEGE_ADMIN' || !user.college_id) {
        return { success: false, error: 'Unauthorized or college ID missing.' };
    }

    const validatedFields = createClassSchema.safeParse(values);
    if (!validatedFields.success) {
        return { success: false, error: 'Invalid input for updating class.' };
    }

    let classIndex = mockCreatedClasses.findIndex(c => c.class_id === classId && c.college_id === user.college_id);
    if (classIndex !== -1) {
        mockCreatedClasses[classIndex] = { ...mockCreatedClasses[classIndex], ...validatedFields.data, college_id: user.college_id };
        revalidatePath('/college-admin/classes');
        return { success: true, message: `Class "${validatedFields.data.class_name}" updated.`, class: mockCreatedClasses[classIndex] };
    }

    classIndex = mockInitialClasses.findIndex(c => c.class_id === classId && c.college_id === user.college_id);
    if (classIndex !== -1) {
        mockInitialClasses[classIndex] = { ...mockInitialClasses[classIndex], ...validatedFields.data, college_id: user.college_id };
        revalidatePath('/college-admin/classes');
        return { success: true, message: `Class "${validatedFields.data.class_name}" updated.`, class: mockInitialClasses[classIndex] };
    }
    return { success: false, error: `Class with ID ${classId} not found in your college.` };
}

// Student Actions
export async function createStudent(
  values: CreateStudentFormValues
): Promise<{ success: boolean; error?: string; message?: string; student?: Student }> {
  await new Promise(resolve => setTimeout(resolve, 500));

  const user = await getUserFromCookies(cookies());
  if (!user || (user.role !== 'COLLEGE_ADMIN' && user.role !== 'TEACHER') || !user.college_id) {
    return { success: false, error: 'Unauthorized: Only College Admins or Teachers can add students, or college ID is missing.' };
  }

  const validatedFields = createStudentSchema.safeParse(values);
  if (!validatedFields.success) {
    console.error("Student creation validation errors:", validatedFields.error.flatten().fieldErrors);
    return { success: false, error: 'Invalid input for adding student. Check console for details.' };
  }

  const newStudentData = validatedFields.data;

  const newStudent: Student = {
    student_id: Math.floor(Math.random() * 1000000) + 20000, 
    ...newStudentData,
    college_id: user.college_id,
  };

  mockCreatedStudents.push(newStudent);

  revalidatePath('/shared-management/students'); 

  return {
    success: true,
    message: `Student "${newStudent.full_name}" (mock) added successfully to class ID ${newStudent.class_id}.`,
    student: newStudent,
  };
}

export async function updateStudent(
  studentId: number,
  values: CreateStudentFormValues
): Promise<{ success: boolean; error?: string; message?: string; student?: Student }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const user = await getUserFromCookies(cookies());
    if (!user || (user.role !== 'COLLEGE_ADMIN' && user.role !== 'TEACHER') || !user.college_id) {
        return { success: false, error: 'Unauthorized or college ID missing.' };
    }

    const validatedFields = createStudentSchema.safeParse(values);
    if (!validatedFields.success) {
        return { success: false, error: 'Invalid input for updating student.' };
    }
    
    const collegeId = user.college_id;
    let studentIndex = mockCreatedStudents.findIndex(s => s.student_id === studentId && s.college_id === collegeId);
    if (studentIndex !== -1) {
        mockCreatedStudents[studentIndex] = { ...mockCreatedStudents[studentIndex], ...validatedFields.data, college_id: collegeId };
        revalidatePath('/shared-management/students');
        return { success: true, message: `Student "${validatedFields.data.full_name}" updated.`, student: mockCreatedStudents[studentIndex] };
    }
    
    studentIndex = mockInitialStudents.findIndex(s => s.student_id === studentId && s.college_id === collegeId);
    if (studentIndex !== -1) {
        mockInitialStudents[studentIndex] = { ...mockInitialStudents[studentIndex], ...validatedFields.data, college_id: collegeId };
        revalidatePath('/shared-management/students');
        return { success: true, message: `Student "${validatedFields.data.full_name}" updated.`, student: mockInitialStudents[studentIndex] };
    }

    return { success: false, error: `Student with ID ${studentId} not found in your college.` };
}

// Subject Actions
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

  revalidatePath('/shared-management/subjects');

  return {
    success: true,
    message: `Subject "${subject_name}" (mock) of type "${type}" added to class ID ${class_id} successfully.`,
    subject: newSubject,
  };
}

export async function updateSubject(
  subjectId: number,
  values: CreateSubjectFormValues
): Promise<{ success: boolean; error?: string; message?: string; subject?: Subject }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const user = await getUserFromCookies(cookies());
    if (!user || (user.role !== 'COLLEGE_ADMIN' && user.role !== 'TEACHER') || !user.college_id) {
        return { success: false, error: 'Unauthorized or college ID missing.' };
    }

    const validatedFields = createSubjectSchema.safeParse(values);
    if (!validatedFields.success) {
        return { success: false, error: 'Invalid input for updating subject.' };
    }
    
    const collegeId = user.college_id;
    let subjectIndex = mockCreatedSubjects.findIndex(s => s.subject_id === subjectId && s.college_id === collegeId);
    if (subjectIndex !== -1) {
        mockCreatedSubjects[subjectIndex] = { ...mockCreatedSubjects[subjectIndex], ...validatedFields.data, college_id: collegeId };
        revalidatePath('/shared-management/subjects');
        return { success: true, message: `Subject "${validatedFields.data.subject_name}" updated.`, subject: mockCreatedSubjects[subjectIndex] };
    }
    
    subjectIndex = mockInitialSubjects.findIndex(s => s.subject_id === subjectId && s.college_id === collegeId);
    if (subjectIndex !== -1) {
        mockInitialSubjects[subjectIndex] = { ...mockInitialSubjects[subjectIndex], ...validatedFields.data, college_id: collegeId };
        revalidatePath('/shared-management/subjects');
        return { success: true, message: `Subject "${validatedFields.data.subject_name}" updated.`, subject: mockInitialSubjects[subjectIndex] };
    }

    return { success: false, error: `Subject with ID ${subjectId} not found in your college.` };
}

// Exam Actions
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

  revalidatePath('/shared-management/exams');

  return {
    success: true,
    message: `Exam "${newExam.name}" (mock) created successfully for class ID ${newExam.class_id}.`,
    exam: newExam,
  };
}

export async function updateExam(
  examId: number,
  values: CreateExamFormValues
): Promise<{ success: boolean; error?: string; message?: string; exam?: Exam }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const user = await getUserFromCookies(cookies());
    if (!user || (user.role !== 'COLLEGE_ADMIN' && user.role !== 'TEACHER') || !user.college_id) {
        return { success: false, error: 'Unauthorized or college ID missing.' };
    }

    const validatedFields = createExamSchema.safeParse(values); 
    if (!validatedFields.success) {
        return { success: false, error: 'Invalid input for updating exam.' };
    }
    
    const collegeId = user.college_id;
    let examIndex = mockCreatedExams.findIndex(e => e.exam_id === examId && e.college_id === collegeId);
    if (examIndex !== -1) {
        mockCreatedExams[examIndex] = { ...mockCreatedExams[examIndex], ...validatedFields.data, college_id: collegeId };
        revalidatePath('/shared-management/exams');
        return { success: true, message: `Exam "${validatedFields.data.name}" updated.`, exam: mockCreatedExams[examIndex] };
    }

    examIndex = mockInitialExams.findIndex(e => e.exam_id === examId && e.college_id === collegeId);
    if (examIndex !== -1) {
        mockInitialExams[examIndex] = { ...mockInitialExams[examIndex], ...validatedFields.data, college_id: collegeId };
        revalidatePath('/shared-management/exams');
        return { success: true, message: `Exam "${validatedFields.data.name}" updated.`, exam: mockInitialExams[examIndex] };
    }

    return { success: false, error: `Exam with ID ${examId} not found in your college.` };
}

// ExamSubjectMap Actions
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

  const allExams = [...mockInitialExams, ...mockCreatedExams];
  const targetExam = allExams.find(e => e.exam_id === exam_id && e.college_id === collegeId);

  if (!targetExam) {
    return { success: false, error: `Exam with ID ${exam_id} not found in your college.` };
  }

  // Update the target exam's assigned_subject_ids
  targetExam.assigned_subject_ids = Array.from(new Set([...(targetExam.assigned_subject_ids || []), ...subject_ids]));


  // Also update the mockExamSubjectMaps for good measure, though it's not directly used for display in this version
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
  
  revalidatePath('/shared-management/exams');

  return {
    success: true,
    message: `${subject_ids.length} subject(s) processed for assignment to exam ID ${exam_id}.`,
    mappings: createdMappings,
  };
}
