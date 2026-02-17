"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input"; 
import { UserCog, Filter, Mail, Trash2, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminUserList({ users, onDeleteClick }: { users: any[], onDeleteClick: (email: string) => void }) {
  const [roleFilter, setRoleFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const getRoleBadgeColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case "admin": return "bg-red-50 text-brand-red border-red-100 font-bold";
      case "profesor": 
      case "professor": return "bg-blue-50 text-brand-blue border-blue-100 font-bold";
      case "student": return "bg-green-50 text-green-700 border-green-100 font-bold";
      default: return "bg-gray-50 text-gray-700 border-gray-100 font-bold";
    }
  };

  // Logică de filtrare combinată (Rol + Căutare text)
  const filtered = users.filter((user) => {
    if (!user) return false;

    // 1. Filtru de Rol
    const matchesRole = roleFilter === "all" || user.role?.toLowerCase() === roleFilter.toLowerCase();

    // 2. Filtru de Căutare (Nume, Prenume sau Email)
    const fullName = `${user.lastName} ${user.firstName}`.toLowerCase();
    const matchesSearch = 
      fullName.includes(searchQuery.toLowerCase()) || 
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesRole && matchesSearch;
  });

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-gray-900 font-semibold text-xl">
                <UserCog className="h-5 w-5 text-brand-blue" /> Lista utilizatori
              </CardTitle>
              <CardDescription className="font-medium text-gray-600">
                {filtered.length} utilizatori găsiți
              </CardDescription>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Search Input */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Caută nume sau email..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-10 border-gray-200 shadow-xs focus-visible:ring-brand-blue/30"
                />
              </div>

              {/* Role Select */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="h-4 w-4 text-gray-400 shrink-0" />
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="h-10 text-sm border-gray-200 font-normal shadow-xs focus:ring-brand-blue/30 min-w-[140px]">
                    <SelectValue placeholder="Rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toate Rolurile</SelectItem>
                    <SelectItem value="student">Studenți</SelectItem>
                    <SelectItem value="profesor">Profesori</SelectItem>
                    <SelectItem value="admin">Administratori</SelectItem>
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

            return (
              <Card key={user.id || user.email} className="border border-gray-100 shadow-xs hover:bg-gray-50/50 transition-colors">
                <CardContent className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h4 className="font-bold text-gray-900">{user.lastName} {user.firstName}</h4>
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
                    {user.role?.toLowerCase() !== "admin" && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => onDeleteClick(user.email)} 
                        className="text-brand-red border-red-100 hover:bg-red-50 font-semibold active:scale-95"
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
  );
}