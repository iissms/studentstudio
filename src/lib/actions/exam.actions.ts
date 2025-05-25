
'use server'

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createExamSchema, type CreateExamFormValues } from '@/schemas/exam';
import type { Exam } from '@/types';
import { getUserFromCookies } from '../auth-utils';
import { mockInitialExams, mockCreatedExams, mockInitialClasses, mockCreatedClasses } from '../mock-data';
import { z } from 'zod';
import { fetchClassesForCollegeAdmin } from './class.actions';

export async function fetchExamsForCollegeAdmin(): Promise<Exam[]> {
  const cookieStore = cookies();
  const user = await getUserFromCookies(await cookieStore);
  const token = (await cookieStore).get('meritmatrix_session_token')?.value;

  if (!user || !token || !user.college_id) {
    console.warn('fetchExamsForCollegeAdmin: Unauthorized or missing token.');
    return [];
  }

  try {
    const [examsRes, classList] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/exams`, {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: 60 },
      }),
      fetchClassesForCollegeAdmin(), // ✅ Reuse existing logic
    ]);

    if (!examsRes.ok) {
      console.error('Failed to fetch exams:', examsRes.status);
      return [];
    }

    const exams = await examsRes.json();

    return exams.map((exam: any) => ({
      ...exam,
      class_name:
        classList.find((cls: any) => cls.class_id === exam.class_id)?.class_name || 'Unknown Class',
    }));
  } catch (error) {
    console.error('Error fetching exams:', error);
    return [];
  }
}

export async function createExam(
  values: CreateExamFormValues
): Promise<{ success: boolean; error?: string; message?: string; exam?: Exam }> {
  const user = await getUserFromCookies(await cookies());

  if (!user || (user.role !== 'COLLEGE_ADMIN' && user.role !== 'TEACHER') || !user.college_id) {
    return {
      success: false,
      error: 'Unauthorized: Only College Admins or Teachers can create exams, or college ID is missing.',
    };
  }
  const token = (await cookies()).get('meritmatrix_session_token')?.value;
  if (!token) {
    console.warn('fetchDepartmentsForCollegeAdmin: Missing token.');
    return {
      success: false,
      error: 'Missing session token.',
    };
  }
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/exams`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // If using JWT
      },
      body: JSON.stringify({
        ...values,
        college_id: user.college_id,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      return { success: false, error: errorData.message || 'Failed to create exam.' };
    }

    const data = await res.json();

    revalidatePath('/shared-management/exams');

    return {
      success: true,
      message: `Exam "${data.name}" created successfully.`,
      exam: data,
    };
  } catch (error: any) {
    console.error('Error creating exam:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred while creating the exam.',
    };
  }
}

export async function updateExam(
  examId: number,
  values: CreateExamFormValues 
): Promise<{ success: boolean; error?: string; message?: string; exam?: Exam }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const user = await getUserFromCookies(await cookies());
    if (!user || (user.role !== 'COLLEGE_ADMIN' && user.role !== 'TEACHER') || !user.college_id) {
        return { success: false, error: 'Unauthorized or college ID missing.' };
    }
    
    const collegeId = user.college_id;
    let examToUpdate = mockCreatedExams.find(e => e.exam_id === examId && e.college_id === collegeId);
    if (examToUpdate) {
        Object.assign(examToUpdate, { ...values, college_id: collegeId });
        revalidatePath('/shared-management/exams');
        return { success: true, message: `Exam "${values.name}" updated.`, exam: examToUpdate };
    }

    examToUpdate = mockInitialExams.find(e => e.exam_id === examId && e.college_id === collegeId);
    if (examToUpdate) {
        Object.assign(examToUpdate, { ...values, college_id: collegeId });
        revalidatePath('/shared-management/exams');
        return { success: true, message: `Exam "${values.name}" updated.`, exam: examToUpdate };
    }

    return { success: false, error: `Exam with ID ${examId} not found in your college.` };
}
