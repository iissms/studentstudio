
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { createCollegeSchema, type CreateCollegeFormValues } from '@/schemas/college';
import { updateCollege } from '@/lib/actions'; // We will create this action
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { DialogFooter } from '@/components/ui/dialog';
import type { College } from '@/types';

interface EditCollegeFormProps {
  collegeToEdit: College;
  onSuccess?: () => void;
  setDialogOpen: (open: boolean) => void;
}

export function EditCollegeForm({ collegeToEdit, onSuccess, setDialogOpen }: EditCollegeFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<CreateCollegeFormValues>({
    resolver: zodResolver(createCollegeSchema),
    // Default values will be set by useEffect based on collegeToEdit
  });

  React.useEffect(() => {
    if (collegeToEdit) {
      form.reset({
        name: collegeToEdit.name,
        address: collegeToEdit.address,
        email: collegeToEdit.email || '',
        phone: collegeToEdit.phone || '',
      });
    }
  }, [collegeToEdit, form]);

  async function onSubmit(values: CreateCollegeFormValues) {
    if (!collegeToEdit) return;
    setIsLoading(true);
    try {
      const result = await updateCollege(collegeToEdit.college_id, values);
      if (result.success) {
        toast({
          title: 'College Updated',
          description: result.message || 'The college has been successfully updated.',
        });
        onSuccess?.();
        setDialogOpen(false);
      } else {
        toast({
          title: 'Update Failed',
          description: result.error || 'Could not update the college.',
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
              <FormLabel htmlFor="name">College Name</FormLabel>
              <FormControl>
                <Input
                  id="name"
                  placeholder="e.g., Global Institute of Technology"
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
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="address">Address</FormLabel>
              <FormControl>
                <Input
                  id="address"
                  placeholder="e.g., 123 Tech Park, Silicon Valley"
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="email">Email (Optional)</FormLabel>
              <FormControl>
                <Input
                  id="email"
                  type="email"
                  placeholder="e.g., contact@git.com"
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
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="phone">Phone (Optional)</FormLabel>
              <FormControl>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="e.g., 123-456-7890"
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
