
'use server'

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createClassSchema, type CreateClassFormValues } from '@/schemas/class';
import type { Class } from '@/types';
import { getUserFromCookies } from '../auth-utils';
import { mockInitialClasses, mockCreatedClasses, mockInitialDepartments, mockCreatedDepartments } from '../mock-data';

export async function fetchClassesForCollegeAdmin(): Promise<Class[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  const user = await getUserFromCookies(cookies());
  if (!user || (user.role !== 'COLLEGE_ADMIN' && user.role !== 'TEACHER') || !user.college_id) {
    console.warn('fetchClassesForCollegeAdmin: Unauthorized or no college_id for user:', user);
    return [];
  }
  
  const allDepartments = [...mockInitialDepartments, ...mockCreatedDepartments];
  const collegeDepartments = allDepartments.filter(dept => dept.college_id === user.college_id);
  
  const allCollegeClasses = [...mockInitialClasses, ...mockCreatedClasses].filter(c => c.college_id === user.college_id);

  return allCollegeClasses.map(cls => ({
    ...cls,
    department_name: collegeDepartments.find(d => d.department_id === cls.department_id)?.name || "Unknown Dept."
  }));
}

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
