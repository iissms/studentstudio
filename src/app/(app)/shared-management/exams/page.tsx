
'use client'; 

import * as React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Newspaper, PlusCircle, BookOpenCheck } from "lucide-react";
import { format } from 'date-fns';
import { CreateExamForm } from '@/components/college-admin/CreateExamForm'; 
import { AssignSubjectsToExamForm } from '@/components/college-admin/AssignSubjectsToExamForm'; 
import type { Exam } from '@/types'; 

async function getMockExams(collegeId?: number): Promise<Exam[]> {
  await new Promise(resolve => setTimeout(resolve, 500)); 
  const mockClasses = [
    { class_id: 101, class_name: "1st PUC Science" },
    { class_id: 102, class_name: "2nd PUC Commerce" },
  ];

  const allExams: Exam[] = [
    { exam_id: 301, class_id: 101, name: "Physics Midterm I", marks: 50, min_marks: 17, start_date: "2024-08-15", end_date: "2024-08-15", college_id: 1, assigned_subject_ids: [201, 205] },
    { exam_id: 302, class_id: 102, name: "Accountancy Unit Test 1", marks: 25, min_marks: 9, start_date: "2024-09-01", end_date: "2024-09-01", college_id: 1, assigned_subject_ids: [206] },
    { exam_id: 303, class_id: 101, name: "Chemistry Final Practical", marks: 30, min_marks: 10, start_date: "2025-03-10", end_date: "2025-03-12", college_id: 1 },
  ];
  
  return allExams
    .filter(e => collegeId ? e.college_id === collegeId : true)
    .map(e => ({
      ...e,
      class_name: mockClasses.find(c => c.class_id === e.class_id)?.class_name || "Unknown Class"
    }));
}


export default function ManageExamsPage() {
  const [exams, setExams] = React.useState<Exam[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isCreateExamDialogOpen, setIsCreateExamDialogOpen] = React.useState(false);
  const [isAssignSubjectsDialogOpen, setIsAssignSubjectsDialogOpen] = React.useState(false);
  const [currentExamForAssignment, setCurrentExamForAssignment] = React.useState<Exam | null>(null);

  const collegeAdminCollegeId = 1; 

  React.useEffect(() => {
    async function loadExams() {
      setIsLoading(true);
      const fetchedExams = await getMockExams(collegeAdminCollegeId);
      setExams(fetchedExams);
      setIsLoading(false);
    }
    loadExams();
  }, [collegeAdminCollegeId]);

  const handleExamCreated = () => {
    console.log("Exam created, ideally re-fetch or update list.");
  };

  const handleSubjectsAssigned = () => {
    console.log("Subjects assigned to exam, ideally re-fetch or update exam details.");
  }

  const openAssignSubjectsDialog = (exam: Exam) => {
    setCurrentExamForAssignment(exam);
    setIsAssignSubjectsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight inline-flex items-center">
            <Newspaper className="mr-3 h-8 w-8" /> Manage Exams
          </h1>
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
             <p className="text-center text-muted-foreground py-4">Loading exams...</p>
          ) : exams.length > 0 ? (
            <ul className="space-y-4">
              {exams.map((exam) => (
                <li 
                  key={exam.exam_id} 
                  className="p-4 border rounded-md shadow-sm bg-card hover:shadow-lg transition-shadow duration-200"
                >
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
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <Newspaper className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-muted-foreground">No Exams Found</p>
                <p className="text-sm text-muted-foreground mt-1">
                    Click "Create Exam" to add one.
                </p>
            </div>
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
