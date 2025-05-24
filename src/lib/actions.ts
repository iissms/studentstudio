
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
let mockCreatedColleges: College[] = [];
let mockInitialColleges: College[] = [
    { college_id: 1, name: "Global Institute of Technology", address: "123 Tech Park, Silicon Valley", email: "contact@git.com", phone: "123-456-7890" },
    { college_id: 2, name: "National College of Arts", address: "456 Art Lane, Culture City", email: "info@nca.edu", phone: "098-765-4321" },
    { college_id: 3, name: "United Business School", address: "789 Commerce Ave, Metro City", email: "admin@ubs.biz" },
    { college_id: 4, name: "CMC Institute", address: "Bengaluru", email: "info@cmc.edu", phone: "080-123456" },
  ];

let mockCreatedDepartments: Department[] = [];
let mockInitialDepartments: Department[] = [
    { department_id: 1, name: "Science Department", college_id: 1 },
    { department_id: 2, name: "Humanities Department", college_id: 1 },
    { department_id: 3, name: "Commerce Studies", college_id: 1 },
];

let mockCreatedClasses: Class[] = [];
let mockInitialClasses: Class[] = [
    { class_id: 101, class_name: "1st PUC Science", department_id: 1, academic_year: "2024-2025", college_id: 1, department_name: "Science Department" },
    { class_id: 102, class_name: "2nd PUC Commerce", department_id: 3, academic_year: "2024-2025", college_id: 1, department_name: "Commerce Studies" },
    { class_id: 103, class_name: "B.A. History Sem 1", department_id: 2, academic_year: "2025-2026", college_id: 1, department_name: "Humanities Department" },
];

let mockCreatedSubjects: Subject[] = [];
let mockInitialSubjects: Subject[] = [
    { subject_id: 201, class_id: 101, subject_code: "PHY101", subject_name: "Physics", type: "Theory", college_id: 1, class_name: "1st PUC Science" },
    { subject_id: 202, class_id: 101, subject_code: "CHEM101", subject_name: "Chemistry", type: "Theory", college_id: 1, class_name: "1st PUC Science" },
    { subject_id: 203, class_id: 102, subject_code: "ACC101", subject_name: "Accountancy", type: "Theory", college_id: 1, class_name: "2nd PUC Commerce" },
    { subject_id: 204, class_id: 101, subject_code: "PHY101L", subject_name: "Physics Lab", type: "Practical", college_id: 1, class_name: "1st PUC Science" },
];

let mockCreatedExams: Exam[] = [];
let mockInitialExams: Exam[] = [
    { exam_id: 301, class_id: 101, name: "Physics Midterm I", marks: 50, min_marks: 17, start_date: "2024-08-15", end_date: "2024-08-15", college_id: 1, assigned_subject_ids: [201, 205], class_name: "1st PUC Science" },
    { exam_id: 302, class_id: 102, name: "Accountancy Unit Test 1", marks: 25, min_marks: 9, start_date: "2024-09-01", end_date: "2024-09-01", college_id: 1, assigned_subject_ids: [206], class_name: "2nd PUC Commerce" },
    { exam_id: 303, class_id: 101, name: "Chemistry Final Practical", marks: 30, min_marks: 10, start_date: "2025-03-10", end_date: "2025-03-12", college_id: 1, class_name: "1st PUC Science" },
];

