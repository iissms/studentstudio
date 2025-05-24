
'use client';

import * as React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { BookCopy, PlusCircle, Pencil, Trash2 } from "lucide-react";
import { CreateSubjectForm } from '@/components/college-admin/CreateSubjectForm'; 
import { EditSubjectForm } from '@/components/college-admin/EditSubjectForm';
import type { Subject } from '@/types'; 
import { useToast } from '@/hooks/use-toast';
import { fetchSubjectsForCollegeAdmin } from '@/lib/actions'; // Updated import

export default function ManageSubjectsPage() {
  const { toast } = useToast();
  const [subjects, setSubjects] = React.useState<Subject[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [currentSubjectToEdit, setCurrentSubjectToEdit] = React.useState<Subject | null>(null);
  const [subjectToDelete, setSubjectToDelete] = React.useState<Subject | null>(null);

  async function loadSubjects() {
    setIsLoading(true);
    try {
      const fetchedSubjects = await fetchSubjectsForCollegeAdmin(); // Use new fetch action
      setSubjects(fetchedSubjects);
    } catch (error) {
      console.error("Failed to fetch subjects:", error);
      toast({ title: "Error", description: "Could not load subjects.", variant: "destructive"});
      setSubjects([]);
    } finally {
      setIsLoading(false);
    }
  }

  React.useEffect(() => {
    loadSubjects();
  }, []);

  const handleSubjectCreated = () => {
    loadSubjects();
  };

  const handleSubjectUpdated = () => {
    loadSubjects();
  };

  const openEditDialog = (subject: Subject) => {
    setCurrentSubjectToEdit(subject);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (subject: Subject) => {
    setSubjectToDelete(subject);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!subjectToDelete) return;
    // TODO: Implement actual deleteSubject server action in /lib/actions.ts
    // const result = await deleteSubject(subjectToDelete.subject_id);
    // if (result.success) {
    //   toast({ title: "Subject Deleted", description: `Subject "${subjectToDelete.subject_name}" has been deleted.` });
    //   loadSubjects(); 
    // } else {
    //   toast({ title: "Deletion Failed", description: result.error || "Could not delete the subject.", variant: "destructive" });
    // }
    toast({ title: "Mock Deletion", description: `Subject "${subjectToDelete.subject_name}" would be deleted.` });
    setIsDeleteDialogOpen(false);
    setSubjectToDelete(null);
    loadSubjects(); // Refresh list
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight inline-flex items-center">
            <BookCopy className="mr-3 h-8 w-8" /> Manage Subjects
          </h1>
          <p className="text-muted-foreground">
            Add subjects and assign them to classes.
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
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
            <CreateSubjectForm onSuccess={handleSubjectCreated} setDialogOpen={setIsCreateDialogOpen} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subject List</CardTitle>
          <CardDescription>A list of subjects in your college.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <p className="text-center text-muted-foreground py-4">Loading subjects...</p>
          ) : subjects.length > 0 ? (
            <ul className="space-y-4">
              {subjects.map((sub) => (
                <li 
                  key={sub.subject_id} 
                  className="p-4 border rounded-md shadow-sm bg-card hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">{sub.subject_name} ({sub.subject_code})</h3>
                      <p className="text-sm text-muted-foreground">ID: {sub.subject_id} | Type: {sub.type}</p>
                      <p className="text-sm text-muted-foreground">Class: {sub.class_name || sub.class_id}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(sub)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => openDeleteDialog(sub)}>
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
                <BookCopy className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-muted-foreground">No Subjects Found</p>
                <p className="text-sm text-muted-foreground mt-1">
                    Click "Add Subject" to create one.
                </p>
            </div>
          )}
        </CardContent>
      </Card>

      {currentSubjectToEdit && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle>Edit Subject</DialogTitle>
              <DialogDescription>
                Update the details for {currentSubjectToEdit.subject_name}.
              </DialogDescription>
            </DialogHeader>
            <EditSubjectForm 
                subjectToEdit={currentSubjectToEdit} 
                onSuccess={handleSubjectUpdated} 
                setDialogOpen={setIsEditDialogOpen} 
            />
          </DialogContent>
        </Dialog>
      )}

      {subjectToDelete && (
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the subject
                "{subjectToDelete.subject_name}" (ID: {subjectToDelete.subject_id}).
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setSubjectToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete}>
                Yes, delete subject
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
