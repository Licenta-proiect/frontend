"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Clock, UserCog, UserPlus, Trash2, Mail, CheckCircle2, XCircle, RefreshCw, Filter, Calendar } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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

export function AdminSync() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminFirstName, setNewAdminFirstName] = useState("");
  const [newAdminLastName, setNewAdminLastName] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const [users, setUsers] = useState<User[]>([
    { id: "1", name: "Ion Popescu", email: "ion.popescu@student.usm.ro", role: "student", createdAt: new Date(2025, 8, 1), status: "active" },
    { id: "2", name: "Maria Ionescu", email: "maria.ionescu@usm.ro", role: "professor", createdAt: new Date(2024, 0, 15), status: "active" },
    { id: "3", name: "Elena Dumitrescu", email: "elena.dumitrescu@usm.ro", role: "professor", createdAt: new Date(2023, 6, 10), status: "active" },
    { id: "4", name: "Andrei Vasile", email: "andrei.vasile@student.usm.ro", role: "student", createdAt: new Date(2025, 8, 1), status: "active" },
  ]);

  const [professorRequests, setProfessorRequests] = useState<ProfessorRequest[]>([
    { id: "1", email: "george.stanescu@usm.ro", requestDate: new Date(2026, 1, 14, 10, 30), status: "pending" },
    { id: "2", email: "ana.marinescu@usm.ro", requestDate: new Date(2026, 1, 13, 15, 20), status: "pending" },
  ]);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-red-50 text-brand-red border-red-100 font-bold";
      case "professor": return "bg-blue-50 text-brand-blue border-blue-100 font-bold";
      case "student": return "bg-green-50 text-green-700 border-green-100 font-bold";
      default: return "bg-gray-50 text-gray-700 border-gray-100 font-bold";
    }
  };

  const pendingRequests = professorRequests.filter((r) => r.status === "pending");
  const filteredUsers = roleFilter === "all" ? users : users.filter((u) => u.role === roleFilter);

  const handleAddAdmin = () => {
    if (!newAdminEmail || !newAdminFirstName || !newAdminLastName) {
      toast.error("Vă rugăm să completați toate câmpurile");
      return;
    }
    toast.success("Administrator adăugat cu succes!");
    setNewAdminEmail(""); setNewAdminFirstName(""); setNewAdminLastName("");
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
            {pendingRequests.length > 0 && (
              <Badge className="ml-2 bg-brand-red text-white border-none">{pendingRequests.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6 mt-6">
          <Card className="border-gray-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-linear-to-r from-white to-blue-50/30 border-b border-gray-100">
              <CardTitle className="flex items-center gap-2 text-gray-900 font-bold text-xl">
                <UserPlus className="h-5 w-5 text-brand-blue" />
                Adăugare Administrator
              </CardTitle>
              <CardDescription className="text-gray-600 font-medium">Creați un cont nou de administrator pentru sistem</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-gray-900">Nume</Label>
                  <Input placeholder="Ex: Popescu" value={newAdminFirstName} onChange={(e) => setNewAdminFirstName(e.target.value)} className="h-10 border-gray-200 focus-visible:ring-brand-blue/30" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-gray-900">Prenume</Label>
                  <Input placeholder="Ex: Ion" value={newAdminLastName} onChange={(e) => setNewAdminLastName(e.target.value)} className="h-10 border-gray-200 focus-visible:ring-brand-blue/30" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-gray-900">Email</Label>
                  <Input type="email" placeholder="admin@usm.ro" value={newAdminEmail} onChange={(e) => setNewAdminEmail(e.target.value)} className="h-10 border-gray-200 focus-visible:ring-brand-blue/30" />
                </div>
              </div>
              <Button onClick={handleAddAdmin} className="bg-brand-blue hover:bg-brand-blue-dark text-white font-bold shadow-md transition-all active:scale-95">
                <UserPlus className="h-4 w-4 mr-2" /> Adaugă Administrator
              </Button>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2 text-gray-900 font-bold text-xl">
                    <UserCog className="h-5 w-5 text-brand-blue" />
                    Lista Utilizatori
                  </CardTitle>
                  <CardDescription className="font-medium">{filteredUsers.length} utilizatori înregistrați în total</CardDescription>
                </div>
                <div className="flex items-center gap-2 min-w-[200px]">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="h-9 text-xs border-gray-200 font-medium">
                      <SelectValue placeholder="Toate rolurile" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toate Rolurile</SelectItem>
                      <SelectItem value="student">Studenți</SelectItem>
                      <SelectItem value="professor">Profesori</SelectItem>
                      <SelectItem value="admin">Administratori</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {filteredUsers.map((user) => (
                <Card key={user.id} className="border border-gray-100 shadow-xs hover:bg-gray-50/50 transition-colors">
                  <CardContent className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h4 className="font-bold text-gray-900">{user.name}</h4>
                        <Badge variant="outline" className={cn(getRoleBadgeColor(user.role))}>{user.role.toUpperCase()}</Badge>
                        <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-bold border-gray-200 text-gray-500">{user.status}</Badge>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm font-medium">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="h-4 w-4 text-brand-blue" />
                          <span>{user.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="h-4 w-4 text-brand-blue" />
                          <span>{user.createdAt.toLocaleDateString("ro-RO")}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {user.role === "student" && (
                        <Button size="sm" variant="outline" onClick={() => toast.success("Rol schimbat!")} className="border-gray-200 font-bold hover:text-brand-blue active:scale-95">
                          <RefreshCw className="h-3.5 w-3.5 mr-2" /> Schimbă în Profesor
                        </Button>
                      )}
                      {user.role !== "admin" && (
                        <Button size="sm" variant="outline" onClick={() => { setUserToDelete(user.id); setDeleteDialogOpen(true); }} className="text-brand-red border-red-100 hover:bg-red-50 font-bold active:scale-95">
                          <Trash2 className="h-3.5 w-3.5 mr-2" /> Șterge
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="mt-6">
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 font-bold text-xl">
                <Mail className="h-5 w-5 text-brand-blue" />
                Cereri Profesori în Așteptare
              </CardTitle>
              <CardDescription className="font-medium text-gray-600">Procesați solicitările de acces pentru cadrele didactice</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingRequests.length === 0 ? (
                <div className="text-center py-12 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="font-bold text-gray-500">Nu există cereri în așteptare</p>
                </div>
              ) : (
                pendingRequests.map((request) => (
                  <Card key={request.id} className="border-l-4 border-l-amber-500 shadow-xs">
                    <CardContent className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="space-y-1 w-full">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-gray-900">{request.email}</span>
                          <Badge className="bg-amber-50 text-amber-700 border-amber-100 font-bold">ÎN AȘTEPTARE</Badge>
                        </div>
                        <p className="text-sm text-gray-500 font-medium flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5" />
                          Trimisă la: {request.requestDate.toLocaleString("ro-RO")}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0 w-full sm:w-auto">
                        <Button onClick={() => toast.success("Aprobat!")} className="bg-green-600 hover:bg-green-700 text-white font-bold flex-1 sm:flex-none active:scale-95 shadow-sm">
                          <CheckCircle2 className="h-4 w-4 mr-2" /> Aprobă
                        </Button>
                        <Button variant="outline" onClick={() => toast.error("Respins!")} className="text-brand-red border-red-100 hover:bg-red-50 font-bold flex-1 sm:flex-none active:scale-95 shadow-sm">
                          <XCircle className="h-4 w-4 mr-2" /> Respinge
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-xl border-gray-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-bold text-xl text-gray-900">Confirmare Ștergere</AlertDialogTitle>
            <AlertDialogDescription className="font-medium text-gray-600">
              Sunteți sigur că doriți să ștergeți acest utilizator? Această acțiune nu poate fi anulată.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-bold rounded-lg border-gray-200 shadow-xs">Anulează</AlertDialogCancel>
            <AlertDialogAction onClick={() => { setUsers(users.filter(u => u.id !== userToDelete)); setDeleteDialogOpen(false); toast.success("Utilizator șters!"); }} className="bg-brand-red hover:bg-red-700 text-white font-bold rounded-lg shadow-md">
              Șterge Utilizator
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}