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

  // State for form validation errors
  const [errors, setErrors] = useState<{
    email?: boolean;
    firstName?: boolean;
    lastName?: boolean;
  }>({});

  /**
   * Resets the form fields to their initial empty values
   */
  const handleReset = () => { 
    setProfessorEmail(""); 
    setProfessorFirstName(""); 
    setProfessorLastName("");
  };

  /**
   * Validates form data and sends an access request to the backend
   */
  const handleProfessorRequest = async () => {
    const newErrors: typeof errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Frontend validation logic
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

    try {
      /**
       * API call using the configured axios instance.
       * Route matches the backend endpoint for access requests.
       */
      const response = await api.post("/request-access", {
        firstName: professorFirstName.trim(),
        lastName: professorLastName.trim(),
        email: professorEmail.trim(),
      }, {
        // Allows handling 400 status codes without triggering axios global error interceptors
        validateStatus: (status) => status >= 200 && status < 500 
      });

      const { status, data } = response;

      // Handle business error cases (e.g., Duplicate request)
      if (status === 400) {
        toast.error(data?.detail || "Există deja o cerere pentru acest email.");
        
        handleReset();
        return;
      }

      // Success handling
      setErrors({});
      toast.success(data?.message || "Cererea a fost trimisă către administrator!");
      setProfessorDialogOpen(false);

      handleReset();

    } catch (error: unknown) {
      // Handle critical network or server errors
      toast.error("Eroare critică de conexiune la server.");
      console.error("Unexpected error during access request:", error);
    }
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
          className="md:h-11 text-sm md:px-6 gap-2 md:text-base px-3 border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white active:scale-95 transition-all duration-200"
        >
          <Bell className="h-4 w-4 md:h-5 md:w-5" />
          <span className="hidden sm:inline">Solicitare acces</span>
          <span className="sm:hidden">Solicitare</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-md rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-gray-900 font-semibold text-xl">Solicitare acces profesor</DialogTitle>
          <DialogDescription className="text-gray-800"> 
            Administratorul va fi notificat pentru a vă activa accesul în sistem. 
            Această procedură este necesară doar pentru cadrele didactice care nu au adresa de email configurată în orarul oficial.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="last-name" className="text-md font-semibold text-gray-900">Nume</Label>
              <Input 
                id="last-name" 
                placeholder="Popescu"
                value={professorLastName} 
                onChange={(e) => {
                  setProfessorLastName(e.target.value);
                  if (errors.lastName) setErrors(prev => ({ ...prev, lastName: false }));
                }} 
                className={cn(
                  "border-gray-200 transition-colors",
                  errors.lastName ? "border-brand-red focus-visible:ring-brand-red" : ""
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="first-name" className="text-md font-semibold text-gray-900">Prenume</Label>
              <Input 
                id="first-name" 
                placeholder="Ion"
                value={professorFirstName} 
                onChange={(e) => {
                  setProfessorFirstName(e.target.value);
                  if (errors.firstName) setErrors(prev => ({ ...prev, firstName: false }));
                }} 
                className={cn(
                  "border-gray-200 transition-colors",
                  errors.firstName ? "border-brand-red focus-visible:ring-brand-red" : ""
                )}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-md font-semibold text-gray-900">Email</Label>
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
                "border-gray-200 transition-colors",
                errors.email ? "border-brand-red focus-visible:ring-brand-red" : ""
              )}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button 
            variant="outline"
            className="font-semibold rounded-lg border-gray-200 text-gray-900 hover:bg-gray-100 hover:text-gray-900 transition-all active:scale-95"
            onClick={() => {
              setProfessorDialogOpen(false);
              handleReset();
            }}
          >
            Anulează
          </Button>
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