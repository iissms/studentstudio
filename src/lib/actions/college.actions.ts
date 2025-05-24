
'use server'

import { revalidatePath } from 'next/cache';
import { createCollegeSchema, type CreateCollegeFormValues } from '@/schemas/college';
import type { College } from '@/types';
import { mockInitialColleges, mockCreatedColleges } from '../mock-data';

export async function fetchColleges(): Promise<College[]> {
  await new Promise(resolve => setTimeout(resolve, 300)); 
  return [...mockInitialColleges, ...mockCreatedColleges];
}

export async function createCollege(
  values: CreateCollegeFormValues
): Promise<{ success: boolean; error?: string; message?: string; college?: College }> {
  await new Promise(resolve => setTimeout(resolve, 500));

  const validatedFields = createCollegeSchema.safeParse(values);
  if (!validatedFields.success) {
    return { success: false, error: 'Invalid input for creating college.' };
  }
  
  const mockCreatedCollege: College = {
    college_id: Math.floor(Math.random() * 10000) + 100, 
    ...validatedFields.data,
  };
  mockCreatedColleges.push(mockCreatedCollege);
  
  revalidatePath('/admin/colleges'); 

  return {
    success: true,
    message: `College "${validatedFields.data.name}" (mock) created successfully.`,
    college: mockCreatedCollege,
  };
}

export async function updateCollege(
  collegeId: number,
  values: CreateCollegeFormValues
): Promise<{ success: boolean; error?: string; message?: string; college?: College }> {
  await new Promise(resolve => setTimeout(resolve, 500));

  const validatedFields = createCollegeSchema.safeParse(values);
  if (!validatedFields.success) {
    return { success: false, error: 'Invalid input for updating college.' };
  }

  let collegeIndex = mockCreatedColleges.findIndex(c => c.college_id === collegeId);
  if (collegeIndex !== -1) {
    mockCreatedColleges[collegeIndex] = { ...mockCreatedColleges[collegeIndex], ...validatedFields.data };
    revalidatePath('/admin/colleges');
    return { success: true, message: `College "${validatedFields.data.name}" updated.`, college: mockCreatedColleges[collegeIndex] };
  }
  
  collegeIndex = mockInitialColleges.findIndex(c => c.college_id === collegeId);
  if (collegeIndex !== -1) {
    mockInitialColleges[collegeIndex] = { ...mockInitialColleges[collegeIndex], ...validatedFields.data };
    revalidatePath('/admin/colleges');
    return { success: true, message: `College "${validatedFields.data.name}" updated.`, college: mockInitialColleges[collegeIndex] };
  }

  return { success: false, error: `College with ID ${collegeId} not found for update.` };
}

export async function deleteCollege(
  collegeId: number
): Promise<{ success: boolean; error?: string; message?: string }> {
  await new Promise(resolve => setTimeout(resolve, 500));

  const initialCreatedLength = mockCreatedColleges.length;
  let tempMockCreatedColleges = mockCreatedColleges.filter(c => c.college_id !== collegeId);

  if (tempMockCreatedColleges.length < initialCreatedLength) {
    // This assignment will be an issue if mockCreatedColleges is imported elsewhere and expected to be mutated directly.
    // For this mock setup, we'll reassign, but in a real scenario, this would be a DB operation.
    // Reflecting this in `mock-data.ts` would require exporting a setter or a more complex store.
    // For now, this action correctly filters, but the original array in mock-data.ts isn't changed by this line.
    // This needs to be addressed if other actions read mockCreatedColleges expecting it to be mutated.
    // Let's assume for now that `mockCreatedColleges` is re-assigned in `mock-data.ts` if we modify it.
    // This is not possible with simple ES module exports. We'll have to operate on the imported arrays directly.
    // For deletion, we can find the index and splice.

    const createdIndex = mockCreatedColleges.findIndex(c => c.college_id === collegeId);
    if (createdIndex > -1) {
      mockCreatedColleges.splice(createdIndex, 1);
      revalidatePath('/admin/colleges');
      return {
        success: true,
        message: `College with ID ${collegeId} (mock dynamic) deleted successfully.`,
      };
    }
  }
  
  const initialStaticIndex = mockInitialColleges.findIndex(c => c.college_id === collegeId);
  if (initialStaticIndex > -1) {
    mockInitialColleges.splice(initialStaticIndex, 1);
    revalidatePath('/admin/colleges');
    return {
      success: true,
      message: `College with ID ${collegeId} (mock static) deleted successfully.`,
    };
  }

  return { success: false, error: `College with ID ${collegeId} not found.` };
}
