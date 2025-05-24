
'use client'; // Needs to be client component to manage dialog state

import * as React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Building2 } from "lucide-react";
import { CreateDepartmentForm } from '@/components/college-admin/CreateDepartmentForm'; // New form
import type { Department } from '@/types'; // Import Department type

// Mock function to get departments for display
// In a real app, this would fetch from an API, likely based on the logged-in admin's college_id
async function getMockDepartments(): Promise<Department[]> {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  return [
    { department_id: 1, name: "Science Department", college_id: 1 },
    { department_id: 2, name: "Humanities Department", college_id: 1 },
    { department_id: 3, name: "Commerce Studies", college_id: 1 },
    // Add more mock departments if needed
  ];
}

export default function ManageDepartmentsPage() {
  const [departments, setDepartments] = React.useState<Department[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  React.useEffect(() => {
    async function loadDepartments() {
      setIsLoading(true);
      // For now, getMockDepartments doesn't use college_id, but it could
      const fetchedDepartments = await getMockDepartments();
      setDepartments(fetchedDepartments);
      setIsLoading(false);
    }
    loadDepartments();
  }, []);

  const handleDepartmentCreated = () => {
    // In a real app, you might re-fetch departments here or optimistically update.
    // For now, with static mock getMockDepartments, this won't auto-refresh the list.
    console.log("Department created, ideally re-fetch or update list.");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Departments</h1>
          <p className="text-muted-foreground">
            Create and manage departments within your college.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Building2 className="mr-2 h-4 w-4" />
              Add Department
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Department</DialogTitle>
              <DialogDescription>
                Fill in the details below to add a new department.
              </DialogDescription>
            </DialogHeader>
            <CreateDepartmentForm onSuccess={handleDepartmentCreated} setDialogOpen={setIsDialogOpen} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Department List</CardTitle>
          <CardDescription>A list of departments in your college. (Static Mock Data)</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <p>Loading departments...</p>
          ) : departments.length > 0 ? (
            <ul className="space-y-4">
              {departments.map((dept) => (
                <li key={dept.department_id} className="p-4 border rounded-md shadow-sm">
                  <h3 className="text-lg font-semibold">{dept.name}</h3>
                  <p className="text-sm text-muted-foreground">ID: {dept.department_id}</p>
                  {/* Add more department details or actions (Edit/Delete) here */}
                </li>
              ))}
            </ul>
          ) : (
            <p>No departments found. Click "Add Department" to create one.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
