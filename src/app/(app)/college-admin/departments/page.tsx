
'use client'; 

import * as React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Building2, PlusCircle, Pencil, Trash2 } from "lucide-react";
import { CreateDepartmentForm } from '@/components/college-admin/CreateDepartmentForm'; 
import { EditDepartmentForm } from '@/components/college-admin/EditDepartmentForm';
import type { Department } from '@/types'; 
import { useToast } from '@/hooks/use-toast';
import { fetchDepartmentsForCollegeAdmin } from '@/lib/actions'; // Updated import
// import { deleteDepartment } from '@/lib/actions'; // TODO: Implement deleteDepartment action

export default function ManageDepartmentsPage() {
  const { toast } = useToast();
  const [departments, setDepartments] = React.useState<Department[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [currentDepartmentToEdit, setCurrentDepartmentToEdit] = React.useState<Department | null>(null);
  const [departmentToDelete, setDepartmentToDelete] = React.useState<Department | null>(null);

  async function loadDepartments() {
    setIsLoading(true);
    try {
      const fetchedDepartments = await fetchDepartmentsForCollegeAdmin(); // Use the new fetch action
      setDepartments(fetchedDepartments);
    } catch (error) {
      console.error("Failed to fetch departments:", error);
      toast({ title: "Error", description: "Could not load departments.", variant: "destructive"});
      setDepartments([]);
    } finally {
      setIsLoading(false);
    }
  }

  React.useEffect(() => {
    loadDepartments();
  }, []);

  const handleDepartmentCreated = () => {
    loadDepartments();
  };

  const handleDepartmentUpdated = () => {
    loadDepartments(); 
  };
  
  const openEditDialog = (department: Department) => {
    setCurrentDepartmentToEdit(department);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (department: Department) => {
    setDepartmentToDelete(department);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!departmentToDelete) return;
    // TODO: Implement actual deleteDepartment server action
    // const result = await deleteDepartment(departmentToDelete.department_id);
    // if (result.success) {
    //   toast({ title: "Department Deleted", description: `Department "${departmentToDelete.name}" has been deleted.` });
    //   loadDepartments(); 
    // } else {
    //   toast({ title: "Deletion Failed", description: result.error || "Could not delete the department.", variant: "destructive" });
    // }
    toast({ title: "Mock Deletion", description: `Department "${departmentToDelete.name}" would be deleted.` });
    setIsDeleteDialogOpen(false);
    setDepartmentToDelete(null);
    loadDepartments(); // Refresh list after mock deletion
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
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
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
            <CreateDepartmentForm onSuccess={handleDepartmentCreated} setDialogOpen={setIsCreateDialogOpen} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Department List</CardTitle>
          <CardDescription>A list of departments in your college.</CardDescription>
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
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">{dept.name}</h3>
                      <p className="text-sm text-muted-foreground">ID: {dept.department_id}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(dept)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => openDeleteDialog(dept)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
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

      {currentDepartmentToEdit && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Department</DialogTitle>
              <DialogDescription>
                Update the details for {currentDepartmentToEdit.name}.
              </DialogDescription>
            </DialogHeader>
            <EditDepartmentForm 
                departmentToEdit={currentDepartmentToEdit} 
                onSuccess={handleDepartmentUpdated} 
                setDialogOpen={setIsEditDialogOpen} 
            />
          </DialogContent>
        </Dialog>
      )}

      {departmentToDelete && (
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the department
                "{departmentToDelete.name}" (ID: {departmentToDelete.department_id}).
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDepartmentToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete}>
                Yes, delete department
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
