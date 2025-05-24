
'use client'; 

import * as React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UserPlus, Users } from "lucide-react"; // Added Users
import { CreateUserForm } from '@/components/admin/CreateUserForm';

interface DisplayUser {
  id: string;
  name: string;
  email: string;
  role: string;
  collegeName?: string; 
}

async function getMockUsers(): Promise<DisplayUser[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return [
    { id: '1', name: 'Admin User', email: 'admin@example.com', role: 'ADMIN' },
    { id: '2', name: 'College Admin Main', email: 'collegeadmin@example.com', role: 'COLLEGE_ADMIN', collegeName: 'Global Tech' },
  ];
}


export default function ManageUsersPage() {
  const [users, setUsers] = React.useState<DisplayUser[]>([]);
  const [isLoading, setIsLoading] = React.useState(true); // Kept for potential future use
  const [isUserDialogOpen, setIsUserDialogOpen] = React.useState(false);

  // Static mock, so useEffect for loading is commented out.
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
    console.log("User created, if user list was dynamic, it would refresh.");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight inline-flex items-center">
            <Users className="mr-3 h-8 w-8" /> Manage Users
          </h1>
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
          <CardDescription>A list of users in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground">User List Coming Soon</p>
            <p className="text-sm text-muted-foreground mt-1">
              The functionality to display and manage the list of users is currently under development.
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Creating users via the "Add User" button is functional with a mock backend.
            </p>
             {/* TODO: Implement dynamic user list, filters, and editing capabilities */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
