// utils/generateExamExcel.ts
import * as XLSX from 'xlsx';
import type { Subject, Student } from '@/types';
import { fetchStudentsByClassId } from '@/lib/actions/student.actions';

interface ExamExcelData {
  exam_id: number;
  name: string;
  class_id: number;
  class_name?: string;
  start_date: string;
  end_date: string;
  marks: number;
  min_marks: number;
  department_id?: number;
  subjects?: Subject[];
}

export async function generateExamExcel(exam: ExamExcelData) {
  const subjects = exam.subjects || [];
  const students: Student[] = await fetchStudentsByClassId(exam.class_id);

  // ✅ Step 1: Build rows dynamically
  const rows = students.map(student => {
    const baseRow: Record<string, any> = {
      "Roll Number": student.roll_number,
      "Name": student.full_name,
    };

    // Add each subject column with empty mark
    subjects.forEach(sub => {
      baseRow[sub.subject_name] = ""; // Placeholder for marks
    });

    return baseRow;
  });

  // ✅ Step 2: Build Excel
  const workbook = XLSX.utils.book_new();
  const sheet = XLSX.utils.json_to_sheet(rows);

  XLSX.utils.book_append_sheet(workbook, sheet, `${exam.name}_Marks`);

  // ✅ Step 3: Export
  const filename = `Exam_${exam.exam_id}_${exam.name.replace(/\s+/g, '_')}_Marks.xlsx`;
  XLSX.writeFile(workbook, filename);
}
