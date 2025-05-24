
import { z } from 'zod';

export const assignSubjectsToExamSchema = z.object({
  exam_id: z.number().positive({ message: "Invalid Exam ID." }),
  subject_ids: z.array(z.number().positive())
    .min(1, { message: "Please select at least one subject to assign." }),
});

export type AssignSubjectsToExamFormValues = z.infer<typeof assignSubjectsToExamSchema>;
