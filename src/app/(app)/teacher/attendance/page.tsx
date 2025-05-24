
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardCheck, Hand } from "lucide-react"; // Added Hand

export default function EnterAttendancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight inline-flex items-center">
          <ClipboardCheck className="mr-3 h-8 w-8"/>Enter Attendance
        </h1>
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
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Hand className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground">Attendance Entry Coming Soon</p>
            <p className="text-sm text-muted-foreground mt-1">
              The interface for entering student attendance is currently under development.
            </p>
            {/* TODO: Implement class/subject selectors and attendance marking UI */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
