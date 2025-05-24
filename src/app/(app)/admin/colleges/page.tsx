import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";

// Mock data structure for colleges
interface College {
  id: string;
  name: string;
  code: string;
  address: string;
}

// Mock fetch function - replace with actual API call via server action
async function getColleges(): Promise<College[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return [
    { id: "1", name: "Global Institute of Technology", code: "GIT", address: "123 Tech Park, Silicon Valley" },
    { id: "2", name: "National College of Arts", code: "NCA", address: "456 Art Lane, Culture City" },
    { id: "3", name: "United Business School", code: "UBS", address: "789 Commerce Ave, Metro City" },
  ];
}


export default async function ManageCollegesPage() {
  const colleges = await getColleges();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Colleges</h1>
          <p className="text-muted-foreground">
            View, create, and manage colleges in the system.
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create College
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>College List</CardTitle>
          <CardDescription>A list of all registered colleges.</CardDescription>
        </CardHeader>
        <CardContent>
          {colleges.length > 0 ? (
            <ul className="space-y-4">
              {colleges.map((college) => (
                <li key={college.id} className="p-4 border rounded-md shadow-sm">
                  <h3 className="text-lg font-semibold">{college.name} ({college.code})</h3>
                  <p className="text-sm text-muted-foreground">{college.address}</p>
                  {/* Add Edit/Delete buttons here */}
                </li>
              ))}
            </ul>
          ) : (
            <p>No colleges found. Click "Create College" to add one.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
