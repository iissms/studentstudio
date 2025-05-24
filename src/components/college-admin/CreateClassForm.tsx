
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { createClassSchema, type CreateClassFormValues } from '@/schemas/class';
import { createClass } from '@/lib/actions'; // Server action
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
import type { Department } from '@/types';

// Mock function to fetch departments for the dropdown, specific to College Admin's college
// In a real app, this would fetch from an API based on the logged-in admin's college_id
async function getMockDepartmentsForCollegeAdmin(): Promise<Department[]> {
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
  // This should ideally be filtered by the admin's college_id
  return [
    { department_id: 1, name: "Science Department", college_id: 1 },
    { department_id: 2, name: "Humanities Department", college_id: 1 },
    { department_id: 3, name: "Commerce Studies", college_id: 1 },
    { department_id: 4, name: "Mathematics", college_id: 1 },
    // Add more mock departments if needed, assuming they belong to the same college
  ];
}

interface CreateClassFormProps {
  onSuccess?: () => void;
  setDialogOpen: (open: boolean) => void;
}

export function CreateClassForm({ onSuccess, setDialogOpen }: CreateClassFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [departments, setDepartments] = React.useState<Department[]>([]);
  const [isDepartmentsLoading, setIsDepartmentsLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadDepartments() {
      setIsDepartmentsLoading(true);
      // In a real app, pass college_id or fetch based on user session
      const fetchedDepartments = await getMockDepartmentsForCollegeAdmin();
      setDepartments(fetchedDepartments);
      setIsDepartmentsLoading(false);
    }
    loadDepartments();
  }, []);

  const form = useForm<CreateClassFormValues>({
    resolver: zodResolver(createClassSchema),
    defaultValues: {
      class_name: '',
      department_id: undefined,
      academic_year: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`, // Default to current-next academic year
    },
  });

  async function onSubmit(values: CreateClassFormValues) {
    setIsLoading(true);
    try {
      const result = await createClass(values);
      if (result.success) {
        toast({
          title: 'Class Created',
          description: result.message || `Class "${values.class_name}" has been successfully created.`,
        });
        onSuccess?.();
        setDialogOpen(false);
        form.reset();
      } else {
        toast({
          title: 'Creation Failed',
          description: result.error || 'Could not create the class.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while creating the class.',
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
          name="class_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="class_name">Class Name</FormLabel>
              <FormControl>
                <Input
                  id="class_name"
                  placeholder="e.g., 10th Standard, 2nd PUC Science"
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
          name="department_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="department_id">Department</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value?.toString()}
                disabled={isLoading || isDepartmentsLoading}
              >
                <FormControl>
                  <SelectTrigger id="department_id">
                    <SelectValue placeholder={isDepartmentsLoading ? "Loading departments..." : "Select a department"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {isDepartmentsLoading ? (
                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                  ) : departments.length > 0 ? (
                    departments.map((dept) => (
                      <SelectItem key={dept.department_id} value={dept.department_id.toString()}>
                        {dept.name}
                      </SelectItem>
                    ))
                  ) : (
                     <SelectItem value="no-departments" disabled>No departments available</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="academic_year"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="academic_year">Academic Year</FormLabel>
              <FormControl>
                <Input
                  id="academic_year"
                  placeholder="e.g., 2025-2026"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter className="pt-4">
          <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || isDepartmentsLoading}>
            {(isLoading || isDepartmentsLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Class
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
