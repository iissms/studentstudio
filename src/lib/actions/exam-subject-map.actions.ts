
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
