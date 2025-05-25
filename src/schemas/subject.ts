
import { z } from 'zod';

export const createSubjectSchema = z.object({
  class_id: z.number({
    required_error: "Please select a class.",
    invalid_type_error: "Class ID must be a number.",
  }).int().positive({ message: "Invalid class ID." }),

  subject_code: z.string()
    .min(2, { message: 'Subject code must be at least 2 characters.' })
    .max(20, { message: 'Subject code must be 20 characters or less.' }),

  subject_name: z.string()
    .min(3, { message: 'Subject name must be at least 3 characters.' })
    .max(100, { message: 'Subject name must be 100 characters or less.' }),

  type: z.enum(["Theory", "Practical", "Other"], {
    errorMap: () => ({ message: "Please select a valid subject type." }),
  }),
});

export type CreateSubjectFormValues = z.infer<typeof createSubjectSchema>;
