
'use server'

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createDepartmentSchema, type CreateDepartmentFormValues } from '@/schemas/department';
import type { Department } from '@/types';
import { getUserFromCookies } from '../auth-utils';
import { mockInitialDepartments, mockCreatedDepartments } from '../mock-data';

export async function fetchDepartmentsForCollegeAdmin(): Promise<Department[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  const user = await getUserFromCookies(cookies());
  if (!user || (user.role !== 'COLLEGE_ADMIN' && user.role !== 'TEACHER') || !user.college_id) {
    console.warn('fetchDepartmentsForCollegeAdmin: Unauthorized or no college_id for user:', user);
    return [];
  }
  const allDepartments = [...mockInitialDepartments, ...mockCreatedDepartments];
  return allDepartments.filter(dept => dept.college_id === user.college_id);
}

export async function createDepartment(
  values: CreateDepartmentFormValues
): Promise<{ success: boolean; error?: string; message?: string; department?: Department }> {
  await new Promise(resolve => setTimeout(resolve, 500)); 

  const user = await getUserFromCookies(cookies());
  if (!user || user.role !== 'COLLEGE_ADMIN' || !user.college_id) {
    return { success: false, error: 'Unauthorized: Only College Admins can create departments, or college ID is missing.' };
  }

  const validatedFields = createDepartmentSchema.safeParse(values);
  if (!validatedFields.success) {
    return { success: false, error: 'Invalid input for creating department.' };
  }

  const { name } = validatedFields.data;
  const collegeId = user.college_id;

  const newDepartment: Department = {
    department_id: Math.floor(Math.random() * 10000) + 500, 
    name,
    college_id: collegeId,
  };

  mockCreatedDepartments.push(newDepartment);
  
  revalidatePath('/college-admin/departments');

  return {
    success: true,
    message: `Department "${name}" (mock) created successfully for your college.`,
    department: newDepartment,
  };
}

export async function updateDepartment(
  departmentId: number,
  values: CreateDepartmentFormValues
): Promise<{ success: boolean; error?: string; message?: string; department?: Department }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const user = await getUserFromCookies(cookies());
    if (!user || user.role !== 'COLLEGE_ADMIN' || !user.college_id) {
        return { success: false, error: 'Unauthorized or college ID missing.' };
    }

    const validatedFields = createDepartmentSchema.safeParse(values);
    if (!validatedFields.success) {
        return { success: false, error: 'Invalid input for updating department.' };
    }

    let deptToUpdate = mockCreatedDepartments.find(d => d.department_id === departmentId && d.college_id === user.college_id);
    if (deptToUpdate) {
        Object.assign(deptToUpdate, { ...validatedFields.data, college_id: user.college_id });
        revalidatePath('/college-admin/departments');
        return { success: true, message: `Department "${validatedFields.data.name}" updated.`, department: deptToUpdate };
    }
    
    deptToUpdate = mockInitialDepartments.find(d => d.department_id === departmentId && d.college_id === user.college_id);
    if (deptToUpdate) {
        Object.assign(deptToUpdate, { ...validatedFields.data, college_id: user.college_id });
        revalidatePath('/college-admin/departments');
        return { success: true, message: `Department "${validatedFields.data.name}" updated.`, department: deptToUpdate };
    }

    return { success: false, error: `Department with ID ${departmentId} not found in your college.` };
}
