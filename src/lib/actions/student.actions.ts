
'use server'

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createStudentSchema, type CreateStudentFormValues } from '@/schemas/student';
import type { Student } from '@/types';
import { getUserFromCookies } from '../auth-utils';
import { mockInitialStudents, mockCreatedStudents, mockInitialClasses, mockCreatedClasses } from '../mock-data';
import { z } from 'zod';

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

export async function createStudent(
  values: CreateStudentFormValues
): Promise<{ success: boolean; error?: string; message?: string; student?: Student }> {
  await new Promise(resolve => setTimeout(resolve, 500));

  const user = await getUserFromCookies(cookies());
  if (!user || (user.role !== 'COLLEGE_ADMIN' && user.role !== 'TEACHER') || !user.college_id) {
    return { success: false, error: 'Unauthorized: Only College Admins or Teachers can add students, or college ID is missing.' };
  }

  const validatedFields = createStudentSchema.safeParse(values); // Schema already transforms date strings
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
