
export type UserRole = "ADMIN" | "COLLEGE_ADMIN" | "TEACHER" | "STUDENT" | "GUEST"

export interface User {
  id: string
  name: string | null
  email: string | null
  role: UserRole
  college_id?: number; // Added for College Admin context
}

export interface NavItem {
  title: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  disabled?: boolean
  external?: boolean
  label?: string
  description?: string
  roles?: UserRole[] // Roles that can see this nav item
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
  college_id?: number; // To associate with a college
}

export interface Class {
  class_id: number;
  class_name: string;
  department_id: number;
  department_name?: string; // For display purposes
  academic_year: string;
  college_id?: number; // To associate with a college
}

export interface Subject {
  subject_id: number;
  class_id: number;
  class_name?: string; // For display purposes
  subject_code: string;
  subject_name: string;
  type: "Theory" | "Practical" | "Other"; // Or a more generic string if preferred
  college_id?: number; // To associate with a college (via class)
}
