
'use client';

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { createExamSchema, type CreateExamFormValues, type CreateExamFormInputValues } from '@/schemas/exam';
import { createExam } from '@/lib/actions'; // Server action
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
import { DatePicker } from '@/components/ui/date-picker'; // New DatePicker
import type { Class } from '@/types';

// Mock function to fetch classes for the dropdown
async function getMockClassesForCollegeAdmin(): Promise<Class[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return [
    { class_id: 101, class_name: "1st PUC Science", department_id: 1, academic_year: "2024-2025", college_id: 1 },
    { class_id: 102, class_name: "2nd PUC Commerce", department_id: 3, academic_year: "2024-2025", college_id: 1 },
    { class_id: 103, class_name: "B.A. History Sem 1", department_id: 2, academic_year: "2025-2026", college_id: 1 },
  ];
}

interface CreateExamFormProps {
  onSuccess?: () => void;
  setDialogOpen: (open: boolean) => void;
}

export function CreateExamForm({ onSuccess, setDialogOpen }: CreateExamFormProps) {
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

  const form = useForm<CreateExamFormInputValues>({
    resolver: zodResolver(createExamSchema),
    defaultValues: {
      class_id: undefined,
      name: '',
      marks: undefined, // Will be coerced to number
      min_marks: undefined, // Will be coerced to number
      start_date: undefined,
      end_date: undefined,
    },
  });

  async function onSubmit(values: CreateExamFormInputValues) {
    setIsLoading(true);

    // The schema handles the transformation, including date formatting
    // So we can directly pass `values` if the schema is set up for it.
    // Ensure the schema output (CreateExamFormValues) matches action input type.
    try {
      // The resolver already transformed the values to CreateExamFormValues (with formatted dates)
      const validatedValues = createExamSchema.parse(values);
      const result = await createExam(validatedValues);

      if (result.success) {
        toast({
          title: 'Exam Created',
          description: result.message || `Exam "${values.name}" has been successfully created.`,
        });
        onSuccess?.();
        setDialogOpen(false);
        form.reset();
      } else {
        toast({
          title: 'Creation Failed',
          description: result.error || 'Could not create the exam.',
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
          description: 'An unexpected error occurred while creating the exam.',
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="name">Exam Name</FormLabel>
              <FormControl>
                <Input id="name" placeholder="e.g., Midterm 1, Final Exam" disabled={isLoading} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="marks"
            render={({ field }) => (
                <FormItem>
                <FormLabel htmlFor="marks">Total Marks</FormLabel>
                <FormControl>
                    <Input id="marks" type="number" placeholder="e.g., 100" disabled={isLoading} {...field} 
                    onChange={e => field.onChange(e.target.valueAsNumber || '')}
                    value={field.value ?? ''}
                    />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="min_marks"
            render={({ field }) => (
                <FormItem>
                <FormLabel htmlFor="min_marks">Min. Passing Marks</FormLabel>
                <FormControl>
                    <Input id="min_marks" type="number" placeholder="e.g., 35" disabled={isLoading} {...field} 
                    onChange={e => field.onChange(e.target.valueAsNumber || '')}
                    value={field.value ?? ''}
                    />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        
        <FormField
          control={form.control}
          name="start_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel htmlFor="start_date">Start Date</FormLabel>
              <DatePicker 
                value={field.value}
                onChange={field.onChange}
                disabled={isLoading}
                placeholder="Select exam start date"
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="end_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel htmlFor="end_date">End Date</FormLabel>
              <DatePicker 
                value={field.value}
                onChange={field.onChange}
                disabled={isLoading}
                placeholder="Select exam end date"
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter className="pt-4">
          <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || isClassesLoading}>
            {(isLoading || isClassesLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Exam
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
