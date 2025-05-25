
'use server'

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { assignSubjectsToExamSchema, type AssignSubjectsToExamFormValues } from '@/schemas/examSubjectMap';
import type { ExamSubjectMap } from '@/types';
import { getUserFromCookies } from '../auth-utils';
import { mockExamSubjectMaps, mockInitialExams, mockCreatedExams } from '../mock-data';

export async function assignSubjectsToExam(
  values: AssignSubjectsToExamFormValues
): Promise<{ success: boolean; error?: string; message?: string; mappings?: ExamSubjectMap[] }> {
  const user = await getUserFromCookies(await cookies());

  if (!user || (user.role !== 'COLLEGE_ADMIN' && user.role !== 'TEACHER') || !user.college_id) {
    return {
      success: false,
      error: 'Unauthorized: Only College Admins or Teachers can assign subjects, or college ID is missing.',
    };
  }

  const validatedFields = assignSubjectsToExamSchema.safeParse(values);
  if (!validatedFields.success) {
    console.error('Validation failed:', validatedFields.error.flatten().fieldErrors);
    return {
      success: false,
      error: 'Invalid input for assigning subjects to exam.',
    };
  }

  const token = (await cookies()).get('meritmatrix_session_token')?.value;
  if (!token) {
    return { success: false, error: 'Missing session token.' };
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/exam-subjects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...validatedFields.data,
        college_id: user.college_id,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      return {
        success: false,
        error: errorData.message || 'Failed to assign subjects to exam.',
      };
    }

    const responseData = await res.json();

    revalidatePath('/shared-management/exams');

    return {
      success: true,
      message: `${validatedFields.data.subject_ids.length} subject(s) assigned to Exam ID ${validatedFields.data.exam_id}.`,
      mappings: responseData.mappings || [],
    };
  } catch (error: any) {
    console.error('Error assigning subjects:', error);
    return {
      success: false,
      error: error.message || 'Unexpected error during subject assignment.',
    };
  }
}