
'use server'

import { revalidatePath } from 'next/cache';
import { createUserSchema, type CreateUserFormValues } from '@/schemas/user';
import type { User } from '@/types';
import { mockCreatedUsers } from '../mock-data'; // Assuming mockUsersDb is for login, mockCreatedUsers for new ones

export async function createUser(
  values: CreateUserFormValues
): Promise<{ success: boolean; error?: string; message?: string; user?: User & { college_id?: number } }> {
  await new Promise(resolve => setTimeout(resolve, 500));

  const validatedFields = createUserSchema.safeParse(values);
  if (!validatedFields.success) {
    console.error("User creation validation errors:", validatedFields.error.flatten().fieldErrors);
    return { success: false, error: 'Invalid input for creating user. Check console for details.' };
  }

  const { email, password, role, college_id, name } = validatedFields.data;

  // Check mockUsersDb (from mock-data) if it's intended to be a source of truth for existing users
  // For now, this createUser action only adds to mockCreatedUsers
  if (mockCreatedUsers.some(u => u.email === email)) { // Simplified check
    return { success: false, error: `User with email ${email} already exists in created list.` };
  }
  
  const newUserId = String(Date.now());
  const newUser: User & {password: string, college_id?: number} = {
    id: newUserId,
    email,
    name: name || `User ${email.split('@')[0]}`,
    role,
    password, 
    college_id,
  };

  mockCreatedUsers.push(newUser);
  
  revalidatePath('/admin/users');

  return {
    success: true,
    message: `User "${email}" (mock College Admin) created successfully.`,
    user: newUser,
  };
}
