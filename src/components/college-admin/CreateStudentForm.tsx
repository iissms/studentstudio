
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { createStudentSchema, type CreateStudentFormValues, type CreateStudentFormInputValues } from '@/schemas/student';
import { createStudent } from '@/lib/actions'; // Server action
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DialogFooter } from '@/components/ui/dialog';
import { DatePicker } from '@/components/ui/date-picker';
import type { Class } from '@/types';
import { ScrollArea } from '../ui/scroll-area';


// Mock function to fetch classes for the dropdown
async function getMockClassesForCollegeAdmin(): Promise<Class[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return [
    { class_id: 101, class_name: "1st PUC Science", department_id: 1, academic_year: "2024-2025", college_id: 1 },
    { class_id: 102, class_name: "2nd PUC Commerce", department_id: 3, academic_year: "2024-2025", college_id: 1 },
    { class_id: 103, class_name: "B.A. History Sem 1", department_id: 2, academic_year: "2025-2026", college_id: 1 },
     // Add more mock classes as needed, ensuring they'd belong to the current admin's college
  ];
}

interface CreateStudentFormProps {
  onSuccess?: () => void;
  setDialogOpen: (open: boolean) => void;
}

export function CreateStudentForm({ onSuccess, setDialogOpen }: CreateStudentFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [classes, setClasses] = React.useState<Class[]>([]);
  const [isClassesLoading, setIsClassesLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadClasses() {
      setIsClassesLoading(true);
      const fetchedClasses = await getMockClassesForCollegeAdmin();
      setClasses(fetchedClasses);
      setIsClassesLoading(false);
    }
    loadClasses();
  }, []);

  const form = useForm<CreateStudentFormInputValues>({
    resolver: zodResolver(createStudentSchema),
    defaultValues: {
      class_id: undefined,
      roll_number: '',
      full_name: '',
      dob: undefined,
      gender: undefined,
      email: '',
      phone: '',
      address: '',
      admission_date: new Date(), // Default to today
    },
  });

  async function onSubmit(values: CreateStudentFormInputValues) {
    setIsLoading(true);
    try {
      // The resolver already transformed the values to CreateStudentFormValues (with formatted dates)
      const validatedValues = createStudentSchema.parse(values);
      const result = await createStudent(validatedValues);

      if (result.success) {
        toast({
          title: 'Student Added',
          description: result.message || `Student "${validatedValues.full_name}" has been successfully added.`,
        });
        onSuccess?.();
        setDialogOpen(false);
        form.reset();
      } else {
        toast({
          title: 'Creation Failed',
          description: result.error || 'Could not add the student.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: 'Validation Error',
          description: "Please check the form for errors.",
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: 'An unexpected error occurred while adding the student.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
       <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <ScrollArea className="h-[calc(80vh-10rem)] pr-6"> {/* Adjust height as needed */}
        <div className="space-y-4">
            <FormField
            control={form.control}
            name="class_id"
            render={({ field }) => (
                <FormItem>
                <FormLabel htmlFor="class_id">Class</FormLabel>
                <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading || isClassesLoading}
                >
                    <FormControl>
                    <SelectTrigger id="class_id">
                        <SelectValue placeholder={isClassesLoading ? "Loading classes..." : "Select a class"} />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    {isClassesLoading ? (
                        <SelectItem value="loading" disabled>Loading...</SelectItem>
                    ) : classes.length > 0 ? (
                        classes.map((cls) => (
                        <SelectItem key={cls.class_id} value={cls.class_id.toString()}>
                            {cls.class_name} ({cls.academic_year})
                        </SelectItem>
                        ))
                    ) : (
                        <SelectItem value="no-classes" disabled>No classes available</SelectItem>
                    )}
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />

            <FormField
            control={form.control}
            name="roll_number"
            render={({ field }) => (
                <FormItem>
                <FormLabel htmlFor="roll_number">Roll Number</FormLabel>
                <FormControl>
                    <Input id="roll_number" placeholder="e.g., PUC24SCI007" disabled={isLoading} {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />

            <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
                <FormItem>
                <FormLabel htmlFor="full_name">Full Name</FormLabel>
                <FormControl>
                    <Input id="full_name" placeholder="e.g., Lohith R" disabled={isLoading} {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />

            <FormField
            control={form.control}
            name="dob"
            render={({ field }) => (
                <FormItem className="flex flex-col">
                <FormLabel htmlFor="dob">Date of Birth</FormLabel>
                <DatePicker 
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isLoading}
                    placeholder="Select date of birth"
                />
                <FormMessage />
                </FormItem>
            )}
            />

            <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
                <FormItem>
                <FormLabel htmlFor="gender">Gender</FormLabel>
                <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                >
                    <FormControl>
                    <SelectTrigger id="gender">
                        <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />

            <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
                <FormItem>
                <FormLabel htmlFor="email">Email (Optional)</FormLabel>
                <FormControl>
                    <Input id="email" type="email" placeholder="e.g., lohith@gmail.com" disabled={isLoading} {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />

            <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
                <FormItem>
                <FormLabel htmlFor="phone">Phone (Optional)</FormLabel>
                <FormControl>
                    <Input id="phone" type="tel" placeholder="e.g., 9876543210" disabled={isLoading} {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />

            <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
                <FormItem>
                <FormLabel htmlFor="address">Address (Optional)</FormLabel>
                <FormControl>
                    <Textarea id="address" placeholder="Enter student's address" disabled={isLoading} {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />

            <FormField
            control={form.control}
            name="admission_date"
            render={({ field }) => (
                <FormItem className="flex flex-col">
                <FormLabel htmlFor="admission_date">Admission Date</FormLabel>
                <DatePicker 
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isLoading}
                    placeholder="Select admission date"
                />
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        </ScrollArea>
        <DialogFooter className="pt-6">
          <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || isClassesLoading}>
            {(isLoading || isClassesLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Student
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
