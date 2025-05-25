import { z } from 'zod';
import { format } from 'date-fns';

const dateSchema = z.preprocess(
  (val) => val instanceof Date ? val : new Date(val as string),
  z.date({
    required_error: "Please select a date.",
    invalid_type_error: "That's not a valid date!",
  }).transform((date) => format(date, 'yyyy-MM-dd'))
);

export const createStudentSchema = z.object({
  class_id: z.preprocess(
    (val) => typeof val === 'string' || typeof val === 'number' ? Number(val) : undefined,
    z.number().int().min(1, { message: "Invalid class ID." })
  ),
  roll_number: z.string().min(3, { message: 'Roll number must be at least 3 characters.' }).max(20),
  full_name: z.string().min(2).max(100),
  dob: dateSchema,
  gender: z.enum(["Male", "Female", "Other"], {
    errorMap: () => ({ message: "Please select a gender." }),
  }),
  email: z.string().email({ message: 'Invalid email address.' }).optional().or(z.literal('')),
  phone: z.string().min(10).max(15).optional().or(z.literal('')),
  address: z.string().min(5).optional().or(z.literal('')),
  admission_date: dateSchema,
});

export type CreateStudentFormValues = z.infer<typeof createStudentSchema>;

export type CreateStudentFormInputValues = Omit<CreateStudentFormValues, 'dob' | 'admission_date' | 'class_id'> & {
  class_id?: string;
  dob?: Date;
  admission_date?: Date;
};
