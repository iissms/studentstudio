
'use client'; 

import * as React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { GraduationCap, UserPlus, Pencil, Trash2 } from "lucide-react";
import { CreateStudentForm } from '@/components/college-admin/CreateStudentForm'; 
import type { Student } from '@/types'; 
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';


async function getMockStudents(collegeId?: number): Promise<Student[]> {
  await new Promise(resolve => setTimeout(resolve, 500)); 
  
  const staticMockStudents: Student[] = [
    { student_id: 2001, class_id: 101, college_id: 1, roll_number: "SC001", full_name: "Alice Wonderland", dob: "2005-03-10", gender: "Female", email: "alice@example.com", phone: "1234567890", address: "123 Fantasy Lane", admission_date: "2023-06-01", class_name: "1st PUC Science" },
    { student_id: 2002, class_id: 102, college_id: 1, roll_number: "CM001", full_name: "Bob The Builder", dob: "2004-07-15", gender: "Male", email: "bob@example.com", phone: "0987654321", address: "456 Tool Street", admission_date: "2022-07-01", class_name: "2nd PUC Commerce" },
  ];

  return staticMockStudents.filter(s => collegeId ? s.college_id === collegeId : true);
}


export default function ManageStudentsPage() {
  const { toast } = useToast();
  const [students, setStudents] = React.useState<Student[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [currentStudentToEdit, setCurrentStudentToEdit] = React.useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = React.useState<Student | null>(null);
  
  const collegeAdminCollegeId = 1; 

  React.useEffect(() => {
    async function loadStudents() {
      setIsLoading(true);
      const fetchedStudents = await getMockStudents(collegeAdminCollegeId);
      setStudents(fetchedStudents);
      setIsLoading(false);
    }
    loadStudents();
  }, [collegeAdminCollegeId]);


  const handleStudentAdded = () => {
    console.log("Student added. To see in list, mock data fetching would need to be dynamic.");
  };

  const handleStudentUpdated = () => {
    console.log("Student updated. To see in list, mock data fetching would need to be dynamic.");
  };

  const openEditDialog = (student: Student) => {
    setCurrentStudentToEdit(student);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (student: Student) => {
    setStudentToDelete(student);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!studentToDelete) return;
    // TODO: Implement actual deleteStudent server action
    // const result = await deleteStudent(studentToDelete.student_id);
    // if (result.success) {
    //   toast({ title: "Student Deleted", description: `Student "${studentToDelete.full_name}" has been deleted.` });
    //   loadStudents(); 
    // } else {
    //   toast({ title: "Deletion Failed", description: result.error || "Could not delete the student.", variant: "destructive" });
    // }
    toast({ title: "Mock Deletion", description: `Student "${studentToDelete.full_name}" would be deleted.` });
    setIsDeleteDialogOpen(false);
    setStudentToDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight inline-flex items-center">
            <GraduationCap className="mr-3 h-8 w-8" /> Manage Students
          </h1>
          <p className="text-muted-foreground">
            Add and manage student records for your college.
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-xl"> 
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
              <DialogDescription>
                Fill in the details below to add a new student.
              </DialogDescription>
            </DialogHeader>
            <CreateStudentForm onSuccess={handleStudentAdded} setDialogOpen={setIsCreateDialogOpen} />
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Student List</CardTitle>
          <CardDescription>A list of students in your college. (Static Mock Data)</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <p className="text-center text-muted-foreground py-4">Loading students...</p>
          ) : students.length > 0 ? (
            <ul className="space-y-4">
              {students.map((student) => (
                <li 
                  key={student.student_id} 
                  className="p-4 border rounded-md shadow-sm bg-card hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">{student.full_name} ({student.roll_number})</h3>
                      <p className="text-sm text-muted-foreground">ID: {student.student_id} | Class: {student.class_name || student.class_id}</p>
                      <p className="text-sm text-muted-foreground">DOB: {student.dob ? format(new Date(student.dob), "MMM dd, yyyy") : 'N/A'} | Gender: {student.gender}</p>
                      {student.email && <p className="text-sm text-muted-foreground">Email: {student.email}</p>}
                      {student.phone && <p className="text-sm text-muted-foreground">Phone: {student.phone}</p>}
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(student)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => openDeleteDialog(student)}>
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
                <GraduationCap className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-muted-foreground">No Students Found</p>
                <p className="text-sm text-muted-foreground mt-1">
                    Click "Add Student" to create one.
                </p>
            </div>
          )}
        </CardContent>
      </Card>

      {currentStudentToEdit && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-xl">
            <DialogHeader>
              <DialogTitle>Edit Student</DialogTitle>
              <DialogDescription>
                Update the details for {currentStudentToEdit.full_name}.
              </DialogDescription>
            </DialogHeader>
            {/* TODO: Implement EditStudentForm component and import here */}
            {/* <EditStudentForm studentToEdit={currentStudentToEdit} onSuccess={handleStudentUpdated} setDialogOpen={setIsEditDialogOpen} /> */}
            <p className="py-4 text-center text-muted-foreground">Edit Student Form will be here.</p>
          </DialogContent>
        </Dialog>
      )}

      {studentToDelete && (
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the student
                "{studentToDelete.full_name}" (ID: {studentToDelete.student_id}).
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setStudentToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete}>
                Yes, delete student
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
