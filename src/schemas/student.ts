
import { z } from 'zod';
import { format } from 'date-fns';

const dateSchema = z.date({
  required_error: "Please select a date.",
  invalid_type_error: "That's not a valid date!",
}).transform(date => format(date, 'yyyy-MM-dd'));

export const createStudentSchema = z.object({
  class_id: z.string()
    .min(1, { message: "Please select a class."})
    .transform(val => parseInt(val, 10))
    .refine(val => !isNaN(val) && val > 0, { message: "Invalid class ID."}),
  roll_number: z.string().min(3, { message: 'Roll number must be at least 3 characters.' }).max(20, { message: 'Roll number must be 20 characters or less.' }),
  full_name: z.string().min(2, { message: 'Full name must be at least 2 characters.' }).max(100, { message: 'Full name must be 100 characters or less.' }),
  dob: dateSchema,
  gender: z.enum(["Male", "Female", "Other"], {
    errorMap: () => ({ message: "Please select a gender." }),
  }),
  email: z.string().email({ message: 'Invalid email address.' }).optional().or(z.literal('')),
  phone: z.string().min(10, { message: 'Phone number must be at least 10 digits.' }).max(15).optional().or(z.literal('')),
  address: z.string().min(5, { message: 'Address must be at least 5 characters.' }).optional().or(z.literal('')),
  admission_date: dateSchema,
});

export type CreateStudentFormValues = z.infer<typeof createStudentSchema>;

// This type will be what the form uses internally before transformation
export type CreateStudentFormInputValues = Omit<CreateStudentFormValues, 'dob' | 'admission_date' | 'class_id'> & {
  class_id?: string; // Keep as string from select
  dob?: Date;
  admission_date?: Date;
};
