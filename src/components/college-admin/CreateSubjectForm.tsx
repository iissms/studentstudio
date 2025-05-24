
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { createSubjectSchema, type CreateSubjectFormValues } from '@/schemas/subject';
import { createSubject } from '@/lib/actions'; // Server action
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
import type { Class } from '@/types'; // Import Class type

// Mock function to fetch classes for the dropdown, specific to College Admin's college
// In a real app, this would fetch from an API based on the logged-in admin's college_id
async function getMockClassesForCollegeAdmin(): Promise<Class[]> {
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
  // This should ideally be filtered by the admin's college_id
  return [
    { class_id: 101, class_name: "1st PUC Science", department_id: 1, academic_year: "2024-2025", college_id: 1 },
    { class_id: 102, class_name: "2nd PUC Commerce", department_id: 3, academic_year: "2024-2025", college_id: 1 },
    { class_id: 103, class_name: "B.A. History Sem 1", department_id: 2, academic_year: "2025-2026", college_id: 1 },
  ];
}

interface CreateSubjectFormProps {
  onSuccess?: () => void;
  setDialogOpen: (open: boolean) => void;
}

export function CreateSubjectForm({ onSuccess, setDialogOpen }: CreateSubjectFormProps) {
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

  const form = useForm<CreateSubjectFormValues>({
    resolver: zodResolver(createSubjectSchema),
    defaultValues: {
      class_id: undefined,
      subject_code: '',
      subject_name: '',
      type: undefined, // Default to no type selected
    },
  });

  async function onSubmit(values: CreateSubjectFormValues) {
    setIsLoading(true);
    try {
      const result = await createSubject(values);
      if (result.success) {
        toast({
          title: 'Subject Created',
          description: result.message || `Subject "${values.subject_name}" has been successfully created.`,
        });
        onSuccess?.();
        setDialogOpen(false);
        form.reset();
      } else {
        toast({
          title: 'Creation Failed',
          description: result.error || 'Could not create the subject.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while creating the subject.',
        variant: 'destructive',
      });
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
              <FormLabel htmlFor="class_id">Assign to Class</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value?.toString()}
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
                     <SelectItem value="no-classes" disabled>No classes available for your college</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subject_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="subject_name">Subject Name</FormLabel>
              <FormControl>
                <Input
                  id="subject_name"
                  placeholder="e.g., Physics, Mathematics"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subject_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="subject_code">Subject Code</FormLabel>
              <FormControl>
                <Input
                  id="subject_code"
                  placeholder="e.g., PHY101, MATH202"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="type">Subject Type</FormLabel>
               <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select subject type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Theory">Theory</SelectItem>
                  <SelectItem value="Practical">Practical</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
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
            Add Subject
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
