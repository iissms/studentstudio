
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { createCollegeSchema, type CreateCollegeFormValues } from '@/schemas/college';
import { createCollege } from '@/lib/actions'; // We will create this action
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { DialogFooter } from '@/components/ui/dialog'; // For styling the form footer

interface CreateCollegeFormProps {
  onSuccess?: () => void;
  setDialogOpen: (open: boolean) => void;
}

export function CreateCollegeForm({ onSuccess, setDialogOpen }: CreateCollegeFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<CreateCollegeFormValues>({
    resolver: zodResolver(createCollegeSchema),
    defaultValues: {
      name: '',
      address: '',
      email: '',
      phone: '',
    },
  });

  async function onSubmit(values: CreateCollegeFormValues) {
    setIsLoading(true);
    try {
      const result = await createCollege(values);
      if (result.success) {
        toast({
          title: 'College Created',
          description: result.message || 'The new college has been successfully created.',
        });
        onSuccess?.();
        setDialogOpen(false); // Close the dialog on success
        form.reset(); // Reset form fields
      } else {
        toast({
          title: 'Creation Failed',
          description: result.error || 'Could not create the college.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
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
            Create College
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
