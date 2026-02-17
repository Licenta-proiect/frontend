import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";

export function AdminUserForm({ onAdd }: { onAdd: (u: any) => void }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const handleAdd = () => {
    if (!email || !firstName || !lastName) {
      toast.error("Vă rugăm să completați toate câmpurile");
      return;
    }
    onAdd({
      id: Math.random().toString(),
      name: `${firstName} ${lastName}`,
      email,
      role: "admin",
      createdAt: new Date(),
      status: "active"
    });
    toast.success("Administrator adăugat cu succes!");
    setFirstName(""); setLastName(""); setEmail("");
  };

  return (
    <Card className="border-gray-200 shadow-sm overflow-hidden">
      <CardHeader className="bg-linear-to-r from-white to-blue-50/30 border-b border-gray-100">
        <CardTitle className="flex items-center gap-2 text-gray-900 font-semibold text-xl">
          <UserPlus className="h-5 w-5 text-brand-blue" />
          Adăugare administrator
        </CardTitle>
        <CardDescription className="text-gray-600 font-medium">Creați un cont nou de administrator pentru sistem</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-900">Nume</Label>
            <Input placeholder="Ex: Popescu" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="h-10 border-gray-200 focus-visible:ring-brand-blue/30 shadow-xs" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-900">Prenume</Label>
            <Input placeholder="Ex: Ion" value={lastName} onChange={(e) => setLastName(e.target.value)} className="h-10 border-gray-200 focus-visible:ring-brand-blue/30 shadow-xs" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-900">Email</Label>
            <Input type="email" placeholder="admin@usm.ro" value={email} onChange={(e) => setEmail(e.target.value)} className="h-10 border-gray-200 focus-visible:ring-brand-blue/30 shadow-xs" />
          </div>
        </div>
        <Button onClick={handleAdd} className="bg-brand-blue hover:bg-brand-blue-dark text-white font-medium shadow-md transition-all active:scale-95">
          <UserPlus className="h-4 w-4 mr-2" /> Adaugă administrator
        </Button>
      </CardContent>
    </Card>
  );
}