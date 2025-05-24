import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";

export default function EnterResultsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight inline-flex items-center"><ClipboardList className="mr-3 h-8 w-8"/>Enter/Update Student Results</h1>
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
          <p className="text-muted-foreground">Placeholder for results entry interface.</p>
          {/* TODO: Implement exam/subject selectors and results entry table */}
        </CardContent>
      </Card>
    </div>
  );
}
