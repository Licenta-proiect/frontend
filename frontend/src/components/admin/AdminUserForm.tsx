"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function AdminUserForm({ onAdd }: { onAdd: (u: any) => void }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  // Stare pentru erori, la fel ca în ProfessorAccessRequest
  const [errors, setErrors] = useState<{
    email?: boolean;
    firstName?: boolean;
    lastName?: boolean;
  }>({});

  const handleAdd = () => {
    const newErrors: typeof errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Validare locală
    if (!firstName.trim()) newErrors.firstName = true;
    if (!lastName.trim()) newErrors.lastName = true;
    if (!email.trim() || !emailRegex.test(email)) {
      newErrors.email = true;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Vă rugăm să corectați câmpurile marcate");
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
    
    // Resetare
    setFirstName("");
    setLastName("");
    setEmail("");
    setErrors({});
  };

  return (
    <Card className="border-gray-200 shadow-sm overflow-hidden gap-0 bg-white">
      <CardHeader className="bg-transparent border-none pb-2">
        <CardTitle className="flex items-center gap-2 text-gray-900 font-semibold text-xl">
          <UserPlus className="h-5 w-5 text-brand-blue" />
          Adăugare administrator
        </CardTitle>
        <CardDescription className="text-gray-600 font-medium">
          Creați un cont nou de administrator pentru sistem
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-2"> 
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="last-name" className="text-sm font-semibold text-gray-900">Nume</Label>
            <Input 
              id="last-name" 
              placeholder="Popescu" 
              value={lastName} 
              onChange={(e) => {
                setLastName(e.target.value);
                if (errors.lastName) setErrors(prev => ({ ...prev, lastName: false }));
              }} 
              className={cn(
                "focus-visible:ring-1 border-gray-200 transition-colors shadow-xs",
                errors.lastName ? "border-brand-red focus-visible:ring-brand-red" : "focus-visible:ring-brand-blue/30"
              )}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="first-name" className="text-sm font-semibold text-gray-900">Prenume</Label>
            <Input 
              id="first-name" 
              placeholder="Ion" 
              value={firstName} 
              onChange={(e) => {
                setFirstName(e.target.value);
                if (errors.firstName) setErrors(prev => ({ ...prev, firstName: false }));
              }} 
              className={cn(
                "focus-visible:ring-1 border-gray-200 transition-colors shadow-xs",
                errors.firstName ? "border-brand-red focus-visible:ring-brand-red" : "focus-visible:ring-brand-blue/30"
              )}
            />
          </div>
        </div>

        <div className="space-y-2 mt-4">
          <Label htmlFor="admin-email" className="text-sm font-semibold text-gray-900">Email</Label>
          <Input 
            id="admin-email" 
            type="email" 
            placeholder="admin@usm.ro" 
            value={email} 
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors(prev => ({ ...prev, email: false }));
            }} 
            className={cn(
              "focus-visible:ring-1 border-gray-200 transition-colors shadow-xs",
              errors.email ? "border-brand-red focus-visible:ring-brand-red" : "focus-visible:ring-brand-blue/30"
            )}
          />
        </div>

        <div className="pt-2 mt-6">
          <Button 
            onClick={handleAdd} 
            className="bg-brand-blue hover:bg-brand-blue-dark active:bg-brand-blue-dark active:scale-95 text-white font-medium shadow-md transition-all"
          >
            <UserPlus className="h-4 w-4 mr-2" /> 
            Adaugă administrator
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}