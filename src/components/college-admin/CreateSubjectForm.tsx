'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  createSubjectSchema,
  type CreateSubjectFormValues,
} from '@/schemas/subject';
import { createSubject, fetchDepartmentsForCollegeAdmin } from '@/lib/actions';

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
} from '@/components/ui/select';
import { DialogFooter } from '@/components/ui/dialog';
import type { Department } from '@/types';

export interface CreateSubjectFormProps {
  onSuccess?: () => void;
  setDialogOpen: (open: boolean) => void;
}

export function CreateSubjectForm({
  onSuccess,
  setDialogOpen,
}: CreateSubjectFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [departments, setDepartments] = React.useState<Department[]>([]);
  const [isDepartmentsLoading, setIsDepartmentsLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadDepartments() {
      setIsDepartmentsLoading(true);
      try {
        const fetched = await fetchDepartmentsForCollegeAdmin();
        setDepartments(fetched);
      } catch (error) {
        console.error('Failed to fetch departments:', error);
        toast({
          title: 'Error',
          description: 'Could not load departments for selection.',
          variant: 'destructive',
        });
        setDepartments([]);
      } finally {
        setIsDepartmentsLoading(false);
      }
    }
    loadDepartments();
  }, [toast]);

  const form = useForm<CreateSubjectFormValues>({
    resolver: zodResolver(createSubjectSchema),
    defaultValues: {
      department_id: undefined,
      subject_code: '',
      subject_name: '',
      type: undefined,
    },
  });

  async function onSubmit(values: CreateSubjectFormValues) {
    setIsLoading(true);
    try {
      const result = await createSubject(values);
      if (result.success) {
        toast({
          title: 'Subject Created',
          description:
            result.message ||
            `Subject "${values.subject_name}" has been successfully created.`,
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
          name="department_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="department_id">Department</FormLabel>
              <Select
                onValueChange={(val) => field.onChange(Number(val))}
                value={field.value?.toString()}
                disabled={isLoading || isDepartmentsLoading}
              >
                <FormControl>
                  <SelectTrigger id="department_id">
                    <SelectValue
                      placeholder={
                        isDepartmentsLoading
                          ? 'Loading departments...'
                          : 'Select a department'
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {isDepartmentsLoading ? (
                    <SelectItem value="loading" disabled>
                      Loading...
                    </SelectItem>
                  ) : departments.length > 0 ? (
                    departments.map((dept) => (
                      <SelectItem
                        key={dept.department_id}
                        value={dept.department_id.toString()}
                      >
                        {dept.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-depts" disabled>
                      No departments available
                    </SelectItem>
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
                  placeholder="e.g., Physics, Chemistry"
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
                  placeholder="e.g., PHY101, CHEM202"
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
          <Button
            type="button"
            variant="outline"
            onClick={() => setDialogOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || isDepartmentsLoading}>
            {(isLoading || isDepartmentsLoading) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Add Subject
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
