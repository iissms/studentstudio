
import { z } from 'zod';

export const createDepartmentSchema = z.object({
  name: z.string().min(2, { message: 'Department name must be at least 2 characters long.' }).max(100, { message: 'Department name must be 100 characters or less.' }),
});

export type CreateDepartmentFormValues = z.infer<typeof createDepartmentSchema>;
