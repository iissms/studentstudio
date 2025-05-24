
'use client';

import * as React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Library, PlusCircle } from "lucide-react";
import { CreateClassForm } from '@/components/college-admin/CreateClassForm'; // New form
import type { Class, Department } from '@/types'; // Import Class type

// Mock function to get classes for display
// In a real app, this would fetch from an API, likely based on the logged-in admin's college_id
async function getMockClasses(collegeId?: number): Promise<Class[]> {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  // Placeholder departments for enriching class data (in a real app, you'd join or fetch this info)
  const mockDepartments: Department[] = [
    { department_id: 1, name: "Science Department", college_id: 1 },
    { department_id: 2, name: "Humanities Department", college_id: 1 },
    { department_id: 3, name: "Commerce Studies", college_id: 1 },
    { department_id: 4, name: "Mathematics", college_id: 1 },
  ];

  const allClasses: Class[] = [
    { class_id: 101, class_name: "1st PUC Science", department_id: 1, academic_year: "2024-2025", college_id: 1 },
    { class_id: 102, class_name: "2nd PUC Commerce", department_id: 3, academic_year: "2024-2025", college_id: 1 },
    { class_id: 103, class_name: "B.A. History Sem 1", department_id: 2, academic_year: "2025-2026", college_id: 1 },
  ];

  return allClasses
    .filter(c => collegeId ? c.college_id === collegeId : true) // Filter by collegeId if provided
    .map(c => ({
      ...c,
      department_name: mockDepartments.find(d => d.department_id === c.department_id)?.name || "Unknown Dept."
    }));
}

export default function ManageClassesPage() {
  const [classes, setClasses] = React.useState<Class[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  // TODO: In a real app, get the logged-in college admin's college_id from session/context
  const collegeAdminCollegeId = 1; // Placeholder

  React.useEffect(() => {
    async function loadClasses() {
      setIsLoading(true);
      const fetchedClasses = await getMockClasses(collegeAdminCollegeId);
      setClasses(fetchedClasses);
      setIsLoading(false);
    }
    loadClasses();
  }, [collegeAdminCollegeId]); // Reload if collegeId changes (not relevant for current mock)

  const handleClassCreated = () => {
    // In a real app, you might re-fetch classes here or optimistically update.
    // For now, with static mock getMockClasses, this won't auto-refresh the list with new entries.
    console.log("Class created, ideally re-fetch or update list.");
    // To see newly created classes reflected, getMockClasses would need to be dynamic
    // or integrate with the mockCreatedClasses array from actions.ts
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Classes</h1>
          <p className="text-muted-foreground">
            Create and manage classes, linking them to departments for the academic year.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Class
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle>Create New Class</DialogTitle>
              <DialogDescription>
                Fill in the details below to add a new class.
              </DialogDescription>
            </DialogHeader>
            <CreateClassForm onSuccess={handleClassCreated} setDialogOpen={setIsDialogOpen} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Class List</CardTitle>
          <CardDescription>A list of classes in your college. (Static Mock Data)</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <p>Loading classes...</p>
          ) : classes.length > 0 ? (
            <ul className="space-y-4">
              {classes.map((cls) => (
                <li key={cls.class_id} className="p-4 border rounded-md shadow-sm">
                  <h3 className="text-lg font-semibold">{cls.class_name}</h3>
                  <p className="text-sm text-muted-foreground">ID: {cls.class_id}</p>
                  <p className="text-sm text-muted-foreground">Department: {cls.department_name} (ID: {cls.department_id})</p>
                  <p className="text-sm text-muted-foreground">Academic Year: {cls.academic_year}</p>
                  {/* TODO: Add Edit/Delete buttons here */}
                </li>
              ))}
            </ul>
          ) : (
            <p>No classes found. Click "Add Class" to create one.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
