import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookCopy } from "lucide-react";

export default function ManageSubjectsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Subjects</h1>
          <p className="text-muted-foreground">
            Add subjects and assign them to classes.
          </p>
        </div>
        <Button disabled> {/* TODO: Implement Add Subject Dialog */}
          <BookCopy className="mr-2 h-4 w-4" />
          Add Subject
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Subject Management</CardTitle>
          <CardDescription>Subject list and management tools will be here.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Placeholder for subject management interface.</p>
        </CardContent>
      </Card>
    </div>
  );
}
