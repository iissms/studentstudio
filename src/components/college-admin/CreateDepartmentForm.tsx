
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { createDepartmentSchema, type CreateDepartmentFormValues } from '@/schemas/department';
import { createDepartment } from '@/lib/actions';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { DialogFooter } from '@/components/ui/dialog';

interface CreateDepartmentFormProps {
  onSuccess?: () => void;
  setDialogOpen: (open: boolean) => void;
}

export function CreateDepartmentForm({ onSuccess, setDialogOpen }: CreateDepartmentFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<CreateDepartmentFormValues>({
    resolver: zodResolver(createDepartmentSchema),
    defaultValues: {
      name: '',
    },
  });

  async function onSubmit(values: CreateDepartmentFormValues) {
    setIsLoading(true);
    try {
      const result = await createDepartment(values);
      if (result.success) {
        toast({
          title: 'Department Created',
          description: result.message || `Department "${values.name}" has been successfully created.`,
        });
        onSuccess?.();
        setDialogOpen(false);
        form.reset();
      } else {
        toast({
          title: 'Creation Failed',
          description: result.error || 'Could not create the department.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while creating the department.',
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
            Create Department
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
