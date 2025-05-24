import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Newspaper } from "lucide-react";

export default function ManageExamsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Exams</h1>
          <p className="text-muted-foreground">
            Create exams for classes and assign subjects to them.
          </p>
        </div>
        <Button disabled> {/* TODO: Implement Create Exam Dialog */}
          <Newspaper className="mr-2 h-4 w-4" />
          Create Exam
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Exam Management</CardTitle>
          <CardDescription>Exam list and management tools will be here.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Placeholder for exam management interface.</p>
        </CardContent>
      </Card>
    </div>
  );
}
