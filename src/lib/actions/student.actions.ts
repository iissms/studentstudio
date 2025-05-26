
'use server'

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createStudentSchema, type CreateStudentFormValues } from '@/schemas/student';
import type { Student } from '@/types';
import { getUserFromCookies } from '../auth-utils';
import { mockInitialStudents, mockCreatedStudents, mockInitialClasses, mockCreatedClasses } from '../mock-data';
import { z } from 'zod';
import { fetchClassesForCollegeAdmin } from './class.actions';

export async function fetchStudentsForCollegeAdmin(): Promise<Student[]> {
  const user = await getUserFromCookies(await cookies());

  if (!user || (user.role !== 'COLLEGE_ADMIN' && user.role !== 'TEACHER') || !user.college_id) {
    console.warn("Unauthorized access or missing college ID");
    return [];
  }

  const token = (await cookies()).get('meritmatrix_session_token')?.value;
  if (!token) {
    console.warn("Missing session token for fetching students.");
    return [];
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/students`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      console.error("Failed to fetch students:", res.statusText);
      return [];
    }

    const students: Student[] = await res.json();

    // Fetch class list to resolve class names
    const classes = await fetchClassesForCollegeAdmin();

    return students.map(student => ({
      ...student,
      class_name: classes.find(cls => cls.class_id === student.class_id)?.class_name || "Unknown Class",
    }));

  } catch (error) {
    console.error("Error fetching students:", error);
    return [];
  }
}

export async function createStudent(
  values: CreateStudentFormValues
): Promise<{ success: boolean; error?: string; message?: string; student?: Student }> {
  const user = await getUserFromCookies(await cookies());

  if (!user || (user.role !== 'COLLEGE_ADMIN' && user.role !== 'TEACHER')) {
    return {
      success: false,
      error: 'Unauthorized: Only College Admins or Teachers can add students.',
    };
  }

  const validatedFields = createStudentSchema.safeParse(values);
  if (!validatedFields.success) {
    console.error("Student validation failed:", validatedFields.error.flatten().fieldErrors);
    return { success: false, error: 'Invalid input. Check form fields.' };
  }

  const token = (await cookies()).get('meritmatrix_session_token')?.value;
  if (!token) {
    return { success: false, error: 'Missing session token.' };
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/students`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(validatedFields.data),
    });

    if (!res.ok) {
      const errorData = await res.json();
      return {
        success: false,
        error: errorData.message || 'Failed to create student.',
      };
    }

    const data = await res.json();

    revalidatePath('/shared-management/students');

    return {
      success: true,
      message: `Student "${data.full_name}" created successfully.`,
      student: data,
    };
  } catch (error: any) {
    console.error('Student creation error:', error);
    return {
      success: false,
      error: error.message || 'Unexpected error while creating student.',
    };
  }
}

export async function updateStudent(
  studentId: number,
  values: CreateStudentFormValues
): Promise<{ success: boolean; error?: string; message?: string; student?: Student }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const user = await getUserFromCookies(await cookies());
    if (!user || (user.role !== 'COLLEGE_ADMIN' && user.role !== 'TEACHER') || !user.college_id) {
        return { success: false, error: 'Unauthorized or college ID missing.' };
    }

    const validatedFields = createStudentSchema.safeParse(values); // Schema already transforms date strings
    if (!validatedFields.success) {
        return { success: false, error: 'Invalid input for updating student.' };
    }
    
    const collegeId = user.college_id;
    let studentToUpdate = mockCreatedStudents.find(s => s.student_id === studentId && s.college_id === collegeId);
    if (studentToUpdate) {
        Object.assign(studentToUpdate, { ...validatedFields.data, college_id: collegeId });
        revalidatePath('/shared-management/students');
        return { success: true, message: `Student "${validatedFields.data.full_name}" updated.`, student: studentToUpdate };
    }
    
    studentToUpdate = mockInitialStudents.find(s => s.student_id === studentId && s.college_id === collegeId);
    if (studentToUpdate) {
        Object.assign(studentToUpdate, { ...validatedFields.data, college_id: collegeId });
        revalidatePath('/shared-management/students');
        return { success: true, message: `Student "${validatedFields.data.full_name}" updated.`, student: studentToUpdate };
    }

    return { success: false, error: `Student with ID ${studentId} not found in your college.` };
}


export async function fetchStudentsByClassId(classId: number): Promise<Student[]> {
  const cookieStore = cookies();
  const token = (await cookieStore).get('meritmatrix_session_token')?.value;
  const user = await getUserFromCookies(await cookies());

  if (!token || !user || !user.college_id) {
    console.warn('Unauthorized or missing token/college_id.');
    return [];
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/students/by-class/${classId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      console.error('Failed to fetch students:', res.statusText);
      return [];
    }

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('Error fetching students:', err);
    return [];
  }
}