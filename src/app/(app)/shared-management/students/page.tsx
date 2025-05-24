
'use client'; 

import * as React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { GraduationCap, UserPlus } from "lucide-react";
import { CreateStudentForm } from '@/components/college-admin/CreateStudentForm'; 
import type { Student } from '@/types'; 

async function getMockStudents(collegeId?: number): Promise<Student[]> {
  await new Promise(resolve => setTimeout(resolve, 500)); 
  
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
        <Dialog open={isStudentDialogOpen} onOpenChange={setIsStudentDialogOpen}>
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
             <p className="text-center text-muted-foreground py-4">Loading students...</p>
          ) : students.length > 0 ? (
            <ul className="space-y-4">
              {students.map((student) => (
                <li 
                  key={student.student_id} 
                  className="p-4 border rounded-md shadow-sm bg-card hover:shadow-lg transition-shadow duration-200"
                >
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
    </div>
  );
}
