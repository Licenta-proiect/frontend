"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import api from "@/services/api";
import { AxiosError } from "axios";
import { AdminUserForm } from "./AdminUserForm";
import { AdminUserList, User as UserData } from "./AdminUserList";
import { AdminRequests, ProfessorRequest } from "./AdminRequests";
import { AdminUserDeleteDialog } from "./AdminUserDeleteDialog";
import { AdminUserEditDialog } from "./AdminUserEditDialog";
import { Button } from "../ui/button";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminUsers() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentView = searchParams.get("view") || "list";

  const updateParams = useCallback((viewValue: string) => {
    const params = new URLSearchParams(searchParams.toString());
    // Păstrăm tab=users (sau îl setăm dacă nu există) pentru nav bar
    params.set("tab", "users"); 
    // Actualizăm view-ul (list sau requests)
    params.set("view", viewValue);
    
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [searchParams, router]);

  // Handler pentru schimbarea tab-urilor interne (Toggle-ul de Admin)
  const handleViewChange = (value: string) => {
    updateParams(value);
  };

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<UserData | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [emailError, setEmailError] = useState("");

  const [users, setUsers] = useState<UserData[]>([]);
  const [professorRequests, setProfessorRequests] = useState<ProfessorRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [usersResponse, requestsResponse] = await Promise.all([
        api.get<UserData[]>("/admin/users"),
        api.get<ProfessorRequest[]>("/admin/requests") 
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
      const response = await api.delete<{message: string}>(`/admin/users/delete/${userToDelete}`);
      toast.success(response.data.message || "Utilizator șters!");
      fetchData(); 
    } catch (err) {
      const error = err as AxiosError<{detail: string | object}>;
      const detail = error.response?.data?.detail;
      toast.error(typeof detail === 'object' ? "Date invalide" : (detail || "Eroare la ștergere"));
    } finally {
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleUpdateEmail = async () => {
    setEmailError("");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(newEmail)) {
      setEmailError("Format email invalid");
      toast.error("Vă rugăm să introduceți o adresă de email validă");
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
      const error = err as AxiosError<{detail: string | object}>;
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
      <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
    </Button>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans">
      <Tabs value={currentView} onValueChange={handleViewChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-100/50 p-1 h-12 rounded-xl border border-gray-200">
          <TabsTrigger value="list" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-brand-blue data-[state=active]:shadow-sm font-semibold">
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

        <TabsContent value="list" className="space-y-6 mt-6">
          <AdminUserForm onAdd={fetchData} />
          <AdminUserList 
            users={users} 
            onDeleteClick={(email) => { setUserToDelete(email); setDeleteDialogOpen(true); }} 
            onEditClick={(user) => { 
              setUserToEdit(user); 
              setNewEmail(user.email);
              setEmailError("");
              setEditDialogOpen(true); 
            }}
            refreshButton={refreshButton}
          />
        </TabsContent>

        <TabsContent value="requests" className="mt-6">
          <AdminRequests 
            requests={professorRequests} 
            onUpdate={fetchData} 
          />
        </TabsContent>
      </Tabs>

      {/* Dialog Editare Email */}
      <AdminUserEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        userToEdit={userToEdit}
        newEmail={newEmail}
        setNewEmail={setNewEmail}
        emailError={emailError}
        isUpdating={isUpdating}
        onConfirm={handleUpdateEmail}
        isSameEmail={newEmail === userToEdit?.email}
      />

      {/* Alert Dialog Ștergere */}
      <AdminUserDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}