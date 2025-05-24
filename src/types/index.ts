
export type UserRole = "ADMIN" | "COLLEGE_ADMIN" | "TEACHER" | "STUDENT" | "GUEST"

export interface User {
  id: string
  name: string | null
  email: string | null
  role: UserRole
  college_id?: number; 
}

export interface NavItem {
  title: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  disabled?: boolean
  external?: boolean
  label?: string
  description?: string
  roles?: UserRole[] 
}

export interface College {
  college_id: number;
  name: string;
  address: string;
  email?: string;
  phone?: string;
}

export interface Department {
  department_id: number;
  name: string;
  college_id?: number; 
}

export interface Class {
  class_id: number;
  class_name: string;
  department_id: number;
  department_name?: string; 
  academic_year: string;
  college_id?: number; 
}

export interface Subject {
  subject_id: number;
  class_id: number;
  class_name?: string; 
  subject_code: string;
  subject_name: string;
  type: "Theory" | "Practical" | "Other"; 
  college_id?: number; 
}

export interface Exam {
  exam_id: number;
  class_id: number;
  class_name?: string; // For display
  name: string;
  marks: number; // Total marks
  min_marks: number; // Minimum passing marks
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  college_id?: number; // To associate with a college (via class)
  assigned_subject_ids?: number[]; // Optional: For easier tracking or display
}

export interface ExamSubjectMap {
  mapping_id: number; // A unique ID for the mapping itself
  exam_id: number;
  subject_id: number;
  college_id: number; // college_id for context, same as exam's college_id
}

export interface Student {
  student_id: number;
  class_id: number;
  college_id: number;
  roll_number: string;
  full_name: string;
  dob: string; // YYYY-MM-DD
  gender: "Male" | "Female" | "Other";
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  admission_date: string; // YYYY-MM-DD
  // For display purposes, if needed when fetching student lists:
  class_name?: string; 
}
