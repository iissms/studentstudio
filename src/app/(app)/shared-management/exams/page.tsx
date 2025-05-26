
'use client'; 

import * as React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Newspaper, PlusCircle, BookOpenCheck, Pencil, Trash2 } from "lucide-react";
import { format } from 'date-fns';
import { CreateExamForm } from '@/components/college-admin/CreateExamForm'; 
import { EditExamForm } from '@/components/college-admin/EditExamForm';
import { AssignSubjectsToExamForm } from '@/components/college-admin/AssignSubjectsToExamForm'; 
import type { Exam } from '@/types'; 
import { useToast } from '@/hooks/use-toast';
import { fetchExamsForCollegeAdmin } from '@/lib/actions'; // Updated import
import { generateExamExcel } from '@/utils/generateExamExcel';
import { Download } from "lucide-react";

export default function ManageExamsPage() {
  const { toast } = useToast();
  const [exams, setExams] = React.useState<Exam[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isCreateExamDialogOpen, setIsCreateExamDialogOpen] = React.useState(false);
  const [isAssignSubjectsDialogOpen, setIsAssignSubjectsDialogOpen] = React.useState(false);
  const [currentExamForAssignment, setCurrentExamForAssignment] = React.useState<Exam | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [currentExamToEdit, setCurrentExamToEdit] = React.useState<Exam | null>(null);
  const [examToDelete, setExamToDelete] = React.useState<Exam | null>(null);

  async function loadExams() {
    setIsLoading(true);
    try {
      const fetchedExams = await fetchExamsForCollegeAdmin(); // Use new fetch action
      console.log("Fetched Exams:", fetchedExams);
      setExams(fetchedExams);
    } catch (error) {
      console.error("Failed to fetch exams:", error);
      toast({ title: "Error", description: "Could not load exams.", variant: "destructive"});
      setExams([]);
    } finally {
      setIsLoading(false);
    }
  }

  React.useEffect(() => {
    loadExams();
  }, []);

  const handleExamCreated = () => {
    loadExams();
  };

  const handleExamUpdated = () => {
    loadExams();
  };

  const handleSubjectsAssigned = () => {
    loadExams(); 
  }

  const openAssignSubjectsDialog = (exam: Exam) => {
    setCurrentExamForAssignment(exam);
    setIsAssignSubjectsDialogOpen(true);
  };

  const openEditDialog = (exam: Exam) => {
    setCurrentExamToEdit(exam);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (exam: Exam) => {
    setExamToDelete(exam);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!examToDelete) return;
    // TODO: Implement actual deleteExam server action in /lib/actions.ts
    // const result = await deleteExam(examToDelete.exam_id);
    // if (result.success) {
    //   toast({ title: "Exam Deleted", description: `Exam "${examToDelete.name}" has been deleted.` });
    //   loadExams(); 
    // } else {
    //   toast({ title: "Deletion Failed", description: result.error || "Could not delete the exam.", variant: "destructive" });
    // }
    toast({ title: "Mock Deletion", description: `Exam "${examToDelete.name}" would be deleted.` });
    setIsDeleteDialogOpen(false);
    setExamToDelete(null);
    loadExams(); // Refresh list
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
          <CardDescription>A list of exams in your college.</CardDescription>
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
                      <p className="text-sm text-muted-foreground">ID: {exam.exam_id} | Class: {exam.class_name || exam.class_id}</p>
                      <p className="text-sm text-muted-foreground">Marks: {exam.marks} | Min. Passing: {exam.min_marks}</p>
                      <p className="text-sm text-muted-foreground">
                        Dates: {format(new Date(exam.start_date), "MMM dd, yyyy")} - {format(new Date(exam.end_date), "MMM dd, yyyy")}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Assigned Subjects IDs: {exam.assigned_subject_ids?.join(', ') || 'None'}
                      </p>
                      <ul className="text-xs text-muted-foreground mt-1">
                      {exam.subjects?.length ? (
                        <ul>
                          {exam.subjects.map(subject => (
                            <li key={subject.subject_id}>
                              {subject.subject_name} ({subject.subject_code}) - {subject.type}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p>No subjects assigned to this exam.</p>
                      )}

                          </ul>
                    </div>
                    <div className="flex flex-col space-y-2 items-end">
                        <Button variant="outline" size="sm" onClick={() => openAssignSubjectsDialog(exam)} className="w-full justify-start">
                            <BookOpenCheck className="mr-2 h-4 w-4" />
                            Assign Subjects
                        </Button>
                        <div className="flex space-x-2 mt-2">
                          <Button variant="outline" size="sm" onClick={() => openEditDialog(exam)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => openDeleteDialog(exam)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                          </Button>
                          <Button
  variant="secondary"
  size="sm"
  onClick={() => generateExamExcel(exam)}
  className="flex items-center"
>
  <Download className="mr-1 h-4 w-4" />
  Download Excel
</Button>
                        </div>
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

      {currentExamToEdit && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>Edit Exam</DialogTitle>
              <DialogDescription>
                Update the details for {currentExamToEdit.name}.
              </DialogDescription>
            </DialogHeader>
            <EditExamForm 
                examToEdit={currentExamToEdit} 
                onSuccess={handleExamUpdated} 
                setDialogOpen={setIsEditDialogOpen} 
            />
          </DialogContent>
        </Dialog>
      )}

      {examToDelete && (
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the exam
                "{examToDelete.name}" (ID: {examToDelete.exam_id}).
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setExamToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete}>
                Yes, delete exam
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
