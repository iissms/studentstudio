
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";

// Updated College interface based on API documentation
interface College {
  college_id: number;
  name: string;
  address: string;
  email?: string;
  phone?: string;
}

// Updated mock fetch function to reflect API structure
async function getColleges(): Promise<College[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return [
    { college_id: 1, name: "Global Institute of Technology", address: "123 Tech Park, Silicon Valley", email: "contact@git.com", phone: "123-456-7890" },
    { college_id: 2, name: "National College of Arts", address: "456 Art Lane, Culture City", email: "info@nca.edu", phone: "098-765-4321" },
    { college_id: 3, name: "United Business School", address: "789 Commerce Ave, Metro City", email: "admin@ubs.biz" /* phone intentionally omitted for testing conditional render */ },
    { college_id: 4, name: "CMC Institute", address: "Bengaluru", email: "info@cmc.edu", phone: "080-123456" },
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
                <li key={college.college_id} className="p-4 border rounded-md shadow-sm">
                  <h3 className="text-lg font-semibold">{college.name}</h3>
                  <p className="text-sm text-muted-foreground">ID: {college.college_id}</p>
                  <p className="text-sm text-muted-foreground">Address: {college.address}</p>
                  {college.email && (
                    <p className="text-sm text-muted-foreground">Email: {college.email}</p>
                  )}
                  {college.phone && (
                    <p className="text-sm text-muted-foreground">Phone: {college.phone}</p>
                  )}
                  {/* TODO: Add Edit/Delete buttons here, which would interact with /api/colleges/:id */}
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
