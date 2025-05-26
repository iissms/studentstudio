
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { assignSubjectsToExamSchema, type AssignSubjectsToExamFormValues } from '@/schemas/examSubjectMap';
import { assignSubjectsToExam, fetchSubjectsByDepartment } from '@/lib/actions';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { DialogFooter } from '@/components/ui/dialog';
import type { Subject, Exam } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { z } from 'zod';

interface AssignSubjectsToExamFormProps {
  exam: Exam; 
  onSuccess?: () => void;
  setDialogOpen: (open: boolean) => void;
}

export function AssignSubjectsToExamForm({ exam, onSuccess, setDialogOpen }: AssignSubjectsToExamFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [availableSubjects, setAvailableSubjects] = React.useState<Subject[]>([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = React.useState(true);

  React.useEffect(() => {
    async function loadSubjects() {
      if (exam?.department_id) {
        setIsLoadingSubjects(true);
        try {
          const fetchedSubjects = await fetchSubjectsByDepartment(exam.department_id);
          setAvailableSubjects(fetchedSubjects);
        } catch (error) {
          console.error("Failed to fetch subjects for exam assignment:", error);
          toast({
            title: "Error",
            description: "Could not load subjects for this department.",
            variant: "destructive"
          });
          setAvailableSubjects([]);
        } finally {
          setIsLoadingSubjects(false);
        }
      } else {
        setAvailableSubjects([]);
        setIsLoadingSubjects(false);
      }
    }
    loadSubjects();
  }, [exam, toast]);
  

  const form = useForm<AssignSubjectsToExamFormValues>({
    resolver: zodResolver(assignSubjectsToExamSchema),
    defaultValues: {
      exam_id: exam?.exam_id,
      subject_ids: exam?.assigned_subject_ids || [], 
    },
  });
  
  React.useEffect(() => {
    form.reset({
        exam_id: exam?.exam_id,
        subject_ids: exam?.assigned_subject_ids || [],
    });
  }, [exam, form]);


  async function onSubmit(values: AssignSubjectsToExamFormValues) {
    setIsLoading(true);
    try {
      const result = await assignSubjectsToExam(values);
      if (result.success) {
        toast({
          title: 'Subjects Assigned',
          description: result.message || `Subjects have been successfully assigned to exam "${exam.name}".`,
        });
        onSuccess?.();
        setDialogOpen(false);
      } else {
        toast({
          title: 'Assignment Failed',
          description: result.error || 'Could not assign subjects to the exam.',
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
          description: 'An unexpected error occurred.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="subject_ids"
          render={() => (
            <FormItem>
              <FormLabel>Select Subjects for "{exam.name}" (Class: {exam.class_name || exam.class_id})</FormLabel>
              {isLoadingSubjects ? (
                <p>Loading subjects...</p>
              ) : availableSubjects.length > 0 ? (
                <ScrollArea className="h-48 rounded-md border p-4">
                  <div className="space-y-2">
                    {availableSubjects.map((subject) => (
                      <FormField
                        key={subject.subject_id}
                        control={form.control}
                        name="subject_ids"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={subject.subject_id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(subject.subject_id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), subject.subject_id])
                                      : field.onChange(
                                          (field.value || []).filter(
                                            (value) => value !== subject.subject_id
                                          )
                                        );
                                  }}
                                  disabled={isLoading}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {subject.subject_name} ({subject.subject_code}) - {subject.type}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <p className="text-muted-foreground">No subjects found for this exam's class or an error occurred.</p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || isLoadingSubjects || availableSubjects.length === 0}>
            {(isLoading || isLoadingSubjects) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Assign Subjects
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
 