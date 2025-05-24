
import type { User, UserRole, Department, College, Class, Subject, Exam, ExamSubjectMap, Student } from '@/types';

// In-memory mock databases for entities
export const mockUsersDb: Record<string, Omit<User, 'id' | 'email' | 'college_id'> & { id: string, email: string, passwordSimple: string, college_id?: number }> = {
  'admin@example.com': { id: '1', name: 'Admin User', email: 'admin@example.com', role: 'ADMIN', passwordSimple: 'admin123' },
  'collegeadmin@example.com': { id: '2', name: 'College Admin', email: 'collegeadmin@example.com', role: 'COLLEGE_ADMIN', passwordSimple: 'password', college_id: 1 },
  'teacher@example.com': { id: '3', name: 'Teacher User', email: 'teacher@example.com', role: 'TEACHER', passwordSimple: 'password', college_id: 1 },
  'student@example.com': { id: '4', name: 'Student User', email: 'student@example.com', role: 'STUDENT', passwordSimple: 'password', college_id: 1 },
};

export let mockCreatedUsers: (User & {password: string, college_id?: number})[] = [];

// --- Centralized Mock Data Store ---
export let mockInitialColleges: College[] = [
    { college_id: 1, name: "Global Institute of Technology", address: "123 Tech Park, Silicon Valley", email: "contact@git.com", phone: "123-456-7890" },
    { college_id: 2, name: "National College of Arts", address: "456 Art Lane, Culture City", email: "info@nca.edu", phone: "098-765-4321" },
    { college_id: 3, name: "United Business School", address: "789 Commerce Ave, Metro City", email: "admin@ubs.biz" },
    { college_id: 4, name: "CMC Institute", address: "Bengaluru", email: "info@cmc.edu", phone: "080-123456" },
];
export let mockCreatedColleges: College[] = [];

export let mockInitialDepartments: Department[] = [
    { department_id: 1, name: "Science Department", college_id: 1 },
    { department_id: 2, name: "Humanities Department", college_id: 1 },
    { department_id: 3, name: "Commerce Studies", college_id: 1 },
    { department_id: 5, name: "Engineering Dept", college_id: 2 },
];
export let mockCreatedDepartments: Department[] = [];

export let mockInitialClasses: Class[] = [
    { class_id: 101, class_name: "1st PUC Science", department_id: 1, academic_year: "2024-2025", college_id: 1 },
    { class_id: 102, class_name: "2nd PUC Commerce", department_id: 3, academic_year: "2024-2025", college_id: 1 },
    { class_id: 103, class_name: "B.A. History Sem 1", department_id: 2, academic_year: "2025-2026", college_id: 1 },
    { class_id: 104, class_name: "Mech Engg Year 1", department_id: 5, academic_year: "2024-2025", college_id: 2 },
];
export let mockCreatedClasses: Class[] = [];

export let mockInitialStudents: Student[] = [
    { student_id: 2001, class_id: 101, college_id: 1, roll_number: "SC001", full_name: "Alice Wonderland", dob: "2005-03-10", gender: "Female", email: "alice@example.com", phone: "1234567890", address: "123 Fantasy Lane", admission_date: "2023-06-01"},
    { student_id: 2002, class_id: 102, college_id: 1, roll_number: "CM001", full_name: "Bob The Builder", dob: "2004-07-15", gender: "Male", email: "bob@example.com", phone: "0987654321", address: "456 Tool Street", admission_date: "2022-07-01"},
    { student_id: 2003, class_id: 104, college_id: 2, roll_number: "ENG001", full_name: "Charlie Brown", dob: "2005-08-20", gender: "Male", email: "charlie@example.com", phone: "555-1234", address: "789 Engineering Rd", admission_date: "2023-07-15"},
];
export let mockCreatedStudents: Student[] = [];

export let mockInitialSubjects: Subject[] = [
    { subject_id: 201, class_id: 101, subject_code: "PHY101", subject_name: "Physics", type: "Theory", college_id: 1 },
    { subject_id: 202, class_id: 101, subject_code: "CHEM101", subject_name: "Chemistry", type: "Theory", college_id: 1 },
    { subject_id: 203, class_id: 102, subject_code: "ACC101", subject_name: "Accountancy", type: "Theory", college_id: 1 },
    { subject_id: 204, class_id: 101, subject_code: "PHY101L", subject_name: "Physics Lab", type: "Practical", college_id: 1 },
    { subject_id: 205, class_id: 104, subject_code: "MECH101", subject_name: "Mechanics", type: "Theory", college_id: 2 },
];
export let mockCreatedSubjects: Subject[] = [];

export let mockInitialExams: Exam[] = [
    { exam_id: 301, class_id: 101, name: "Physics Midterm I", marks: 50, min_marks: 17, start_date: "2024-08-15", end_date: "2024-08-15", college_id: 1, assigned_subject_ids: [201, 204] },
    { exam_id: 302, class_id: 102, name: "Accountancy Unit Test 1", marks: 25, min_marks: 9, start_date: "2024-09-01", end_date: "2024-09-01", college_id: 1, assigned_subject_ids: [203] },
    { exam_id: 303, class_id: 101, name: "Chemistry Final Practical", marks: 30, min_marks: 10, start_date: "2025-03-10", end_date: "2025-03-12", college_id: 1 },
    { exam_id: 304, class_id: 104, name: "Mechanics Midterm", marks: 100, min_marks: 40, start_date: "2024-10-15", end_date: "2024-10-15", college_id: 2, assigned_subject_ids: [205] },
];
export let mockCreatedExams: Exam[] = [];

export let mockExamSubjectMaps: ExamSubjectMap[] = [
    { mapping_id: 1, exam_id: 301, subject_id: 201, college_id: 1 },
    { mapping_id: 2, exam_id: 301, subject_id: 204, college_id: 1 },
    { mapping_id: 3, exam_id: 302, subject_id: 203, college_id: 1 },
    { mapping_id: 4, exam_id: 304, subject_id: 205, college_id: 2 },
];
