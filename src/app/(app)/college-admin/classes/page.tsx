
'use client';

import * as React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Library, PlusCircle, Pencil, Trash2 } from "lucide-react";
import { CreateClassForm } from '@/components/college-admin/CreateClassForm'; 
import { EditClassForm } from '@/components/college-admin/EditClassForm';
import type { Class } from '@/types'; 
import { useToast } from '@/hooks/use-toast';
import { fetchClassesForCollegeAdmin } from '@/lib/actions'; // Updated import

export default function ManageClassesPage() {
  const { toast } = useToast();
  const [classes, setClasses] = React.useState<Class[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [currentClassToEdit, setCurrentClassToEdit] = React.useState<Class | null>(null);
  const [classToDelete, setClassToDelete] = React.useState<Class | null>(null);

  async function loadClasses() {
    setIsLoading(true);
    try {
      const fetchedClasses = await fetchClassesForCollegeAdmin(); // Use new fetch action
      setClasses(fetchedClasses);
    } catch (error) {
      console.error("Failed to fetch classes:", error);
      toast({ title: "Error", description: "Could not load classes.", variant: "destructive"});
      setClasses([]);
    } finally {
      setIsLoading(false);
    }
  }

  React.useEffect(() => {
    loadClasses();
  }, []); 

  const handleClassCreated = () => {
    loadClasses();
  };

  const handleClassUpdated = () => {
    loadClasses();
  };

  const openEditDialog = (cls: Class) => {
    setCurrentClassToEdit(cls);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (cls: Class) => {
    setClassToDelete(cls);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!classToDelete) return;
    // TODO: Implement actual deleteClass server action
    // const result = await deleteClass(classToDelete.class_id);
    // if (result.success) {
    //   toast({ title: "Class Deleted", description: `Class "${classToDelete.class_name}" has been deleted.` });
    //   loadClasses(); 
    // } else {
    //   toast({ title: "Deletion Failed", description: result.error || "Could not delete the class.", variant: "destructive" });
    // }
    toast({ title: "Mock Deletion", description: `Class "${classToDelete.class_name}" would be deleted.` });
    setIsDeleteDialogOpen(false);
    setClassToDelete(null);
    loadClasses(); // Refresh list
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight inline-flex items-center">
            <Library className="mr-3 h-8 w-8" /> Manage Classes
          </h1>
          <p className="text-muted-foreground">
            Create and manage classes, linking them to departments for the academic year.
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
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
            <CreateClassForm onSuccess={handleClassCreated} setDialogOpen={setIsCreateDialogOpen} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Class List</CardTitle>
          <CardDescription>A list of classes in your college.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <p className="text-center text-muted-foreground py-4">Loading classes...</p>
          ) : classes.length > 0 ? (
            <ul className="space-y-4">
              {classes.map((cls) => (
                <li 
                  key={cls.class_id} 
                  className="p-4 border rounded-md shadow-sm bg-card hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">{cls.class_name}</h3>
                      <p className="text-sm text-muted-foreground">ID: {cls.class_id}</p>
                      <p className="text-sm text-muted-foreground">Department: {cls.department_name || 'N/A'} (ID: {cls.department_id})</p>
                      <p className="text-sm text-muted-foreground">Academic Year: {cls.academic_year}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(cls)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => openDeleteDialog(cls)}>
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
                <Library className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-muted-foreground">No Classes Found</p>
                <p className="text-sm text-muted-foreground mt-1">
                    Click "Add Class" to create one.
                </p>
            </div>
          )}
        </CardContent>
      </Card>

      {currentClassToEdit && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle>Edit Class</DialogTitle>
              <DialogDescription>
                Update the details for {currentClassToEdit.class_name}.
              </DialogDescription>
            </DialogHeader>
            <EditClassForm 
                classToEdit={currentClassToEdit} 
                onSuccess={handleClassUpdated} 
                setDialogOpen={setIsEditDialogOpen} 
            />
          </DialogContent>
        </Dialog>
      )}

      {classToDelete && (
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the class
                "{classToDelete.class_name}" (ID: {classToDelete.class_id}).
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setClassToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete}>
                Yes, delete class
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
