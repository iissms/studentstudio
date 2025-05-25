
'use server'

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createDepartmentSchema, type CreateDepartmentFormValues } from '@/schemas/department';
import type { Department } from '@/types';
import { getUserFromCookies } from '../auth-utils';
import { mockInitialDepartments, mockCreatedDepartments } from '../mock-data';
import axios from 'axios';

export async function fetchDepartmentsForCollegeAdmin(): Promise<Department[]> {
  try {
    const user = await getUserFromCookies(await cookies());

    if (!user || (user.role !== 'COLLEGE_ADMIN' && user.role !== 'TEACHER') || !user.college_id) {
      console.warn('fetchDepartmentsForCollegeAdmin: Unauthorized or no college_id for user:', user);
      return [];
    }

    const token = (await cookies()).get('meritmatrix_session_token')?.value;
    if (!token) {
      console.warn('fetchDepartmentsForCollegeAdmin: Missing token.');
      return [];
    }

    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/departments`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data as Department[];
  } catch (error: any) {
    console.error('Failed to fetch departments from live API:', error.response?.data || error.message);
    return [];
  }
}

export async function createDepartment(
  values: CreateDepartmentFormValues
): Promise<{ success: boolean; error?: string; message?: string; department?: Department }> {
  const user = await getUserFromCookies(await cookies());
  console.log('Creating department for user:', user);

  if (!user || user.role !== 'COLLEGE_ADMIN' || !user.college_id) {
    return { success: false, error: 'Unauthorized: Only College Admins can create departments, or college ID is missing.' };
  }

  const validatedFields = createDepartmentSchema.safeParse(values);
  if (!validatedFields.success) {
    return { success: false, error: 'Invalid input for creating department.' };
  }

  try {
    const token = (await cookies()).get('meritmatrix_session_token')?.value;

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/departments`,
      { name: validatedFields.data.name },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    revalidatePath('/college-admin/departments');

    return {
      success: true,
      message: `Department "${response.data.name}" created successfully.`,
      department: response.data,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.response?.data?.message || 'Failed to create department.',
    };
  }
}

export async function updateDepartment(
  departmentId: number,
  values: CreateDepartmentFormValues
): Promise<{ success: boolean; error?: string; message?: string; department?: Department }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const user = await getUserFromCookies(await cookies());
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
