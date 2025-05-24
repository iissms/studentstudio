
'use client'; // Needs to be client component to manage dialog state

import * as React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UserPlus } from "lucide-react";
import { CreateUserForm } from '@/components/admin/CreateUserForm'; // Import the new form

// Mock user data - in a real app, this would be fetched
interface DisplayUser {
  id: string;
  name: string;
  email: string;
  role: string;
  collegeName?: string; // Optional: if displaying college info
}

async function getMockUsers(): Promise<DisplayUser[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return [
    { id: '1', name: 'Admin User', email: 'admin@example.com', role: 'ADMIN' },
    { id: '2', name: 'College Admin Main', email: 'collegeadmin@example.com', role: 'COLLEGE_ADMIN', collegeName: 'Global Tech' },
    // Add more mock users or fetch from the mockCreatedUsers in actions.ts (more complex for client)
  ];
}


export default function ManageUsersPage() {
  const [users, setUsers] = React.useState<DisplayUser[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isUserDialogOpen, setIsUserDialogOpen] = React.useState(false);

  // For now, the user list is static mock.
  // React.useEffect(() => {
  //   async function loadUsers() {
  //     setIsLoading(true);
  //     const fetchedUsers = await getMockUsers();
  //     setUsers(fetchedUsers);
  //     setIsLoading(false);
  //   }
  //   loadUsers();
  // }, []);

  const handleUserCreated = () => {
    // In a real app with an API, you might re-fetch users here or optimistically update.
    // For now, with mocks, this doesn't auto-refresh the list shown below.
    console.log("User created, if user list was dynamic, it would refresh.");
    // To see new users, the `getMockUsers` would need to be updated or integrate with `mockCreatedUsers` from actions.
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Users</h1>
          <p className="text-muted-foreground">
            Assign users to colleges and set their roles. (Currently supports creating College Admins)
          </p>
        </div>
        <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Fill in the details to add a new College Admin user.
              </DialogDescription>
            </DialogHeader>
            <CreateUserForm onSuccess={handleUserCreated} setDialogOpen={setIsUserDialogOpen} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User List</CardTitle>
          <CardDescription>A list of users in the system. (Static Mock Data)</CardDescription>
        </CardHeader>
        <CardContent>
          {/* {isLoading ? (
             <p>Loading users...</p>
          ) : users.length > 0 ? (
            <ul className="space-y-4">
              {users.map((user) => (
                <li key={user.id} className="p-4 border rounded-md shadow-sm">
                  <h3 className="text-lg font-semibold">{user.name} ({user.role})</h3>
                  <p className="text-sm text-muted-foreground">Email: {user.email}</p>
                  {user.collegeName && <p className="text-sm text-muted-foreground">College: {user.collegeName}</p> }
                </li>
              ))}
            </ul>
          ) : (
            <p>No users found. Click "Add User" to create one.</p>
          )} */}
          <p className="text-muted-foreground">User list display is currently a placeholder. Creating users is functional with mock backend.</p>
          {/* TODO: Implement dynamic user list, filters, and editing capabilities */}
        </CardContent>
      </Card>
    </div>
  );
}
