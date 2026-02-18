"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import api from "@/services/api";
import { AxiosError } from "axios";
import { AdminUserForm } from "./AdminUserForm";
import { AdminUserList } from "./AdminUserList";
import { AdminRequests } from "./AdminRequests";
import { Button } from "../ui/button";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminUsers() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  
  // Stări pentru Editare
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<{email: string, firstName: string, lastName: string} | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const [users, setUsers] = useState<any[]>([]);
  const [professorRequests, setProfessorRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [usersResponse, requestsResponse] = await Promise.all([
        api.get("/admin/users"),
        api.get("/admin/requests") 
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

  const pendingCount = useMemo(() => 
    professorRequests.filter(r => r.status === "pending").length, 
    [professorRequests]
  );

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    try {
      const response = await api.delete(`/admin/users/delete/${userToDelete}`);
      toast.success(response.data.message || "Utilizator șters!");
      fetchData(); 
    } catch (err) {
      const error = err as AxiosError<any>;
      const detail = error.response?.data?.detail;
      toast.error(typeof detail === 'object' ? "Date invalide" : (detail || "Eroare la ștergere"));
    } finally {
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleUpdateEmail = async () => {
    const newErrors: typeof errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Vă rugăm să corectați câmpurile marcate");
      return;
    }
    
    if (!userToEdit || !newEmail || newEmail === userToEdit.email) return;
    setIsUpdating(true);
    try {
      await api.put(`/admin/users/update/${userToEdit.email}`, {
        new_email: newEmail
      });
      toast.success("Email actualizat cu succes!");
      setEditDialogOpen(false);
      fetchData();
    } catch (err) {
      const error = err as AxiosError<any>;
      const detail = error.response?.data?.detail;
      toast.error(typeof detail === 'object' ? "Format email invalid" : (detail || "Eroare la actualizare"));
    } finally {
      setIsUpdating(false);
    }
  };

  const refreshButton = (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={fetchData} 
      disabled={isLoading}
      className="h-8 w-8 text-brand-blue hover:bg-blue-50 rounded-full transition-all"
    >
      <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
    </Button>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans">
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-100/50 p-1 h-12 rounded-xl border border-gray-200">
          <TabsTrigger value="users" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-brand-blue data-[state=active]:shadow-sm font-semibold">
            Gestionare utilizatori
          </TabsTrigger>
          <TabsTrigger value="requests" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-brand-blue data-[state=active]:shadow-sm font-semibold">
            Cereri profesori
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
            onEditClick={(user) => { 
              setUserToEdit(user); 
              setNewEmail(user.email);
              setEditDialogOpen(true); 
            }}
            refreshButton={refreshButton}
          />
        </TabsContent>

        <TabsContent value="requests" className="mt-6">
          <AdminRequests requests={professorRequests} onUpdate={fetchData} />
        </TabsContent>
      </Tabs>

      {/* Dialog Editare Email */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-md rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-gray-900 font-semibold text-xl">Modificare email utilizator</DialogTitle>
          <DialogDescription>Utilizator: {userToEdit?.lastName} {userToEdit?.firstName}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              type="email"
              placeholder="Noua adresă de email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className={cn(
                              "focus-visible:ring-1 border-gray-200 transition-colors",
                              errors.email ? "border-brand-red focus-visible:ring-brand-red" : "focus-visible:ring-brand-blue/30"
                            )}
            />
          </div>
          <DialogFooter>
            <Button variant="outline"
            className="font-semibold rounded-lg border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all active:scale-95"
             onClick={() => setEditDialogOpen(false)}>Anulează</Button>
            <Button 
              onClick={handleUpdateEmail} 
              disabled={isUpdating || !newEmail || newEmail === userToEdit?.email}
              className="bg-brand-blue text-white"
            >
              {isUpdating ? "Se salvează..." : "Salvează"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog Ștergere */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-xl border-gray-200 shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-semibold text-xl text-gray-900">Confirmare ștergere</AlertDialogTitle>
            <AlertDialogDescription>
              Sunteți sigur că doriți să ștergeți acest utilizator? Această acțiune nu poate fi anulată.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button 
                variant="ghost" 
                className="font-semibold rounded-lg border-gray-200 text-gray-600 hover:bg-gray-100"
              >
                Anulează
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button 
                onClick={handleDeleteConfirm} 
                className="bg-brand-red hover:bg-red-700 active:bg-red-600 text-white font-semibold rounded-lg shadow-md transition-all active:scale-95"
              >
                Șterge utilizator
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}