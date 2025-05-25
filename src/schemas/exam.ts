import { z } from 'zod';

export const dateSchema = z.preprocess((val) => {
  if (typeof val === 'string' || val instanceof Date) {
    const parsed = new Date(val);
    return isNaN(parsed.getTime()) ? undefined : parsed;
  }
  return undefined;
}, z.date({
  required_error: "Please select a date.",
  invalid_type_error: "That's not a valid date!",
}));

export const createExamSchema = z.object({
  class_id: z.number({
    required_error: "Please select a class.",
    invalid_type_error: "Class ID must be a number.",
  }).int().min(1, { message: "Invalid class ID." }),

  name: z.string().min(3, { message: 'Exam name must be at least 3 characters.' }).max(100),

  marks: z.coerce.number().int().min(1, { message: 'Total marks must be at least 1.' }).max(1000),

  min_marks: z.coerce.number().int().min(0, { message: 'Minimum marks cannot be negative.' }),

  start_date: dateSchema,
  end_date: dateSchema,
}).refine(data => data.marks >= data.min_marks, {
  message: "Minimum passing marks cannot exceed total marks.",
  path: ["min_marks"],
}).refine(data => {
  const startDate = new Date(data.start_date);
  const endDate = new Date(data.end_date);
  return endDate >= startDate;
}, {
  message: "End date cannot be before start date.",
  path: ["end_date"],
});

export type CreateExamFormValues = z.infer<typeof createExamSchema>;


// This type will be what the form uses internally before transformation
export type CreateExamFormInputValues = Omit<CreateExamFormValues, 'start_date' | 'end_date' | 'class_id' | 'marks' | 'min_marks'> & {
  class_id?: string; // Keep as string from select
  marks?: string | number; // Keep as string from input
  min_marks?: string | number; // Keep as string from input
  start_date?: Date;
  end_date?: Date;
};
