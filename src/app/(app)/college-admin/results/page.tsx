
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, ListChecks } from "lucide-react"; // Added ListChecks

export default function EnterResultsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight inline-flex items-center">
          <ClipboardList className="mr-3 h-8 w-8"/>Enter/Update Student Results
        </h1>
        <p className="text-muted-foreground">
          Manage student results per exam and subject.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Results Entry</CardTitle>
          <CardDescription>Select exam and subject to enter or update results.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ListChecks className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground">Results Entry Coming Soon</p>
            <p className="text-sm text-muted-foreground mt-1">
              The interface for entering and updating student results is under development.
            </p>
            {/* TODO: Implement exam/subject selectors and results entry table */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
