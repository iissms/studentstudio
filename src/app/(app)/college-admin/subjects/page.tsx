
'use client';

import * as React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BookCopy, PlusCircle } from "lucide-react";
import { CreateSubjectForm } from '@/components/college-admin/CreateSubjectForm'; // New form
import type { Subject, Class } from '@/types'; // Import Subject type

// Mock function to get subjects for display
async function getMockSubjects(collegeId?: number): Promise<Subject[]> {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  
  // Placeholder classes for enriching subject data (in a real app, you'd join or fetch this info)
  const mockClasses: Class[] = [
    { class_id: 101, class_name: "1st PUC Science", department_id: 1, academic_year: "2024-2025", college_id: 1 },
    { class_id: 102, class_name: "2nd PUC Commerce", department_id: 3, academic_year: "2024-2025", college_id: 1 },
  ];

  const allSubjects: Subject[] = [
    { subject_id: 201, class_id: 101, subject_code: "PHY101", subject_name: "Physics", type: "Theory", college_id: 1 },
    { subject_id: 202, class_id: 101, subject_code: "CHEM101", subject_name: "Chemistry", type: "Theory", college_id: 1 },
    { subject_id: 203, class_id: 102, subject_code: "ACC101", subject_name: "Accountancy", type: "Theory", college_id: 1 },
    { subject_id: 204, class_id: 101, subject_code: "PHY101L", subject_name: "Physics Lab", type: "Practical", college_id: 1 },
  ];

  return allSubjects
    .filter(s => collegeId ? s.college_id === collegeId : true)
    .map(s => ({
      ...s,
      class_name: mockClasses.find(c => c.class_id === s.class_id)?.class_name || "Unknown Class"
    }));
}


export default function ManageSubjectsPage() {
  const [subjects, setSubjects] = React.useState<Subject[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  // TODO: In a real app, get the logged-in college admin's college_id from session/context
  const collegeAdminCollegeId = 1; // Placeholder

  React.useEffect(() => {
    async function loadSubjects() {
      setIsLoading(true);
      const fetchedSubjects = await getMockSubjects(collegeAdminCollegeId);
      setSubjects(fetchedSubjects);
      setIsLoading(false);
    }
    loadSubjects();
  }, [collegeAdminCollegeId]);

  const handleSubjectCreated = () => {
    // For now, with static mock getMockSubjects, this won't auto-refresh the list.
    console.log("Subject created, ideally re-fetch or update list.");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Subjects</h1>
          <p className="text-muted-foreground">
            Add subjects and assign them to classes.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Subject
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle>Add New Subject</DialogTitle>
              <DialogDescription>
                Fill in the details below to add a new subject to a class.
              </DialogDescription>
            </DialogHeader>
            <CreateSubjectForm onSuccess={handleSubjectCreated} setDialogOpen={setIsDialogOpen} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subject List</CardTitle>
          <CardDescription>A list of subjects in your college. (Static Mock Data)</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <p>Loading subjects...</p>
          ) : subjects.length > 0 ? (
            <ul className="space-y-4">
              {subjects.map((sub) => (
                <li key={sub.subject_id} className="p-4 border rounded-md shadow-sm">
                  <h3 className="text-lg font-semibold">{sub.subject_name} ({sub.subject_code})</h3>
                  <p className="text-sm text-muted-foreground">ID: {sub.subject_id} | Type: {sub.type}</p>
                  <p className="text-sm text-muted-foreground">Class: {sub.class_name} (ID: {sub.class_id})</p>
                  {/* TODO: Add Edit/Delete buttons here */}
                </li>
              ))}
            </ul>
          ) : (
            <p>No subjects found. Click "Add Subject" to create one.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
