
'use client'; 

import * as React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Building2, PlusCircle } from "lucide-react"; // Added PlusCircle for consistency
import { CreateDepartmentForm } from '@/components/college-admin/CreateDepartmentForm'; 
import type { Department } from '@/types'; 

async function getMockDepartments(): Promise<Department[]> {
  await new Promise(resolve => setTimeout(resolve, 500)); 
  return [
    { department_id: 1, name: "Science Department", college_id: 1 },
    { department_id: 2, name: "Humanities Department", college_id: 1 },
    { department_id: 3, name: "Commerce Studies", college_id: 1 },
  ];
}

export default function ManageDepartmentsPage() {
  const [departments, setDepartments] = React.useState<Department[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  React.useEffect(() => {
    async function loadDepartments() {
      setIsLoading(true);
      const fetchedDepartments = await getMockDepartments();
      setDepartments(fetchedDepartments);
      setIsLoading(false);
    }
    loadDepartments();
  }, []);

  const handleDepartmentCreated = () => {
    console.log("Department created, ideally re-fetch or update list.");
    // loadDepartments(); // Would re-fetch static mock data
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight inline-flex items-center">
            <Building2 className="mr-3 h-8 w-8" /> Manage Departments
          </h1>
          <p className="text-muted-foreground">
            Create and manage departments within your college.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> {/* Changed icon for consistency */}
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
             <p className="text-center text-muted-foreground py-4">Loading departments...</p>
          ) : departments.length > 0 ? (
            <ul className="space-y-4">
              {departments.map((dept) => (
                <li 
                  key={dept.department_id} 
                  className="p-4 border rounded-md shadow-sm bg-card hover:shadow-lg transition-shadow duration-200"
                >
                  <h3 className="text-lg font-semibold">{dept.name}</h3>
                  <p className="text-sm text-muted-foreground">ID: {dept.department_id}</p>
                  {/* TODO: Add Edit/Delete buttons here */}
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-muted-foreground">No Departments Found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Click "Add Department" to create one for your college.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
