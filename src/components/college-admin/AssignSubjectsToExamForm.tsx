
'use client';

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label }
from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { assignSubjectsToExamSchema, type AssignSubjectsToExamFormValues } from '@/schemas/examSubjectMap';
import { assignSubjectsToExam } from '@/lib/actions'; // Server action
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

// Mock function to fetch subjects for a given class
// In a real app, this would fetch from an API based on class_id and college_id
async function getMockSubjectsForClass(classId: number, collegeId: number): Promise<Subject[]> {
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
  
  // This is a simplified mock. A real backend would filter by class_id and college_id.
  // For now, let's assume these subjects are available for class_id 101 and college_id 1
  const allSubjects: Subject[] = [
    { subject_id: 201, class_id: 101, subject_code: "PHY101", subject_name: "Physics", type: "Theory", college_id: 1 },
    { subject_id: 202, class_id: 101, subject_code: "CHEM101", subject_name: "Chemistry", type: "Theory", college_id: 1 },
    { subject_id: 203, class_id: 101, subject_code: "MATH101", subject_name: "Mathematics", type: "Theory", college_id: 1 },
    { subject_id: 204, class_id: 101, subject_code: "BIO101", subject_name: "Biology", type: "Theory", college_id: 1 },
    { subject_id: 205, class_id: 101, subject_code: "PHY101L", subject_name: "Physics Lab", type: "Practical", college_id: 1 },
    { subject_id: 206, class_id: 102, subject_code: "ACC101", subject_name: "Accountancy", type: "Theory", college_id: 1 },
    { subject_id: 207, class_id: 102, subject_code: "BUS101", subject_name: "Business Studies", type: "Theory", college_id: 1 },
  ];

  return allSubjects.filter(s => s.class_id === classId && s.college_id === collegeId);
}


interface AssignSubjectsToExamFormProps {
  exam: Exam; // Pass the full exam object
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
      if (exam?.class_id && exam?.college_id) {
        setIsLoadingSubjects(true);
        const fetchedSubjects = await getMockSubjectsForClass(exam.class_id, exam.college_id);
        setAvailableSubjects(fetchedSubjects);
        setIsLoadingSubjects(false);
      } else {
        setAvailableSubjects([]);
        setIsLoadingSubjects(false);
      }
    }
    loadSubjects();
  }, [exam]);

  const form = useForm<AssignSubjectsToExamFormValues>({
    resolver: zodResolver(assignSubjectsToExamSchema),
    defaultValues: {
      exam_id: exam?.exam_id,
      subject_ids: exam?.assigned_subject_ids || [], // Pre-fill if already assigned (mocked for now)
    },
  });
  
  // Watch exam_id to update defaultValues if the exam prop changes
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
        // form.reset(); // Resetting might clear pre-selection if dialog is reopened
      } else {
        toast({
          title: 'Assignment Failed',
          description: result.error || 'Could not assign subjects to the exam.',
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
