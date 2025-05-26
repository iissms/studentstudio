
'use client'; // Needs to be client component to manage dialog state

import * as React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Newspaper, PlusCircle, BookOpenCheck } from "lucide-react";
import { format } from 'date-fns';
import { CreateExamForm } from '@/components/college-admin/CreateExamForm'; 
import { AssignSubjectsToExamForm } from '@/components/college-admin/AssignSubjectsToExamForm'; // New form
import type { Exam } from '@/types'; 

// Mock function to get exams for display

export default function ManageExamsPage() {
  const [exams, setExams] = React.useState<Exam[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isCreateExamDialogOpen, setIsCreateExamDialogOpen] = React.useState(false);
  const [isAssignSubjectsDialogOpen, setIsAssignSubjectsDialogOpen] = React.useState(false);
  const [currentExamForAssignment, setCurrentExamForAssignment] = React.useState<Exam | null>(null);

  const handleExamCreated = () => {
    // For now, with static mock getMockExams, this won't auto-refresh the list.
    console.log("Exam created, ideally re-fetch or update list.");
    // To see new exams, getMockExams would need to be dynamic or merge with `mockCreatedExams` from actions.ts
    // For demo purposes, we could re-call loadExams() to see changes IF mock data source was mutable and shared.
  };

  const handleSubjectsAssigned = () => {
    console.log("Subjects assigned to exam, ideally re-fetch or update exam details.");
    // Similar to above, to see changes to `assigned_subject_ids` in the list, `getMockExams` would need to reflect this.
  }

  const openAssignSubjectsDialog = (exam: Exam) => {
    setCurrentExamForAssignment(exam);
    setIsAssignSubjectsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Exams</h1>
          <p className="text-muted-foreground">
            Create exams for classes and assign subjects to them.
          </p>
        </div>
        <Dialog open={isCreateExamDialogOpen} onOpenChange={setIsCreateExamDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Exam
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px]"> 
            <DialogHeader>
              <DialogTitle>Create New Exam</DialogTitle>
              <DialogDescription>
                Fill in the details below to add a new exam for a class.
              </DialogDescription>
            </DialogHeader>
            <CreateExamForm onSuccess={handleExamCreated} setDialogOpen={setIsCreateExamDialogOpen} />
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Exam List</CardTitle>
          <CardDescription>A list of exams in your college. (Static Mock Data)</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <p>Loading exams...</p>
          ) : exams.length > 0 ? (
            <ul className="space-y-4">
              {exams.map((exam) => (
                <li key={exam.exam_id} className="p-4 border rounded-md shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">{exam.name}</h3>
                      <p className="text-sm text-muted-foreground">ID: {exam.exam_id} | Class: {exam.class_name} (ID: {exam.class_id})</p>
                      <p className="text-sm text-muted-foreground">Marks: {exam.marks} | Min. Passing: {exam.min_marks}</p>
                      <p className="text-sm text-muted-foreground">
                        Dates: {format(new Date(exam.start_date), "MMM dd, yyyy")} - {format(new Date(exam.end_date), "MMM dd, yyyy")}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Assigned Subjects: {exam.assigned_subject_ids?.join(', ') || 'None'}
                      </p>
                    </div>
                    <div className="flex flex-col space-y-2">
                        <Button variant="outline" size="sm" onClick={() => openAssignSubjectsDialog(exam)}>
                            <BookOpenCheck className="mr-2 h-4 w-4" />
                            Assign Subjects
                        </Button>
                        {/* TODO: Add Edit/Delete buttons here */}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No exams found. Click "Create Exam" to add one.</p>
          )}
        </CardContent>
      </Card>

      {currentExamForAssignment && (
        <Dialog open={isAssignSubjectsDialogOpen} onOpenChange={setIsAssignSubjectsDialogOpen}>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>Assign Subjects to Exam</DialogTitle>
              <DialogDescription>
                Select subjects for "{currentExamForAssignment.name}".
              </DialogDescription>
            </DialogHeader>
            <AssignSubjectsToExamForm
              exam={currentExamForAssignment}
              onSuccess={handleSubjectsAssigned}
              setDialogOpen={setIsAssignSubjectsDialogOpen}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
