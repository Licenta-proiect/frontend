"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, Users, Bell, LogIn } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function Home() {
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

  const handleGoogleLogin = () => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    window.location.href = `${backendUrl}/login`;
  };

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

    setProfessorEmail("");
    setProfessorFirstName("");
    setProfessorLastName("");
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-white flex flex-col font-sans">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 md:py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 shrink-0">
            <Calendar className="h-7 w-7 md:h-9 md:w-9 text-brand-blue" />
            <span className="text-xl md:text-2xl font-bold text-black tracking-tight leading-none">RecuperApp</span>
          </div>
          
          <div className="flex gap-2 md:gap-4 items-center">
            <Dialog open={professorDialogOpen} onOpenChange={(open) => {
              setProfessorDialogOpen(open);
              if (!open) setErrors({});
            }}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="md:h-11 md:px-6 gap-2 text-xs md:text-base px-3 border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white active:scale-95 transition-all duration-200"
                >
                  <Bell className="h-4 w-4 md:h-5 md:w-5" />
                  <span className="hidden sm:inline">Solicitare Acces</span>
                  <span className="sm:hidden">Acces</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] sm:max-w-md rounded-lg">
                <DialogHeader>
                  <DialogTitle className="text-gray-900 font-bold text-xl">Solicitare Acces Profesor</DialogTitle>
                  <DialogDescription> Administratorul va fi notificat pentru a vă adăuga în sistem. </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email instituțional</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="nume.prenume@usv.ro" 
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
                  <Button className="bg-brand-blue hover:bg-brand-blue-dark active:bg-brand-blue-dark active:scale-95 text-white transition-all shadow-md" onClick={handleProfessorRequest}>
                    Trimite Cererea
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button 
              onClick={handleGoogleLogin} 
              size="sm"
              className="bg-brand-blue hover:bg-brand-blue-dark active:bg-brand-blue-dark active:scale-95 md:h-11 md:px-6 gap-2 text-xs md:text-base px-3 shadow-md text-white font-medium transition-all"
            >
              <LogIn className="h-4 w-4 md:h-5 md:w-5" />
              <span className="hidden xs:inline">Login Google</span>
              <span className="xs:hidden">Login</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-16 grow flex flex-col justify-center">
        <div className="text-center mb-10 md:mb-16">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Gestionare Recuperări FIESC
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Sistem modern integrat cu orarul oficial USV pentru planificarea eficientă a recuperărilor.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <FeatureCard 
            icon={<Users className="h-10 w-10 md:h-12 md:w-12 text-brand-blue" />}
            title="Studenți"
            description="Căutare inteligentă a sloturilor disponibile pentru laboratoare și seminarii în funcție de grupe."
          />
          <FeatureCard 
            icon={<Calendar className="h-10 w-10 md:h-12 md:w-12 text-brand-blue" />}
            title="Profesori"
            description="Rezervare facilă a sălilor și vizualizarea automată a grupelor alocate pe fiecare materie."
          />
          <FeatureCard 
            icon={<Clock className="h-10 w-10 md:h-12 md:w-12 text-brand-blue" />}
            title="Administratori"
            description="Sincronizare completă cu orarul USV și managementul centralizat al cererilor de acces."
          />
        </div>

        <div className="bg-brand-blue text-white rounded-2xl p-8 md:p-12 text-center mt-12 md:mt-16 shadow-lg">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Gata să începi?</h2>
          <p className="text-lg md:text-xl mb-8 text-blue-100">
            Autentifică-te pentru a accesa funcționalitățile aplicației
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={handleGoogleLogin}
            className="bg-white text-brand-blue hover:bg-gray-100 active:scale-95 font-semibold w-full sm:w-auto transition-all shadow-md"
          >
            Autentificare cu Google
          </Button>
        </div>
      </main>

      <footer className="border-t bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="text-center text-sm md:text-base text-gray-600 font-medium">
            <p>© 2026 RecuperApp - Sistem de Gestionare a Recuperărilor</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className="border-blue-100 shadow-sm hover:shadow-md transition-all duration-200 text-center md:text-left">
      <CardHeader className="flex flex-col items-center md:items-start">
        <div className="mb-4">{icon}</div>
        <CardTitle className="text-xl md:text-2xl font-bold text-gray-900">{title}</CardTitle>
        <CardDescription className="text-sm md:text-base leading-relaxed text-gray-600">{description}</CardDescription>
      </CardHeader>
    </Card>
  );
}