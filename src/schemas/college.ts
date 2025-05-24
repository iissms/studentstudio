
import { z } from 'zod';

export const createCollegeSchema = z.object({
  name: z.string().min(3, { message: 'College name must be at least 3 characters long.' }),
  address: z.string().min(5, { message: 'Address must be at least 5 characters long.' }),
  email: z.string().email({ message: 'Invalid email address.' }).optional().or(z.literal('')),
  phone: z.string().min(10, { message: 'Phone number must be at least 10 digits.' }).optional().or(z.literal('')),
});

export type CreateCollegeFormValues = z.infer<typeof createCollegeSchema>;
