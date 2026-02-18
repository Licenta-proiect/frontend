"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input"; 
import { UserCog, Filter, Mail, Trash2, Search, Edit2 } from "lucide-react"; // Am adăugat Edit2
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"; // Importuri noi pentru Dialog
import { toast } from "sonner";
import api from "@/services/api";

interface User {
  id: string;
  lastName: string;
  firstName: string;
  email: string;
  role: string;
}

export function AdminUserList({ 
  users, 
  onDeleteClick,
  refreshButton,
  onUpdateSuccess // Adăugăm un callback opțional pentru refresh listă după update
}: { 
  users: User[], 
  onDeleteClick: (email: string) => void,
  refreshButton?: React.ReactNode,
  onUpdateSuccess?: () => void
}) {
  const [roleFilter, setRoleFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Stări pentru editare email
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  
  const [storedEmail] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("userEmail");
    }
    return null;
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case "admin": return "bg-red-50 text-brand-red border-red-100 font-bold";
      case "profesor": 
      case "professor": return "bg-blue-50 text-brand-blue border-blue-100 font-bold";
      case "student": return "bg-green-50 text-green-700 border-green-100 font-bold";
      default: return "bg-gray-50 text-gray-700 border-gray-100 font-bold";
    }
  };

  const filtered = users.filter((user) => {
    if (!user) return false;
    const matchesRole = roleFilter === "all" || user.role?.toLowerCase() === roleFilter.toLowerCase();
    const fullName = `${user.lastName} ${user.firstName}`.toLowerCase();
    const matchesSearch = 
      fullName.includes(searchQuery.toLowerCase()) || 
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesRole && matchesSearch;
  });

  // Funcția de procesare a schimbării email-ului
  const handleUpdateEmail = async () => {
    if (!editingUser || !newEmail || newEmail === editingUser.email) return;

    setIsUpdating(true);
    try {
      // Apelăm ruta PUT /admin/users/update/{email} conform logicii din backend
      await api.put(`/admin/users/update/${editingUser.email}`, {
        new_email: newEmail
      });
      
      toast.success("Email actualizat cu succes!");
      setEditingUser(null);
      if (onUpdateSuccess) onUpdateSuccess(); // Refresh automat la listă
    } catch (error: any) {
      const message = error.response?.data?.detail || "Eroare la actualizarea email-ului";
      toast.error(message);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-3"> 
                  <CardTitle className="flex items-center gap-2 text-gray-900 font-semibold text-xl">
                    <UserCog className="h-5 w-5 text-brand-blue" /> Lista utilizatori
                  </CardTitle>
                  {refreshButton} 
                </div>
                <CardDescription className="font-medium text-gray-600">
                  {filtered.length} utilizatori găsiți
                </CardDescription>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Caută după nume sau email..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-10 border-gray-200 transition-colors focus-visible:ring-1 focus-visible:ring-brand-blue/30 shadow-xs text-sm"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Filter className="h-4 w-4 text-gray-400 shrink-0" />
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="h-10 text-sm border-gray-200 transition-colors focus:ring-1 focus:ring-brand-blue/30 shadow-xs min-w-35 font-normal">
                      <SelectValue placeholder="Rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toate rolurile</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="profesor">Profesor</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-gray-500 font-medium border border-dashed rounded-lg">
              Nu a fost găsit niciun utilizator conform criteriilor.
            </div>
          ) : (
            filtered.map((user) => {
              if (!user || (!user.lastName && !user.firstName)) return null;
              const isMe = storedEmail && user.email?.toLowerCase().trim() === storedEmail.toLowerCase().trim();
              const isProfessor = user.role?.toLowerCase() === "profesor" || user.role?.toLowerCase() === "professor";

              return (
                <Card key={user.id || user.email} className="border border-gray-100 shadow-xs hover:bg-gray-50/50 transition-colors">
                  <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium text-gray-900">
                          {user.lastName} {user.firstName}
                        </h4>
                        <Badge variant="outline" className={cn(getRoleBadgeColor(user.role))}>
                          {user.role?.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                        <Mail className="h-4 w-4 text-brand-blue" />
                        <span>{user.email}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {/* Buton Editare Email - Apare doar pentru profesori */}
                      {isProfessor && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => { setEditingUser(user); setNewEmail(user.email); }}
                          className="text-gray-600 hover:text-brand-blue hover:bg-blue-50 font-semibold active:scale-95 transition-colors"
                        >
                          <Edit2 className="h-3.5 w-3.5 mr-2" /> Email
                        </Button>
                      )}

                      {!isMe && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => onDeleteClick(user.email)} 
                          className="text-brand-red border-red-100 hover:bg-red-50 hover:text-brand-red font-semibold active:scale-95 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-2" /> Șterge
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Dialog pentru editare email */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modificare Email Profesor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 text-sans">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Utilizator: {editingUser?.lastName} {editingUser?.firstName}</p>
              <Input
                type="email"
                placeholder="Introdu noua adresă de email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="border-gray-200"
              />
              <p className="text-[11px] text-gray-500 italic">
                * Modificarea email-ului va actualiza automat și datele de contact în tabela profesori.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditingUser(null)} disabled={isUpdating}>
              Anulează
            </Button>
            <Button 
              onClick={handleUpdateEmail} 
              disabled={isUpdating || !newEmail || newEmail === editingUser?.email}
              className="bg-brand-blue hover:bg-blue-700 text-white"
            >
              {isUpdating ? "Se salvează..." : "Salvează modificările"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}