let mockExamSubjectMaps: ExamSubjectMap[] = [];
let mockCreatedStudents: Student[] = [];
let mockInitialStudents: Student[] = [
    { student_id: 2001, class_id: 101, college_id: 1, roll_number: "SC001", full_name: "Alice Wonderland", dob: "2005-03-10", gender: "Female", email: "alice@example.com", phone: "1234567890", address: "123 Fantasy Lane", admission_date: "2023-06-01", class_name: "1st PUC Science" },
    { student_id: 2002, class_id: 102, college_id: 1, roll_number: "CM001", full_name: "Bob The Builder", dob: "2004-07-15", gender: "Male", email: "bob@example.com", phone: "0987654321", address: "456 Tool Street", admission_date: "2022-07-01", class_name: "2nd PUC Commerce" },
];

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
  
  // Fallback for generic student/other user login if email is not in predefined mocks
  if (!userToAuthData && (password === 'password' || password === 'admin123' || password === 'Test@123')) {
    userToAuthData = {
      id: String(Date.now()), 
      name: `User ${email.split('@')[0]}`,
      email: email,
      role: 'STUDENT', // Default to student or a generic role
      passwordSimple: password,
      college_id: 1, // Default college or make it undefined
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
  console.log('Mock Creating college:', mockCreatedCollege);
  
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
  let sourceArray: 'created' | 'initial' | 'none' = 'none';

  if (collegeIndex !== -1) {
    sourceArray = 'created';
  } else {
    collegeIndex = mockInitialColleges.findIndex(c => c.college_id === collegeId);
    if (collegeIndex !== -1) {
      sourceArray = 'initial';
    }
  }

  if (sourceArray === 'none') {
    return { success: false, error: `College with ID ${collegeId} not found for update.` };
  }
  
  let updatedCollege: College;
  if (sourceArray === 'created') {
    updatedCollege = { ...mockCreatedColleges[collegeIndex], ...validatedFields.data };
    mockCreatedColleges[collegeIndex] = updatedCollege;
  } else { // sourceArray === 'initial'
    // For static mock data, we update a copy but the page's getMockColleges won't reflect this.
    updatedCollege = { ...mockInitialColleges[collegeIndex], ...validatedFields.data };
    // mockInitialColleges[collegeIndex] = updatedCollege; // This would modify the "source of truth" for the mock
    console.log('Mock Updating static college (UI list reflects original static data):', updatedCollege);
  }
  
  console.log(`Mock Updating ${sourceArray} college:`, updatedCollege);
  revalidatePath('/admin/colleges'); 

  return {
    success: true,
    message: `College "${validatedFields.data.name}" (mock) updated successfully.`,
    college: updatedCollege,
  };
}

export async function deleteCollege(
  collegeId: number
): Promise<{ success: boolean; error?: string; message?: string }> {
  await new Promise(resolve => setTimeout(resolve, 500));

  const initialCreatedLength = mockCreatedColleges.length;
  mockCreatedColleges = mockCreatedColleges.filter(c => c.college_id !== collegeId);

  if (mockCreatedColleges.length < initialCreatedLength) {
    console.log(`Mock Deleting college with ID: ${collegeId} from dynamic list.`);
    revalidatePath('/admin/colleges');
    return {
      success: true,
      message: `College with ID ${collegeId} (mock) deleted successfully from dynamic list.`,
    };
  }
  
  // Check if it was in the initial static list
  const initialStaticIndex = mockInitialColleges.findIndex(c => c.college_id === collegeId);
  if (initialStaticIndex !== -1) {
    console.log(`Mock "Deleting" college with ID: ${collegeId} (was from static list). UI won't change for static items.`);
    revalidatePath('/admin/colleges');
    return {
      success: true,
      message: `College with ID ${collegeId} (mock static item) processed for deletion. Static list items are not removed from UI by this mock.`,
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
  console.log('Mock Creating user:', newUser);
  
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
  console.log(`Mock Creating department "${name}" for college ID ${collegeId}:`, newDepartment);
  
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
        mockCreatedDepartments[deptIndex] = { ...mockCreatedDepartments[deptIndex], ...validatedFields.data };
        revalidatePath('/college-admin/departments');
        return { success: true, message: `Department "${validatedFields.data.name}" updated.`, department: mockCreatedDepartments[deptIndex] };
    }
    
    deptIndex = mockInitialDepartments.findIndex(d => d.department_id === departmentId && d.college_id === user.college_id);
    if (deptIndex !== -1) {
        // mockInitialDepartments[deptIndex] = { ...mockInitialDepartments[deptIndex], ...validatedFields.data }; // Not truly updating static source
        console.log("Mock updating static department", { ...mockInitialDepartments[deptIndex], ...validatedFields.data })
        revalidatePath('/college-admin/departments');
        return { success: true, message: `Static Department "${validatedFields.data.name}" processed for update.`, department: { ...mockInitialDepartments[deptIndex], ...validatedFields.data } };
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
  console.log(`Mock Creating class "${class_name}" for college ID ${collegeId}, department ID ${department_id}:`, newClass);

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
        mockCreatedClasses[classIndex] = { ...mockCreatedClasses[classIndex], ...validatedFields.data };
        revalidatePath('/college-admin/classes');
        return { success: true, message: `Class "${validatedFields.data.class_name}" updated.`, class: mockCreatedClasses[classIndex] };
    }

    classIndex = mockInitialClasses.findIndex(c => c.class_id === classId && c.college_id === user.college_id);
    if (classIndex !== -1) {
        console.log("Mock updating static class", { ...mockInitialClasses[classIndex], ...validatedFields.data });
        revalidatePath('/college-admin/classes');
        return { success: true, message: `Static Class "${validatedFields.data.class_name}" processed for update.`, class: { ...mockInitialClasses[classIndex], ...validatedFields.data } };
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
  console.log(`Mock Creating student "${newStudent.full_name}" for class ID ${newStudent.class_id} in college ID ${user.college_id}:`, newStudent);

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
    
    let studentIndex = mockCreatedStudents.findIndex(s => s.student_id === studentId && s.college_id === user.college_id);
    if (studentIndex !== -1) {
        mockCreatedStudents[studentIndex] = { ...mockCreatedStudents[studentIndex], ...validatedFields.data, college_id: user.college_id };
        revalidatePath('/shared-management/students');
        return { success: true, message: `Student "${validatedFields.data.full_name}" updated.`, student: mockCreatedStudents[studentIndex] };
    }
    
    studentIndex = mockInitialStudents.findIndex(s => s.student_id === studentId && s.college_id === user.college_id);
    if (studentIndex !== -1) {
        console.log("Mock updating static student", { ...mockInitialStudents[studentIndex], ...validatedFields.data, college_id: user.college_id });
        revalidatePath('/shared-management/students');
        return { success: true, message: `Static Student "${validatedFields.data.full_name}" processed for update.`, student: { ...mockInitialStudents[studentIndex], ...validatedFields.data, college_id: user.college_id } };
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
  console.log(`Mock Creating subject "${subject_name}" (Code: ${subject_code}) for class ID ${class_id}:`, newSubject);

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

    let subjectIndex = mockCreatedSubjects.findIndex(s => s.subject_id === subjectId && s.college_id === user.college_id);
    if (subjectIndex !== -1) {
        mockCreatedSubjects[subjectIndex] = { ...mockCreatedSubjects[subjectIndex], ...validatedFields.data, college_id: user.college_id };
        revalidatePath('/shared-management/subjects');
        return { success: true, message: `Subject "${validatedFields.data.subject_name}" updated.`, subject: mockCreatedSubjects[subjectIndex] };
    }
    
    subjectIndex = mockInitialSubjects.findIndex(s => s.subject_id === subjectId && s.college_id === user.college_id);
    if (subjectIndex !== -1) {
        console.log("Mock updating static subject", { ...mockInitialSubjects[subjectIndex], ...validatedFields.data, college_id: user.college_id });
        revalidatePath('/shared-management/subjects');
        return { success: true, message: `Static Subject "${validatedFields.data.subject_name}" processed for update.`, subject: { ...mockInitialSubjects[subjectIndex], ...validatedFields.data, college_id: user.college_id } };
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
  console.log(`Mock Creating exam "${newExam.name}" for class ID ${newExam.class_id}:`, newExam);

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

    const validatedFields = createExamSchema.safeParse(values); // Assuming schema handles date stringification
    if (!validatedFields.success) {
        return { success: false, error: 'Invalid input for updating exam.' };
    }
    
    let examIndex = mockCreatedExams.findIndex(e => e.exam_id === examId && e.college_id === user.college_id);
    if (examIndex !== -1) {
        mockCreatedExams[examIndex] = { ...mockCreatedExams[examIndex], ...validatedFields.data, college_id: user.college_id };
        revalidatePath('/shared-management/exams');
        return { success: true, message: `Exam "${validatedFields.data.name}" updated.`, exam: mockCreatedExams[examIndex] };
    }

    examIndex = mockInitialExams.findIndex(e => e.exam_id === examId && e.college_id === user.college_id);
    if (examIndex !== -1) {
        console.log("Mock updating static exam", { ...mockInitialExams[examIndex], ...validatedFields.data, college_id: user.college_id });
        revalidatePath('/shared-management/exams');
        return { success: true, message: `Static Exam "${validatedFields.data.name}" processed for update.`, exam: { ...mockInitialExams[examIndex], ...validatedFields.data, college_id: user.college_id } };
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

  const examIsCreated = mockCreatedExams.some(e => e.exam_id === exam_id && e.college_id === collegeId);
  const examIsInitial = mockInitialExams.some(e => e.exam_id === exam_id && e.college_id === collegeId);

  if (!examIsCreated && !examIsInitial) {
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
  
  const examIndexInCreated = mockCreatedExams.findIndex(e => e.exam_id === exam_id);
  if (examIndexInCreated > -1) {
    const currentAssigned = new Set(mockCreatedExams[examIndexInCreated].assigned_subject_ids || []);
    subject_ids.forEach(id => currentAssigned.add(id));
    mockCreatedExams[examIndexInCreated].assigned_subject_ids = Array.from(currentAssigned);
  } else {
    const examIndexInInitial = mockInitialExams.findIndex(e => e.exam_id === exam_id);
    if (examIndexInInitial > -1) {
        // For display purposes, we can update the static exam if it's referenced
        // This change won't persist if the app restarts, but helps with demoing
        const currentAssigned = new Set(mockInitialExams[examIndexInInitial].assigned_subject_ids || []);
        subject_ids.forEach(id => currentAssigned.add(id));
        mockInitialExams[examIndexInInitial].assigned_subject_ids = Array.from(currentAssigned);
        console.log("Updated assigned_subject_ids for static exam:", mockInitialExams[examIndexInInitial]);
    }
  }

  revalidatePath('/shared-management/exams');

  return {
    success: true,
    message: `${createdMappings.length} new subject(s) assigned to exam ID ${exam_id} successfully. Some may have been assigned previously.`,
    mappings: createdMappings,
  };
}
