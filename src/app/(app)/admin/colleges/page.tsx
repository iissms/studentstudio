
'use client'; 

import * as React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import { CreateCollegeForm } from '@/components/admin/CreateCollegeForm';
import { EditCollegeForm } from '@/components/admin/EditCollegeForm';
import { deleteCollege } from '@/lib/actions'; // Import delete action
import { useToast } from '@/hooks/use-toast'; // Import useToast

interface College {
  college_id: number;
  name: string;
  address: string;
  email?: string;
  phone?: string;
}

// Keep mock fetch function for now.
// Note: This mock function will not be updated by the createCollege, updateCollege, or deleteCollege actions.
// The list will only show these initial mock colleges.
async function getColleges(): Promise<College[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return [
    { college_id: 1, name: "Global Institute of Technology", address: "123 Tech Park, Silicon Valley", email: "contact@git.com", phone: "123-456-7890" },
    { college_id: 2, name: "National College of Arts", address: "456 Art Lane, Culture City", email: "info@nca.edu", phone: "098-765-4321" },
    { college_id: 3, name: "United Business School", address: "789 Commerce Ave, Metro City", email: "admin@ubs.biz" },
    { college_id: 4, name: "CMC Institute", address: "Bengaluru", email: "info@cmc.edu", phone: "080-123456" },
  ];
}


export default function ManageCollegesPage() {
  const { toast } = useToast();
  const [colleges, setColleges] = React.useState<College[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [currentCollegeToEdit, setCurrentCollegeToEdit] = React.useState<College | null>(null);
  const [collegeToDelete, setCollegeToDelete] = React.useState<College | null>(null);

  async function loadColleges() {
    setIsLoading(true);
    const fetchedColleges = await getColleges();
    setColleges(fetchedColleges);
    setIsLoading(false);
  }

  React.useEffect(() => {
    loadColleges();
  }, []);

  const handleCollegeCreated = () => {
    // console.log("College created, ideally re-fetch or update list.");
    // To see newly created colleges, getColleges() would need to be dynamic or loadColleges() would need to fetch from actions.ts's mock DB
    // For now, we rely on revalidatePath in the action, but getColleges() is static.
    // loadColleges(); // This would only show initial static list
  };

  const handleCollegeUpdated = () => {
    // console.log("College updated, ideally re-fetch or update list.");
    // loadColleges(); // This would only show initial static list
  };
  
  const handleCollegeDeleted = (deletedCollegeId: number) => {
    // Optimistically update UI or re-fetch.
    // setColleges(prev => prev.filter(c => c.college_id !== deletedCollegeId));
    // For now, with static getColleges(), we cannot truly reflect this in the list without a page reload
    // or making getColleges() dynamic.
    // loadColleges(); // This would only show initial static list
    toast({ title: "College Deleted", description: "The college has been marked for deletion (mock)." });
  };

  const openEditDialog = (college: College) => {
    setCurrentCollegeToEdit(college);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (college: College) => {
    setCollegeToDelete(college);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!collegeToDelete) return;
    const result = await deleteCollege(collegeToDelete.college_id);
    if (result.success) {
      handleCollegeDeleted(collegeToDelete.college_id);
    } else {
      toast({
        title: "Deletion Failed",
        description: result.error || "Could not delete the college.",
        variant: "destructive",
      });
    }
    setIsDeleteDialogOpen(false);
    setCollegeToDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Colleges</h1>
          <p className="text-muted-foreground">
            View, create, edit, and delete colleges in the system.
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create College
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New College</DialogTitle>
              <DialogDescription>
                Fill in the details below to add a new college to the system.
              </DialogDescription>
            </DialogHeader>
            <CreateCollegeForm onSuccess={handleCollegeCreated} setDialogOpen={setIsCreateDialogOpen} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>College List</CardTitle>
          <CardDescription>A list of all registered colleges. Updates to this list via forms may not reflect immediately due to mock data setup.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <p>Loading colleges...</p>
          ) : colleges.length > 0 ? (
            <ul className="space-y-4">
              {colleges.map((college) => (
                <li key={college.college_id} className="p-4 border rounded-md shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">{college.name}</h3>
                      <p className="text-sm text-muted-foreground">ID: {college.college_id}</p>
                      <p className="text-sm text-muted-foreground">Address: {college.address}</p>
                      {college.email && (
                        <p className="text-sm text-muted-foreground">Email: {college.email}</p>
                      )}
                      {college.phone && (
                        <p className="text-sm text-muted-foreground">Phone: {college.phone}</p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(college)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => openDeleteDialog(college)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No colleges found. Click "Create College" to add one.</p>
          )}
        </CardContent>
      </Card>

      {currentCollegeToEdit && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit College</DialogTitle>
              <DialogDescription>
                Update the details for {currentCollegeToEdit.name}.
              </DialogDescription>
            </DialogHeader>
            <EditCollegeForm 
              collegeToEdit={currentCollegeToEdit} 
              onSuccess={handleCollegeUpdated} 
              setDialogOpen={setIsEditDialogOpen} 
            />
          </DialogContent>
        </Dialog>
      )}

      {collegeToDelete && (
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the college
                "{collegeToDelete.name}" (ID: {collegeToDelete.college_id}) and all associated data.
                (Note: In this mock version, deletion primarily affects dynamically created colleges.)
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setCollegeToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete}>
                Yes, delete college
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
