"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { AdminUserForm } from "./AdminUserForm";
import { AdminUserList } from "./AdminUserList";
import { AdminRequests } from "./AdminRequests";

interface User {
  id: string;
  name: string;
  email: string;
  role: "student" | "professor" | "admin";
  createdAt: Date;
  status: "active" | "inactive";
}

interface ProfessorRequest {
  id: string;
  email: string;
  requestDate: Date;
  status: "pending" | "approved" | "rejected";
}

export function AdminUsers() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  
  const [users, setUsers] = useState<User[]>([
    { id: "1", name: "Ion Popescu", email: "ion.popescu@student.usm.ro", role: "student", createdAt: new Date(2025, 8, 1), status: "active" },
    { id: "2", name: "Maria Ionescu", email: "maria.ionescu@usm.ro", role: "professor", createdAt: new Date(2024, 0, 15), status: "active" },
    { id: "3", name: "Elena Dumitrescu", email: "elena.dumitrescu@usm.ro", role: "professor", createdAt: new Date(2023, 6, 10), status: "active" },
    { id: "4", name: "Andrei Vasile", email: "andrei.vasile@student.usm.ro", role: "student", createdAt: new Date(2025, 8, 1), status: "active" },
  ]);

  const [professorRequests, setProfessorRequests] = useState<ProfessorRequest[]>([
    { id: "1", email: "george.stanescu@usm.ro", requestDate: new Date(2026, 1, 14, 10, 30), status: "pending" },
    { id: "2", email: "ana.marinescu@usm.ro", requestDate: new Date(2026, 1, 13, 15, 20), status: "pending" },
    { id: "3", email: "mihai.georgescu@usm.ro", requestDate: new Date(2026, 1, 12, 9, 45), status: "approved" },
  ]);

  const pendingCount = professorRequests.filter(r => r.status === "pending").length;

  const handleDeleteConfirm = () => {
    setUsers(users.filter(u => u.id !== userToDelete));
    setDeleteDialogOpen(false);
    toast.success("Utilizator șters!");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-100/50 p-1 h-12 rounded-xl border border-gray-200">
          <TabsTrigger value="users" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-brand-blue data-[state=active]:shadow-sm font-bold">
            Gestionare Utilizatori
          </TabsTrigger>
          <TabsTrigger value="requests" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-brand-blue data-[state=active]:shadow-sm font-bold">
            Cereri Profesori
            {pendingCount > 0 && (
              <Badge className="ml-2 bg-brand-red text-white border-none">{pendingCount}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6 mt-6">
          <AdminUserForm onAdd={(newUser) => setUsers([...users, newUser as User])} />
          <AdminUserList 
            users={users} 
            onDeleteClick={(id) => { setUserToDelete(id); setDeleteDialogOpen(true); }} 
          />
        </TabsContent>

        <TabsContent value="requests" className="mt-6">
          <AdminRequests requests={professorRequests} />
        </TabsContent>
      </Tabs>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-xl border-gray-200 shadow-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-bold text-xl text-gray-900">Confirmare Ștergere</AlertDialogTitle>
            <AlertDialogDescription className="font-medium text-gray-600">
              Sunteți sigur că doriți să ștergeți acest utilizator? Această acțiune nu poate fi anulată.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-bold rounded-lg border-gray-200">Anulează</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-brand-red hover:bg-red-700 text-white font-bold rounded-lg shadow-md">
              Șterge Utilizator
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}