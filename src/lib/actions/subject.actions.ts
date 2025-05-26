
'use server'

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createSubjectSchema, type CreateSubjectFormValues } from '@/schemas/subject';
import type { Subject } from '@/types';
import { getUserFromCookies } from '../auth-utils';
import { mockInitialSubjects, mockCreatedSubjects, mockInitialClasses, mockCreatedClasses } from '../mock-data';
import axios from 'axios';

export async function fetchSubjectsForCollegeAdmin(): Promise<Subject[]> {
  try {
    const user = await getUserFromCookies(await cookies());

    if (!user || (user.role !== 'COLLEGE_ADMIN' && user.role !== 'TEACHER') || !user.college_id) {
      console.warn('Unauthorized or missing college_id for fetchSubjectsForCollegeAdmin');
      return [];
    }

    const token = (await cookies()).get('meritmatrix_session_token')?.value;

    if (!token) {
      console.warn('Missing token for fetchSubjectsForCollegeAdmin');
      return [];
    }

    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/subjects`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      }
    );

    return response.data as Subject[];
  } catch (error: any) {
    console.error('Error fetching subjects:', error.response?.data || error.message);
    return [];
  }
}

export async function fetchSubjectsByDepartment(departmentId: number): Promise<Subject[]> {
  const cookieStore = cookies();
  const user = await getUserFromCookies(await cookieStore);
  const token = (await cookieStore).get('meritmatrix_session_token')?.value;

  if (!user || !token) {
    console.warn('fetchSubjectsByDepartment: Unauthorized or missing data.');
    return [];
  }

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/subjects/by-department/${departmentId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        next: { revalidate: 60 }, // Optional: cache
      }
    );

    if (!res.ok) {
      console.error('Failed to fetch subjects:', res.statusText);
      return [];
    }

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching subjects by department:', error);
    return [];
  }
}


export async function createSubject(
  values: CreateSubjectFormValues
): Promise<{ success: boolean; error?: string; message?: string; subject?: Subject }> {
  const user = await getUserFromCookies(await cookies());

  if (!user || (user.role !== 'COLLEGE_ADMIN' && user.role !== 'TEACHER') || !user.college_id) {
    return { success: false, error: 'Unauthorized: Only College Admins or Teachers can create subjects, or college ID is missing.' };
  }

  const validatedFields = createSubjectSchema.safeParse(values);
if (!validatedFields.success) {
  console.error('Zod validation failed:', validatedFields.error.format());
  return { success: false, error: 'Invalid input for creating subject.' };
}


  try {
    const token = (await cookies()).get('meritmatrix_session_token')?.value;

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/subjects`,
      validatedFields.data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      }
    );

    revalidatePath('/shared-management/subjects');

    return {
      success: true,
      message: `Subject "${response.data.subject_name}" created successfully.`,
      subject: response.data
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to create subject.'
    };
  }
}

export async function updateSubject(
  subjectId: number,
  values: CreateSubjectFormValues
): Promise<{ success: boolean; error?: string; message?: string; subject?: Subject }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const user = await getUserFromCookies(await cookies());
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
