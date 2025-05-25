
import { z } from 'zod';

export const createClassSchema = z.object({
  class_name: z.string().min(2, { message: 'Class name must be at least 2 characters long.' }).max(100, { message: 'Class name must be 100 characters or less.' }),

  department_id: z.number({
    required_error: 'Please select a department.',
    invalid_type_error: 'Department must be a number.',
  }).int().positive({ message: 'Invalid department ID.' }),

  academic_year: z.string()
    .regex(/^\d{4}-\d{4}$/, { message: 'Academic year must be in YYYY-YYYY format (e.g., 2025-2026).' })
    .refine(val => {
      const years = val.split('-');
      const startYear = parseInt(years[0]);
      const endYear = parseInt(years[1]);
      return endYear === startYear + 1;
    }, { message: 'End year must be one year after start year (e.g., 2025-2026).' }),
});


export type CreateClassFormValues = z.infer<typeof createClassSchema>;
