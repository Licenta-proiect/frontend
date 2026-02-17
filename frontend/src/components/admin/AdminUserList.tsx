import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserCog, Filter, Mail, Calendar, RefreshCw, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function AdminUserList({ users, onDeleteClick }: { users: any[], onDeleteClick: (id: string) => void }) {
  const [roleFilter, setRoleFilter] = useState("all");

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-red-50 text-brand-red border-red-100 font-bold";
      case "professor": return "bg-blue-50 text-brand-blue border-blue-100 font-bold";
      case "student": return "bg-green-50 text-green-700 border-green-100 font-bold";
      default: return "bg-gray-50 text-gray-700 border-gray-100 font-bold";
    }
  };

  const filtered = roleFilter === "all" ? users : users.filter(u => u.role === roleFilter);

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-gray-900 font-semibold text-xl">
              <UserCog className="h-5 w-5 text-brand-blue" />
              Lista utilizatori
            </CardTitle>
            <CardDescription className="font-medium text-gray-600">{filtered.length} utilizatori înregistrați</CardDescription>
          </div>
          <div className="flex items-center gap-2 min-w-[200px]">
            <Filter className="h-4 w-4 text-gray-400" />
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="h-10 text-sm border-gray-200 font-normal shadow-xs focus:ring-brand-blue/30"><SelectValue /></SelectTrigger>
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
        {filtered.map((user) => (
          <Card key={user.id} className="border border-gray-100 shadow-xs hover:bg-gray-50/50 transition-colors">
            <CardContent className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h4 className="font-bold text-gray-900">{user.name}</h4>
                  <Badge variant="outline" className={cn(getRoleBadgeColor(user.role))}>{user.role.toUpperCase()}</Badge>
                  <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-bold border-gray-200 text-gray-500">{user.status}</Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm font-medium text-gray-600">
                  <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-brand-blue" /><span>{user.email}</span></div>
                  <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-brand-blue" /><span>{user.createdAt.toLocaleDateString("ro-RO")}</span></div>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                {user.role === "student" && (
                  <Button size="sm" variant="outline" onClick={() => toast.success("Rol schimbat!")} className="border-gray-200 font-semibold text-gray-700 hover:text-brand-blue active:scale-95">
                    <RefreshCw className="h-3.5 w-3.5 mr-2" /> Schimbă în Profesor
                  </Button>
                )}
                {user.role !== "admin" && (
                  <Button size="sm" variant="outline" onClick={() => onDeleteClick(user.id)} className="text-brand-red border-red-100 hover:bg-red-50 font-semibold active:scale-95">
                    <Trash2 className="h-3.5 w-3.5 mr-2" /> Șterge
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}