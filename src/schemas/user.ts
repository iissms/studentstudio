
import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string()
    .min(8, { message: 'Password must be at least 8 characters long.' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter.' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter.' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number.' })
    .regex(/[^a-zA-Z0-9]/, { message: 'Password must contain at least one special character (e.g., Test@123).' }),
  role: z.literal('COLLEGE_ADMIN').default('COLLEGE_ADMIN'),
  college_id: z.string() // Value from Select is string
    .min(1, { message: "Please select a college."}) 
    .transform(val => parseInt(val, 10))
    .refine(val => !isNaN(val) && val > 0, { message: "Invalid college ID."}),
  name: z.string().min(2, {message: "Name must be at least 2 characters long."}).optional(), // Added optional name
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;

// Schema for displaying users (example, not fully implemented for display yet)
export const UserSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  email: z.string().email().nullable(),
  role: z.enum(["ADMIN", "COLLEGE_ADMIN", "TEACHER", "STUDENT", "GUEST"]),
  college_id: z.number().nullable().optional(),
  college_name: z.string().nullable().optional(), // For display purposes
});

export type UserDisplayInfo = z.infer<typeof UserSchema>;
