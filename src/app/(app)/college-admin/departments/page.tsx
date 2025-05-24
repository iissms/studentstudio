import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2 } from "lucide-react";

export default function ManageDepartmentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Departments</h1>
          <p className="text-muted-foreground">
            Create and manage departments within your college.
          </p>
        </div>
        <Button disabled> {/* TODO: Implement Create Department Dialog */}
          <Building2 className="mr-2 h-4 w-4" />
          Add Department
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Department Management</CardTitle>
          <CardDescription>Department list and management tools will be here.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Placeholder for department management interface.</p>
        </CardContent>
      </Card>
    </div>
  );
}
