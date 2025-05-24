import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function ViewStudentResultsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight inline-flex items-center"><FileText className="mr-3 h-8 w-8"/>View Results</h1>
        <p className="text-muted-foreground">
          Check your exam-wise results.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Your Exam Results</CardTitle>
          <CardDescription>Results for all exams you have appeared for.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Placeholder for results display.</p>
          {/* TODO: Implement UI to display exam results, possibly with filters by exam or semester */}
        </CardContent>
      </Card>
    </div>
  );
}
