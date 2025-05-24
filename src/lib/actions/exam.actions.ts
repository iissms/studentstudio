
'use server'

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createExamSchema, type CreateExamFormValues } from '@/schemas/exam';
import type { Exam } from '@/types';
import { getUserFromCookies } from '../auth-utils';
import { mockInitialExams, mockCreatedExams, mockInitialClasses, mockCreatedClasses } from '../mock-data';
import { z } from 'zod';

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

export async function createExam(
  values: CreateExamFormValues 
): Promise<{ success: boolean; error?: string; message?: string; exam?: Exam }> {
  await new Promise(resolve => setTimeout(resolve, 500));

  const user = await getUserFromCookies(cookies());
  if (!user || (user.role !== 'COLLEGE_ADMIN' && user.role !== 'TEACHER') || !user.college_id) {
    return { success: false, error: 'Unauthorized: Only College Admins or Teachers can create exams, or college ID is missing.' };
  }
  
  // Values are already validated and transformed by the schema in the form component
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
