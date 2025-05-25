
'use server'

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import axios from 'axios';
import { createClassSchema, type CreateClassFormValues } from '@/schemas/class';
import type { Class } from '@/types';
import { getUserFromCookies } from '../auth-utils';
import { mockInitialClasses, mockCreatedClasses, mockInitialDepartments, mockCreatedDepartments } from '../mock-data';

export async function fetchClassesForCollegeAdmin(): Promise<Class[]> {
  try {
    const user = await getUserFromCookies(await cookies());

    if (!user || (user.role !== 'COLLEGE_ADMIN' && user.role !== 'TEACHER') || !user.college_id) {
      console.warn('fetchClassesForCollegeAdmin: Unauthorized or no college_id for user:', user);
      return [];
    }

    const token = (await cookies()).get('meritmatrix_session_token')?.value;

    if (!token) {
      console.warn('fetchClassesForCollegeAdmin: Missing token.');
      return [];
    }

    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/classes`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      }
    );

    return response.data as Class[];
  } catch (error: any) {
    console.error('Failed to fetch classes from live API:', error.response?.data || error.message);
    return [];
  }
}

export async function createClass(
  values: CreateClassFormValues
): Promise<{ success: boolean; error?: string; message?: string; class?: Class }> {
  const user = await getUserFromCookies(await cookies());

  if (!user || user.role !== 'COLLEGE_ADMIN' || !user.college_id) {
    return { success: false, error: 'Unauthorized: Only College Admins can create classes, or college ID is missing.' };
  }

  const validatedFields = createClassSchema.safeParse(values);
if (!validatedFields.success) {
  console.error('Zod validation failed:', validatedFields.error.format());
  return { success: false, error: 'Invalid input for creating class.' };
}


  try {
    const token = (await cookies()).get('meritmatrix_session_token')?.value;

    console.log('Creating class for user:', user);

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/classes`,
      validatedFields.data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      }
    );

    revalidatePath('/college-admin/classes');

    return {
      success: true,
      message: `Class "${response.data.class_name}" created successfully.`,
      class: response.data
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to create class.'
    };
  }
}

export async function updateClass(
  classId: number,
  values: CreateClassFormValues
): Promise<{ success: boolean; error?: string; message?: string; class?: Class }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const user = await getUserFromCookies(await cookies());
    if (!user || user.role !== 'COLLEGE_ADMIN' || !user.college_id) {
        return { success: false, error: 'Unauthorized or college ID missing.' };
    }

    const validatedFields = createClassSchema.safeParse(values);
    if (!validatedFields.success) {
        return { success: false, error: 'Invalid input for updating class.' };
    }

    let classToUpdate = mockCreatedClasses.find(c => c.class_id === classId && c.college_id === user.college_id);
    if (classToUpdate) {
        Object.assign(classToUpdate, { ...validatedFields.data, college_id: user.college_id });
        revalidatePath('/college-admin/classes');
        return { success: true, message: `Class "${validatedFields.data.class_name}" updated.`, class: classToUpdate };
    }

    classToUpdate = mockInitialClasses.find(c => c.class_id === classId && c.college_id === user.college_id);
    if (classToUpdate) {
        Object.assign(classToUpdate, { ...validatedFields.data, college_id: user.college_id });
        revalidatePath('/college-admin/classes');
        return { success: true, message: `Class "${validatedFields.data.class_name}" updated.`, class: classToUpdate };
    }
    return { success: false, error: `Class with ID ${classId} not found in your college.` };
}
