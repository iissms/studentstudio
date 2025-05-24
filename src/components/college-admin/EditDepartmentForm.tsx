
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { createDepartmentSchema, type CreateDepartmentFormValues } from '@/schemas/department';
import { updateDepartment } from '@/lib/actions';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { DialogFooter } from '@/components/ui/dialog';
import type { Department } from '@/types';

interface EditDepartmentFormProps {
  departmentToEdit: Department;
  onSuccess?: () => void;
  setDialogOpen: (open: boolean) => void;
}

export function EditDepartmentForm({ departmentToEdit, onSuccess, setDialogOpen }: EditDepartmentFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<CreateDepartmentFormValues>({
    resolver: zodResolver(createDepartmentSchema),
    defaultValues: {
      name: departmentToEdit?.name || '',
    },
  });

  React.useEffect(() => {
    if (departmentToEdit) {
      form.reset({
        name: departmentToEdit.name,
      });
    }
  }, [departmentToEdit, form]);

  async function onSubmit(values: CreateDepartmentFormValues) {
    if (!departmentToEdit) return;
    setIsLoading(true);
    try {
      const result = await updateDepartment(departmentToEdit.department_id, values);
      if (result.success) {
        toast({
          title: 'Department Updated',
          description: result.message || 'The department has been successfully updated.',
        });
        onSuccess?.();
        setDialogOpen(false);
      } else {
        toast({
          title: 'Update Failed',
          description: result.error || 'Could not update the department.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred during update.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="name">Department Name</FormLabel>
              <FormControl>
                <Input
                  id="name"
                  placeholder="e.g., Computer Science"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
