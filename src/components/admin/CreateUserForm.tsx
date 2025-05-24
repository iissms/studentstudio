
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { createUserSchema, type CreateUserFormValues } from '@/schemas/user';
import { createUser, fetchColleges } from '@/lib/actions'; // Updated import
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
import type { College } from '@/types';
import { z } from 'zod';

interface CreateUserFormProps {
  onSuccess?: () => void;
  setDialogOpen: (open: boolean) => void;
}

export function CreateUserForm({ onSuccess, setDialogOpen }: CreateUserFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [colleges, setColleges] = React.useState<College[]>([]);
  const [isCollegesLoading, setIsCollegesLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadCollegesForDropdown() {
      setIsCollegesLoading(true);
      try {
        const fetchedColleges = await fetchColleges(); // Use the new fetch action
        setColleges(fetchedColleges);
      } catch (error) {
        console.error("Failed to fetch colleges for dropdown:", error);
        toast({ title: "Error", description: "Could not load colleges.", variant: "destructive"});
        setColleges([]);
      } finally {
        setIsCollegesLoading(false);
      }
    }
    loadCollegesForDropdown();
  }, [toast]);

  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: '',
      password: '',
      role: 'COLLEGE_ADMIN',
      college_id: undefined, 
      name: '',
    },
  });

  async function onSubmit(values: CreateUserFormValues) {
    setIsLoading(true);
    try {
      const payload = { ...values, role: 'COLLEGE_ADMIN' as const };
      const result = await createUser(payload);
      
      if (result.success) {
        toast({
          title: 'User Created',
          description: result.message || `College Admin ${values.email} has been successfully created.`,
        });
        onSuccess?.();
        setDialogOpen(false);
        form.reset();
      } else {
        toast({
          title: 'Creation Failed',
          description: result.error || 'Could not create the user.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while creating the user.',
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="name">Full Name (Optional)</FormLabel>
              <FormControl>
                <Input
                  id="name"
                  placeholder="e.g., Jane Doe"
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
              <FormLabel htmlFor="email">Email</FormLabel>
              <FormControl>
                <Input
                  id="email"
                  type="email"
                  placeholder="e.g., collegeadmin@example.com"
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
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="password">Password</FormLabel>
              <FormControl>
                <Input
                  id="password"
                  type="password"
                  placeholder="e.g., Test@123"
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
          name="college_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="college_id">Assign to College</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value?.toString()} 
                disabled={isLoading || isCollegesLoading}
              >
                <FormControl>
                  <SelectTrigger id="college_id">
                    <SelectValue placeholder={isCollegesLoading ? "Loading colleges..." : "Select a college"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {isCollegesLoading ? (
                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                  ) : colleges.length > 0 ? (
                    colleges.map((college) => (
                      <SelectItem key={college.college_id} value={college.college_id.toString()}>
                        {college.name} (ID: {college.college_id})
                      </SelectItem>
                    ))
                  ) : (
                     <SelectItem value="no-colleges" disabled>No colleges available</SelectItem>
                  )}
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
          <Button type="submit" disabled={isLoading || isCollegesLoading}>
            {(isLoading || isCollegesLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create User
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
