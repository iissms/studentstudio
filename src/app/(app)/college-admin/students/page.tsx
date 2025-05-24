
'use client'; // Needs to be client component to manage dialog state

import * as React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { GraduationCap, UserPlus } from "lucide-react";
import { CreateStudentForm } from '@/components/college-admin/CreateStudentForm'; // Import the new form
import type { Student } from '@/types'; // Import Student type

// Mock function to get students for display
async function getMockStudents(collegeId?: number): Promise<Student[]> {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  
  // Combine initial mock students with any students added via the form (from mockCreatedStudents in actions.ts)
  // This is a simplified approach for mock data; a real API would handle this.
  // For now, we'll just show a static list. The `createStudent` action adds to a separate mock array.
  const staticMockStudents: Student[] = [
    { student_id: 2001, class_id: 101, college_id: 1, roll_number: "SC001", full_name: "Alice Wonderland", dob: "2005-03-10", gender: "Female", email: "alice@example.com", phone: "1234567890", address: "123 Fantasy Lane", admission_date: "2023-06-01", class_name: "1st PUC Science" },
    { student_id: 2002, class_id: 102, college_id: 1, roll_number: "CM001", full_name: "Bob The Builder", dob: "2004-07-15", gender: "Male", email: "bob@example.com", phone: "0987654321", address: "456 Tool Street", admission_date: "2022-07-01", class_name: "2nd PUC Commerce" },
  ];

  return staticMockStudents.filter(s => collegeId ? s.college_id === collegeId : true);
}


export default function ManageStudentsPage() {
  const [students, setStudents] = React.useState<Student[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isStudentDialogOpen, setIsStudentDialogOpen] = React.useState(false);
  
  // TODO: In a real app, get the logged-in college admin's college_id
  const collegeAdminCollegeId = 1; // Placeholder

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
    // In a real app, you might re-fetch students here or optimistically update.
    // For now, with mock `getMockStudents`, this won't auto-refresh the list with new entries.
    // The `createStudent` action adds to `mockCreatedStudents` in actions.ts,
    // but `getMockStudents` here reads a static list.
    console.log("Student added. To see in list, mock data fetching would need to be dynamic.");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Students</h1>
          <p className="text-muted-foreground">
            Add and manage student records for your college.
          </p>
        </div>
        <Dialog open={isStudentDialogOpen} onOpenChange={setIsStudentDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-xl"> {/* Wider dialog */}
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
              <DialogDescription>
                Fill in the details below to add a new student.
              </DialogDescription>
            </DialogHeader>
            <CreateStudentForm onSuccess={handleStudentAdded} setDialogOpen={setIsStudentDialogOpen} />
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
             <p>Loading students...</p>
          ) : students.length > 0 ? (
            <ul className="space-y-4">
              {students.map((student) => (
                <li key={student.student_id} className="p-4 border rounded-md shadow-sm">
                  <h3 className="text-lg font-semibold">{student.full_name} ({student.roll_number})</h3>
                  <p className="text-sm text-muted-foreground">ID: {student.student_id} | Class: {student.class_name || student.class_id}</p>
                  <p className="text-sm text-muted-foreground">DOB: {student.dob} | Gender: {student.gender}</p>
                  {student.email && <p className="text-sm text-muted-foreground">Email: {student.email}</p>}
                  {student.phone && <p className="text-sm text-muted-foreground">Phone: {student.phone}</p>}
                  {/* TODO: Add Edit/Delete buttons here */}
                </li>
              ))}
            </ul>
          ) : (
            <p>No students found. Click "Add Student" to create one.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
