"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bell } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import api from "@/services/api";

export function ProfessorAccessRequest() {
  const [professorEmail, setProfessorEmail] = useState("");
  const [professorFirstName, setProfessorFirstName] = useState("");
  const [professorLastName, setProfessorLastName] = useState("");
  const [professorDialogOpen, setProfessorDialogOpen] = useState(false);

  // Stare pentru erori
  const [errors, setErrors] = useState<{
    email?: boolean;
    firstName?: boolean;
    lastName?: boolean;
  }>({});

  const handleProfessorRequest = async () => {
    const newErrors: typeof errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!professorFirstName.trim()) newErrors.firstName = true;
    if (!professorLastName.trim()) newErrors.lastName = true;
    if (!professorEmail.trim() || !emailRegex.test(professorEmail)) {
      newErrors.email = true;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Vă rugăm să corectați câmpurile marcate");
      return;
    }

    setErrors({});

    toast.success("Cererea a fost trimisă către administrator!");
    setProfessorDialogOpen(false);

    // Resetare câmpuri
    setProfessorEmail("");
    setProfessorFirstName("");
    setProfessorLastName("");
  };

  return (
    <Dialog 
      open={professorDialogOpen} 
      onOpenChange={(open) => {
        setProfessorDialogOpen(open);
        if (!open) setErrors({});
      }}
    >
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="md:h-11 md:px-6 gap-2 text-xs md:text-base px-3 border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white active:scale-95 transition-all duration-200"
        >
          <Bell className="h-4 w-4 md:h-5 md:w-5" />
          <span className="hidden sm:inline">Solicitare acces</span>
          <span className="sm:hidden">Solicitare acces</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-md rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-gray-900 font-bold text-xl">Solicitare acces profesor</DialogTitle>
          <DialogDescription> Administratorul va fi notificat pentru a vă adăuga în sistem. </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="last-name">Nume</Label>
              <Input 
                id="last-name" 
                value={professorLastName} 
                onChange={(e) => {
                  setProfessorLastName(e.target.value);
                  if (errors.lastName) setErrors(prev => ({ ...prev, lastName: false }));
                }} 
                className={cn(
                  "focus-visible:ring-1 border-gray-200 transition-colors",
                  errors.lastName ? "border-brand-red focus-visible:ring-brand-red" : "focus-visible:ring-brand-blue/30"
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="first-name">Prenume</Label>
              <Input 
                id="first-name" 
                value={professorFirstName} 
                onChange={(e) => {
                  setProfessorFirstName(e.target.value);
                  if (errors.firstName) setErrors(prev => ({ ...prev, firstName: false }));
                }} 
                className={cn(
                  "focus-visible:ring-1 border-gray-200 transition-colors",
                  errors.firstName ? "border-brand-red focus-visible:ring-brand-red" : "focus-visible:ring-brand-blue/30"
                )}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="prenume.nume@usm.ro" 
              value={professorEmail} 
              onChange={(e) => {
                setProfessorEmail(e.target.value);
                if (errors.email) setErrors(prev => ({ ...prev, email: false }));
              }} 
              className={cn(
                "focus-visible:ring-1 border-gray-200 transition-colors",
                errors.email ? "border-brand-red focus-visible:ring-brand-red" : "focus-visible:ring-brand-blue/30"
              )}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setProfessorDialogOpen(false)}>Anulează</Button>
          <Button 
            className="bg-brand-blue hover:bg-brand-blue-dark active:bg-brand-blue-dark active:scale-95 text-white transition-all shadow-md" 
            onClick={handleProfessorRequest}
          >
            Trimite cererea
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}