
'use server'

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createSubjectSchema, type CreateSubjectFormValues } from '@/schemas/subject';
import type { Subject } from '@/types';
import { getUserFromCookies } from '../auth-utils';
import { mockInitialSubjects, mockCreatedSubjects, mockInitialClasses, mockCreatedClasses } from '../mock-data';

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
    let subjectToUpdate = mockCreatedSubjects.find(s => s.subject_id === subjectId && s.college_id === collegeId);
    if (subjectToUpdate) {
        Object.assign(subjectToUpdate, { ...validatedFields.data, college_id: collegeId });
        revalidatePath('/shared-management/subjects');
        return { success: true, message: `Subject "${validatedFields.data.subject_name}" updated.`, subject: subjectToUpdate };
    }
    
    subjectToUpdate = mockInitialSubjects.find(s => s.subject_id === subjectId && s.college_id === collegeId);
    if (subjectToUpdate) {
        Object.assign(subjectToUpdate, { ...validatedFields.data, college_id: collegeId });
        revalidatePath('/shared-management/subjects');
        return { success: true, message: `Subject "${validatedFields.data.subject_name}" updated.`, subject: subjectToUpdate };
    }

    return { success: false, error: `Subject with ID ${subjectId} not found in your college.` };
}
