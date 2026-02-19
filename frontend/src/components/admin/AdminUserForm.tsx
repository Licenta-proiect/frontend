"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, RotateCcw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import api from "@/services/api";
import { AxiosError } from "axios"; 

export function AdminUserForm({ onAdd }: { onAdd: () => void }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errors, setErrors] = useState<{ email?: boolean; firstName?: boolean; lastName?: boolean; }>({});

  const handleReset = () => {
    setFirstName(""); setLastName(""); setEmail(""); setErrors({});
  };

  const handleAdd = async () => {
    const newErrors: typeof errors = {};
    if (!firstName.trim()) newErrors.firstName = true;
    if (!lastName.trim()) newErrors.lastName = true;
    if (!email.trim() || !email.includes("@")) newErrors.email = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Vă rugăm să corectați câmpurile marcate");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post("/admin/users/create", {
        lastName: lastName.trim(),
        firstName: firstName.trim(),
        email: email.trim(),
        role: "ADMIN" 
      });

      // Verificăm statusul de succes (200 sau 201 Created)
      if (response.status === 200 || response.status === 201) {
        // Folosim mesajul trimis de backend pentru o experiență mai precisă
        toast.success("Administrator adăugat!");
        onAdd(); 
        handleReset();
      }
    } catch (err) {
      const error = err as AxiosError<{ detail: string }>;
      toast.error(error.response?.data?.detail || "Eroare la server");
    } finally {
      setIsSubmitting(false);
    }
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
            <Label htmlFor="last-name" className="text-md font-semibold text-gray-900">Nume</Label>
            <Input 
              id="last-name" 
              placeholder="Popescu" 
              value={lastName} 
              disabled={isSubmitting}
              onChange={(e) => {
                setLastName(e.target.value);
                if (errors.lastName) setErrors(prev => ({ ...prev, lastName: false }));
              }} 
              className={cn(
                "focus-visible:ring-1 border-gray-200 transition-colors shadow-xs h-10",
                errors.lastName ? "border-brand-red focus-visible:ring-brand-red" : "focus-visible:ring-brand-blue/30"
              )}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="first-name" className="text-md font-semibold text-gray-900">Prenume</Label>
            <Input 
              id="first-name" 
              placeholder="Ion" 
              value={firstName} 
              disabled={isSubmitting}
              onChange={(e) => {
                setFirstName(e.target.value);
                if (errors.firstName) setErrors(prev => ({ ...prev, firstName: false }));
              }} 
              className={cn(
                "focus-visible:ring-1 border-gray-200 transition-colors shadow-xs h-10",
                errors.firstName ? "border-brand-red focus-visible:ring-brand-red" : "focus-visible:ring-brand-blue/30"
              )}
            />
          </div>
        </div>

        <div className="space-y-2 mt-4">
          <Label htmlFor="admin-email" className="text-md font-semibold text-gray-900">Email</Label>
          <Input 
            id="admin-email" 
            type="email" 
            placeholder="admin@usm.ro" 
            value={email} 
            disabled={isSubmitting}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors(prev => ({ ...prev, email: false }));
            }} 
            className={cn(
              "focus-visible:ring-1 border-gray-200 transition-colors shadow-xs h-10",
              errors.email ? "border-brand-red focus-visible:ring-brand-red" : "focus-visible:ring-brand-blue/30"
            )}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2 mt-6">
          <Button 
            onClick={handleAdd} 
            disabled={isSubmitting}
            className="bg-brand-blue hover:bg-brand-blue-dark active:bg-brand-blue-dark active:scale-95 text-white font-medium shadow-md transition-all h-10 px-6 sm:flex-none"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <UserPlus className="h-4 w-4 mr-2" /> 
            )}
            Adaugă administrator
          </Button>
          <Button 
            onClick={handleReset} 
            variant="outline" 
            disabled={isSubmitting}
            className="border-gray-200 text-gray-900 font-medium hover:bg-gray-100 flex-1 sm:flex-none h-10 px-6"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Resetează
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}