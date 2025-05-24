
'use client'; // Needs to be client component to manage dialog state

import * as React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Newspaper, PlusCircle } from "lucide-react";
import { CreateExamForm } from '@/components/college-admin/CreateExamForm'; // New form
import type { Exam } from '@/types'; // Import Exam type

// Mock function to get exams for display
async function getMockExams(collegeId?: number): Promise<Exam[]> {
  await new Promise(resolve => setTimeout(resolve, 500)); 
  // Placeholder classes for enriching exam data
  const mockClasses = [
    { class_id: 101, class_name: "1st PUC Science" },
    { class_id: 102, class_name: "2nd PUC Commerce" },
  ];

  const allExams: Exam[] = [
    { exam_id: 301, class_id: 101, name: "Physics Midterm I", marks: 50, min_marks: 17, start_date: "2024-08-15", end_date: "2024-08-15", college_id: 1 },
    { exam_id: 302, class_id: 102, name: "Accountancy Unit Test 1", marks: 25, min_marks: 9, start_date: "2024-09-01", end_date: "2024-09-01", college_id: 1 },
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
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  // TODO: In a real app, get the logged-in college admin's college_id
  const collegeAdminCollegeId = 1; // Placeholder

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
    // For now, with static mock getMockExams, this won't auto-refresh the list.
    console.log("Exam created, ideally re-fetch or update list.");
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
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Exam
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px]"> {/* Adjusted width for more fields */}
            <DialogHeader>
              <DialogTitle>Create New Exam</DialogTitle>
              <DialogDescription>
                Fill in the details below to add a new exam for a class.
              </DialogDescription>
            </DialogHeader>
            <CreateExamForm onSuccess={handleExamCreated} setDialogOpen={setIsDialogOpen} />
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
                  <h3 className="text-lg font-semibold">{exam.name}</h3>
                  <p className="text-sm text-muted-foreground">ID: {exam.exam_id} | Class: {exam.class_name} (ID: {exam.class_id})</p>
                  <p className="text-sm text-muted-foreground">Marks: {exam.marks} | Min. Passing: {exam.min_marks}</p>
                  <p className="text-sm text-muted-foreground">Dates: {format(new Date(exam.start_date), "MMM dd, yyyy")} - {format(new Date(exam.end_date), "MMM dd, yyyy")}</p>
                  {/* TODO: Add Edit/Delete/Assign Subjects buttons here */}
                </li>
              ))}
            </ul>
          ) : (
            <p>No exams found. Click "Create Exam" to add one.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
