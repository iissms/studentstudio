'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { createExamSchema, type CreateExamFormValues } from '@/schemas/exam';
import { createExam, fetchClassesForCollegeAdmin } from '@/lib/actions';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from '@/components/ui/form';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { DialogFooter } from '@/components/ui/dialog';
import { DatePicker } from '@/components/ui/date-picker';
import type { Class } from '@/types';

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
      try {
        const fetchedClasses = await fetchClassesForCollegeAdmin();
        setClasses(fetchedClasses);
      } catch (error) {
        console.error("Failed to fetch classes:", error);
        toast({ title: "Error", description: "Could not load classes.", variant: "destructive" });
      } finally {
        setIsClassesLoading(false);
      }
    }
    loadClasses();
  }, [toast]);

  const form = useForm<CreateExamFormValues>({
    resolver: zodResolver(createExamSchema),
    defaultValues: {
      class_id: undefined,
      name: '',
      marks: undefined,
      min_marks: undefined,
      start_date: undefined,
      end_date: undefined,
    },
  });

  async function onSubmit(values: CreateExamFormValues) {
    setIsLoading(true);
    try {
      const result = await createExam(values);

      if (result.success) {
        toast({ title: 'Exam Created', description: result.message });
        onSuccess?.();
        setDialogOpen(false);
        form.reset();
      } else {
        toast({ title: 'Creation Failed', description: result.error || 'Could not create the exam.', variant: 'destructive' });
      }
    } catch (error: any) {
      if (error instanceof Error && 'errors' in error) {
        console.error("Zod Validation Errors:", error.errors);
        if (Array.isArray((error as any).errors)) {
          (error as any).errors.forEach((e: any) => {
            console.log(`❌ ${e.path.join('.')}: ${e.message}`);
          });
        }
      } else {
        console.error("Unexpected Error:", error);
      }
      toast({ title: 'Validation Error', description: "Check console for details.", variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Class Select */}
        <FormField
          control={form.control}
          name="class_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Class</FormLabel>
              <Select
                onValueChange={(val) => field.onChange(Number(val))}
                value={field.value?.toString()}
                disabled={isLoading || isClassesLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={isClassesLoading ? "Loading..." : "Select class"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.class_id} value={cls.class_id.toString()}>
                      {cls.class_name} ({cls.academic_year})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Exam Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Exam Name</FormLabel>
              <FormControl>
                <Input placeholder="Midterm, Final..." {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Marks and Min Marks */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="marks"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Marks</FormLabel>
                <FormControl>
                  <Input type="number" {...field} disabled={isLoading} onChange={e => field.onChange(+e.target.value)} />
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
                <FormLabel>Min. Marks</FormLabel>
                <FormControl>
                  <Input type="number" {...field} disabled={isLoading} onChange={e => field.onChange(+e.target.value)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Start & End Date */}
        <FormField
          control={form.control}
          name="start_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Date</FormLabel>
              <DatePicker value={field.value} onChange={field.onChange} disabled={isLoading} placeholder="Select date" />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="end_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>End Date</FormLabel>
              <DatePicker value={field.value} onChange={field.onChange} disabled={isLoading} placeholder="Select date" />
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter className="pt-4">
          <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={isLoading}>Cancel</Button>
          <Button type="submit" disabled={isLoading || isClassesLoading}>
            {(isLoading || isClassesLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Exam
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
