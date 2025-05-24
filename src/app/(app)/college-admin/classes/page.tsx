import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Library } from "lucide-react";

export default function ManageClassesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Classes</h1>
          <p className="text-muted-foreground">
            Create classes and link them to departments.
          </p>
        </div>
        <Button disabled> {/* TODO: Implement Create Class Dialog */}
          <Library className="mr-2 h-4 w-4" />
          Add Class
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Class Management</CardTitle>
          <CardDescription>Class list and management tools will be here.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Placeholder for class management interface.</p>
        </CardContent>
      </Card>
    </div>
  );
}
