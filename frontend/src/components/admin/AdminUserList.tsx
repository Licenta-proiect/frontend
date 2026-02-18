"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input"; 
import { UserCog, Filter, Mail, Trash2, Search, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
  onEditClick,
  refreshButton
}: { 
  users: User[], 
  onDeleteClick: (email: string) => void,
  onEditClick: (user: User) => void,
  refreshButton?: React.ReactNode
}) {
  const [roleFilter, setRoleFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [storedEmail] = useState<string | null>(() => {
    if (typeof window !== "undefined") return localStorage.getItem("userEmail");
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

  return (
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
                  placeholder="Caută..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-10 border-gray-200 shadow-xs text-sm"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="h-10 text-sm border-gray-200 shadow-xs min-w-35">
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
      </CardHeader>
      <CardContent className="space-y-4">
        {filtered.map((user) => {
          if (!user) return null;
          const isMe = storedEmail && user.email?.toLowerCase().trim() === storedEmail.toLowerCase().trim();

          return (
            <Card key={user.id || user.email} className="border border-gray-100 shadow-xs hover:bg-gray-50/50 transition-colors">
              <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h4 className="font-medium text-gray-900">{user.lastName} {user.firstName}</h4>
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
                  {/* Ascundem butoanele dacă este userul curent */}
                  {!isMe && (
                    <>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => onEditClick(user)}
                        className="text-gray-600 border-gray-200 hover:bg-gray-100 font-semibold"
                      >
                        <Edit2 className="h-3.5 w-3.5 mr-2" /> Editează
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => onDeleteClick(user.email)} 
                        className="text-brand-red border-red-100 hover:bg-red-50 hover:text-brand-red font-semibold"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-2" /> Șterge
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </CardContent>
    </Card>
  );
}