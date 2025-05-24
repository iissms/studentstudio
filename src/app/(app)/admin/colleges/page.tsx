
'use client'; 

import * as React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { PlusCircle, Pencil, Trash2, University } from "lucide-react";
import { CreateCollegeForm } from '@/components/admin/CreateCollegeForm';
import { EditCollegeForm } from '@/components/admin/EditCollegeForm';
import { deleteCollege, fetchColleges } from '@/lib/actions'; // Updated import
import { useToast } from '@/hooks/use-toast'; 
import type { College } from '@/types'; // Ensure College type is imported

export default function ManageCollegesPage() {
  const { toast } = useToast();
  const [colleges, setColleges] = React.useState<College[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [currentCollegeToEdit, setCurrentCollegeToEdit] = React.useState<College | null>(null);
  const [collegeToDelete, setCollegeToDelete] = React.useState<College | null>(null);

  async function loadColleges() {
    setIsLoading(true);
    try {
      const fetchedColleges = await fetchColleges(); // Use the new fetch action
      setColleges(fetchedColleges);
    } catch (error) {
      console.error("Failed to fetch colleges:", error);
      toast({ title: "Error", description: "Could not load colleges.", variant: "destructive"});
      setColleges([]); // Set to empty array on error
    } finally {
      setIsLoading(false);
    }
  }

  React.useEffect(() => {
    loadColleges();
  }, []);

  const handleCollegeCreated = () => {
    loadColleges(); 
  };

  const handleCollegeUpdated = () => {
    loadColleges(); 
  };
  
  const handleCollegeDeleted = (deletedCollegeId: number) => {
    toast({ title: "College Processed", description: "The college has been processed for deletion." });
    loadColleges();
  };

  const openEditDialog = (college: College) => {
    setCurrentCollegeToEdit(college);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (college: College) => {
    setCollegeToDelete(college);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!collegeToDelete) return;
    const result = await deleteCollege(collegeToDelete.college_id);
    if (result.success) {
      handleCollegeDeleted(collegeToDelete.college_id);
    } else {
      toast({
        title: "Deletion Failed",
        description: result.error || "Could not delete the college.",
        variant: "destructive",
      });
    }
    setIsDeleteDialogOpen(false);
    setCollegeToDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight inline-flex items-center">
            <University className="mr-3 h-8 w-8" /> Manage Colleges
          </h1>
          <p className="text-muted-foreground">
            View, create, edit, and delete colleges in the system.
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create College
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New College</DialogTitle>
              <DialogDescription>
                Fill in the details below to add a new college to the system.
              </DialogDescription>
            </DialogHeader>
            <CreateCollegeForm onSuccess={handleCollegeCreated} setDialogOpen={setIsCreateDialogOpen} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>College List</CardTitle>
          <CardDescription>A list of all registered colleges.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <p className="text-center text-muted-foreground py-4">Loading colleges...</p>
          ) : colleges.length > 0 ? (
            <ul className="space-y-4">
              {colleges.map((college) => (
                <li 
                  key={college.college_id} 
                  className="p-4 border rounded-md shadow-sm bg-card hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">{college.name}</h3>
                      <p className="text-sm text-muted-foreground">ID: {college.college_id}</p>
                      <p className="text-sm text-muted-foreground">Address: {college.address}</p>
                      {college.email && (
                        <p className="text-sm text-muted-foreground">Email: {college.email}</p>
                      )}
                      {college.phone && (
                        <p className="text-sm text-muted-foreground">Phone: {college.phone}</p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(college)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => openDeleteDialog(college)}>
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
              <University className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-muted-foreground">No Colleges Found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Click "Create College" to add the first one.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {currentCollegeToEdit && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit College</DialogTitle>
              <DialogDescription>
                Update the details for {currentCollegeToEdit.name}.
              </DialogDescription>
            </DialogHeader>
            <EditCollegeForm 
              collegeToEdit={currentCollegeToEdit} 
              onSuccess={handleCollegeUpdated} 
              setDialogOpen={setIsEditDialogOpen} 
            />
          </DialogContent>
        </Dialog>
      )}

      {collegeToDelete && (
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the college
                "{collegeToDelete.name}" (ID: {collegeToDelete.college_id}) and all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setCollegeToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete}>
                Yes, delete college
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
