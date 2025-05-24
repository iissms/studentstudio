import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardCheck } from "lucide-react";

export default function EnterAttendancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight inline-flex items-center"><ClipboardCheck className="mr-3 h-8 w-8"/>Enter Attendance</h1>
        <p className="text-muted-foreground">
          Record student attendance for your assigned subjects.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Attendance Entry</CardTitle>
          <CardDescription>Select class and subject to record attendance.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Placeholder for attendance entry interface.</p>
          {/* TODO: Implement class/subject selectors and attendance marking UI */}
        </CardContent>
      </Card>
    </div>
  );
}
