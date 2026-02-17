"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import api from "@/services/api";
import { AdminUserForm } from "./AdminUserForm";
import { AdminUserList } from "./AdminUserList";
import { AdminRequests } from "./AdminRequests";

export function AdminUsers() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [professorRequests, setProfessorRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Funcția care aduce datele proaspete de la server (utilizatori și cereri)
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Putem aduce ambele seturi de date în paralel
      const [usersResponse, requestsResponse] = await Promise.all([
        api.get("/admin/users"),
        //api.get("/admin/requests") // Presupunând că aceasta este ruta pentru cereri
      ]);
      setUsers(usersResponse.data);
      setProfessorRequests(requestsResponse.data);
    } catch {
      toast.error("Nu s-au putut încărca datele");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calculăm numărul de cereri în așteptare pentru badge
  const pendingCount = useMemo(() => 
    professorRequests.filter(r => r.status === "pending").length, 
    [professorRequests]
  );

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    try {
      await api.delete(`/admin/users/delete/${userToDelete}`);
      toast.success("Utilizator șters!");
      fetchData(); 
    } catch {
      toast.error("Eroare la ștergere");
    } finally {
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans">
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-100/50 p-1 h-12 rounded-xl border border-gray-200">
          <TabsTrigger value="users" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-brand-blue data-[state=active]:shadow-sm font-semibold">
            Gestionare Utilizatori
          </TabsTrigger>
          <TabsTrigger value="requests" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-brand-blue data-[state=active]:shadow-sm font-semibold">
            Cereri Profesori
            {/* Badge pentru cereri în așteptare */}
            {pendingCount > 0 && (
              <Badge className="ml-2 bg-brand-red text-white border-none font-bold">
                {pendingCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6 mt-6">
          <AdminUserForm onAdd={fetchData} />
          <AdminUserList 
            users={users} 
            onDeleteClick={(email) => { setUserToDelete(email); setDeleteDialogOpen(true); }} 
          />
        </TabsContent>

        {/* Tab-ul pentru Cereri restaurat */}
        <TabsContent value="requests" className="mt-6">
          <AdminRequests requests={professorRequests} />
        </TabsContent>
      </Tabs>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-xl border-gray-200 shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-semibold text-xl text-gray-900">Confirmare Ștergere</AlertDialogTitle>
            <AlertDialogDescription className="font-medium text-gray-600">
              Sunteți sigur că doriți să ștergeți acest utilizator? Această acțiune nu poate fi anulată.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-semibold rounded-lg border-gray-200">Anulează</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-brand-red hover:bg-red-700 text-white font-semibold rounded-lg shadow-md">
              Șterge Utilizator
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}