"use client";

import { Button } from "@/components/ui/button";
import { Calendar, LogIn, Mail, CheckCircle2, Sparkles, Loader2, KeyRound, ArrowLeft } from "lucide-react"; 
import { ProfessorAccessRequest } from "@/components/ProfessorAccessRequest";
import { Input } from "@/components/ui/input"; 
import api from "@/services/api"; 
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

/**
 * Landing Page Component
 * Handles user introduction to the platform and dual-method authentication.
 */
export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOtpLoading, setIsOtpLoading] = useState<boolean>(false);
  const appName = process.env.NEXT_PUBLIC_APP_TITLE;

  // --- PASSWORDLESS AUTHENTICATION STATES ---
  const [email, setEmail] = useState<string>((""));
  const [otpCode, setOtpCode] = useState<string>("");
  const [authStep, setAuthStep] = useState<"email" | "code">("email");
  const [countdown, setCountdown] = useState<number>(300); // 5-minute TOTP window

  // --- OTP TIMER EFFECT ---
  useEffect(() => {
    if (authStep !== "code" || countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [authStep, countdown]);

  /**
   * Orchestrates the Google login flow.
   * First checks if the system is in maintenance mode via the interceptor-enabled API instance.
   * If available, redirects to the Google OAuth provider.
   */
  const handleGoogleLogin = async (): Promise<void> => {
    setIsLoading(true);
    try {
      // 1. Perform a status check
      // If the backend returns a 503, the Axios interceptor handles the redirect.
      const response = await api.get("/admin/sync/status");

      // 2. Double-check the payload flag (as a fail-safe)
      if (response.data.is_updating) {
        window.location.href = "/maintenance";
        return;
      }

      // 3. Only if the system is NOT updating, allow the browser to leave the app
      const backendUrl = process.env.NEXT_PUBLIC_API_URL;
      window.location.href = `${backendUrl}/login`;
      
    } catch (error: unknown) {
      // Handle the error using Type Guards to avoid 'any'
      if (axios.isAxiosError(error)) {
        // If the error is 503, the interceptor handles navigation, 
        // so we only reset loading for other types of failures.
        if (error.response?.status !== 503) {
          setIsLoading(false);
        }
      } else {
        // Fallback for non-Axios errors
        setIsLoading(false);
      }
    }
  };

  // --- PASSWORDLESS AUTHENTICATION METHODS ---

  /**
   * Phase 1: Request Magic Code via Email
   */
  const handleSendOtp = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Vă rugăm să introduceți o adresă de e-mail.");
      return;
    }

    setIsOtpLoading(true);
    try {
      const statusRes = await api.get("/admin/sync/status");
      if (statusRes.data.is_updating) {
        window.location.href = "/maintenance";
        return;
      }

      // We call the request endpoint through standard Axios to check if domain or schedule is active
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/passwordless/request`, { email: email.toLowerCase().trim() });

      toast.success("Codul de verificare a fost trimis cu succes pe e-mail!");
      setAuthStep("code");
      setCountdown(300); 
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const errorMsg = error.response?.data?.detail || "Eroare la solicitarea codului.";
        
        // REDIRECT IF EMAIL LACKS ACCESS PRIVILEGES (403 Forbidden)
        if (error.response?.status === 403) {
          toast.error("Acces neautorizat. Redirecționare...");
          setTimeout(() => {
            router.push(`/auth-error?message=${encodeURIComponent(errorMsg)}`);
          }, 1200);
          return;
        }

        if (error.response?.status !== 503) toast.error(errorMsg);
      } else {
        toast.error("Eroare neprevăzută la trimiterea e-mailului.");
      }
    } finally {
      setIsOtpLoading(false);
    }
  };

  /**
   * Phase 2: Verify Magic Code and establish session credentials
   */
  const handleVerifyOtp = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.length < 6) {
      toast.error("Vă rugăm să introduceți codul complet din 6 cifre.");
      return;
    }

    if (countdown === 0) {
      toast.error("Codul a expirat. Vă rugăm să solicitați un cod nou.");
      return;
    }

    setIsOtpLoading(true);
    try {
      // CALLS THE REPAIRED NEXT.JS INTERNAL HANDLER ROUTE (Bypassing api.ts interceptor loop)
      const response = await axios.post("/api/auth/passwordless", { 
        email: email.toLowerCase().trim(), 
        code: otpCode.trim() 
      });

      const data = response.data;

      if (data.success) {
        // Populate system contexts using local parameters mapped in application layouts
        localStorage.setItem("userEmail", data.user.email);
        localStorage.setItem("userRole", data.user.role);
        localStorage.setItem("userFirstName", data.user.first_name);
        localStorage.setItem("userLastName", data.user.last_name);

        toast.success(`Bine ai venit, ${data.user.first_name || "Utilizator"}!`);
        
        // Native window relocation block ensuring middleware checks process cleanly
        setTimeout(() => {
          if (data.user.role === "ADMIN") {
            window.location.href = "/admin";
          } else if (data.user.role === "PROFESSOR") {
            window.location.href = "/profesor";
          } else {
            window.location.href = "/student";
          }
        }, 300);
      }
      
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const errorMsg = error.response?.data?.detail || "Cod incorect sau expirat.";
        
        // REDIRECT UNAUTHORIZED LOGINS DIRECTLY TO AUTH-ERROR SYSTEM PAGE (403 Forbidden)
        if (error.response?.status === 403) {
          toast.error("Acces interzis. Redirecționare...");
          setTimeout(() => {
            router.push(`/auth-error?message=${encodeURIComponent(errorMsg)}`);
          }, 1200);
          return;
        }

        toast.error(errorMsg);
      } else {
        toast.error("Eroare neprevăzută la validarea codului.");
      }
    } finally {
      setIsOtpLoading(false);
    }
  };

  const formatCountdown = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@usv.ro";

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-white flex flex-col font-sans selection:bg-blue-100">
      {/* HEADER */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 md:py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 shrink-0">
            <Calendar className="h-7 w-7 md:h-8 md:w-8 text-brand-blue" />
            <span className="text-xl font-bold text-black tracking-tight">
              {appName}
            </span>
          </div>
          
          <div className="flex gap-2 md:gap-4 items-center">
            <ProfessorAccessRequest />
            <Button 
              onClick={handleGoogleLogin} 
              disabled={isLoading || isOtpLoading}
              size="sm"
              className="bg-brand-blue hover:bg-brand-blue-dark active:scale-95 md:h-11 md:px-6 gap-2 text-xs md:text-base px-3 text-white font-medium transition-all shadow-sm"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="h-4 w-4 md:h-5 md:w-5" />
              )}
              <span className="hidden xs:inline">Autentificare Google</span>
              <span className="xs:hidden">Autentificare</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="grow flex flex-col items-center">
        {/* HERO SECTION */}
        <section className="container mx-auto px-4 pt-6 pb-4 md:pt-16 md:pb-8 max-w-4xl text-center">
          <div className="flex flex-col items-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-3xl md:text-5xl font-black text-slate-900">
                Aplicație web pentru gestionarea recuperărilor didactice 
              </h1>

              <p className="text-base md:text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium">
                O soluție unificată pentru planificarea, vizualizarea și gestionarea eficientă a activităților didactice și extra-curriculare.
              </p>
            </div>

            {/* --- CORE AUTHENTICATION HOUSING PANEL --- */}
            <div className="w-full max-w-md bg-white border border-slate-200 p-6 md:p-8 rounded-2xl shadow-xl shadow-blue-100/40 text-left mt-4 space-y-4">
              
              {/* Method A: Unified SSO Integration - Google Sign in */}
              <Button
                size="lg"
                onClick={handleGoogleLogin}
                disabled={isLoading || isOtpLoading}
                className="w-full bg-brand-blue hover:bg-brand-blue-dark h-12 text-base font-bold transition-all active:scale-95 text-white"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <LogIn className="mr-2 h-5 w-5" />
                )}
                Conectare cu Google
              </Button>

              {/* Graphical Visual Form Separator */}
              <div className="relative flex py-2 items-center">
                <div className="grow border-t border-slate-200"></div>
                <span className="shrink mx-4 text-xs text-slate-400 uppercase font-bold tracking-wider">sau cod de securitate</span>
                <div className="grow border-t border-slate-200"></div>
              </div>

              {/* Method B: Native Passwordless Magic TOTP Engine */}
              {authStep === "email" ? (
                <form onSubmit={handleSendOtp} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        type="email"
                        placeholder="nume.prenume@usv.ro / @student.usv.ro"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-9 h-10 border-slate-200"
                        disabled={isLoading || isOtpLoading}
                        required
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    variant="outline" 
                    className="w-full h-11 font-semibold border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors" 
                    disabled={isLoading || isOtpLoading}
                  >
                    {isOtpLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Se trimite codul...
                      </>
                    ) : (
                      "Solicită cod magic pe e-mail"
                    )}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-600">
                        Cod unic recepționat
                      </label>
                      <span className={`text-xs font-bold ${countdown < 60 ? "text-red-500 animate-pulse" : "text-slate-500"}`}>
                        Expiră în: {formatCountdown(countdown)}
                      </span>
                    </div>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        type="text"
                        placeholder="Introduceți codul din 6 cifre"
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                        className="pl-9 h-10 text-center tracking-[0.2em] font-mono font-bold border-slate-200 focus-visible:ring-brand-blue text-lg"
                        disabled={isLoading || isOtpLoading}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      className="w-1/3 h-11 text-xs text-slate-500 font-semibold" 
                      onClick={() => setAuthStep("email")}
                      disabled={isOtpLoading}
                    >
                      <ArrowLeft className="mr-1 h-3 w-3" /> Înapoi
                    </Button>
                    <Button 
                      type="submit" 
                      className="w-2/3 h-11 bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all" 
                      disabled={isLoading || isOtpLoading || countdown === 0}
                    >
                      {isOtpLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verificare...
                        </>
                      ) : (
                        "Verifică și intră"
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* FUNCTIONALITIES BY ROLES */}
        <section className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl mx-auto border-slate-100 py-8 items-stretch">
            {/* STUDENT */}
            <div className="group bg-white p-8 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-200 transition-all duration-300 flex flex-col space-y-4">
              <div className="flex items-center gap-2 text-brand-blue font-bold uppercase text-xs tracking-widest">
                Student
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-brand-blue shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Caută <strong className="text-slate-900">sloturi alternative</strong> de recuperare în cazul în care nu poți participa la activitatea programată inițial.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-brand-blue shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Vizualizează centralizat <strong className="text-slate-900">toate recuperările didactice</strong> planificate în cadrul facultății.
                  </p>
                </div>
              </div>
            </div>

            {/* PROFESSOR */}
            <div className="group bg-white p-8 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-200 transition-all duration-300 flex flex-col space-y-4">
              <div className="flex items-center gap-2 text-brand-blue font-bold uppercase text-xs tracking-widest">
                Profesor
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-brand-blue shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Planifică și gestionează <strong className="text-slate-900">recuperările pentru grupele</strong> la care predai, evitând suprapunerile.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-brand-blue shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Monitorizează orarul personal și <strong className="text-slate-900">evenimentele la care ești asociat</strong> în timp real.
                  </p>
                </div>
              </div>
            </div>

            {/* ADMIN */}
            <div className="group bg-white p-8 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-200 transition-all duration-300 flex flex-col space-y-4">
              <div className="flex items-center gap-2 text-brand-blue font-bold uppercase text-xs tracking-widest">
                Administrator
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-brand-blue shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Planifică și coordonează <strong className="text-slate-900">evenimente speciale</strong> și fluxul administrativ al facultății.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-brand-blue shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Gestionează utilizatorii, drepturile de acces și <strong className="text-slate-900">integritatea datelor</strong> din sistem.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CONTACT SECTION */}
        <section className="container mx-auto px-4 pb-16">
          <div className="max-w-4xl mx-auto pt-4">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="inline-flex items-center gap-2 text-brand-blue bg-blue-50 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                <Sparkles className="h-3 w-3" /> Solicitări speciale
              </div>
              
              <div className="max-w-2xl space-y-4">
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight">
                  Aveți nevoie de o planificare personalizată?
                </h2>
                <p className="text-slate-600 leading-relaxed text-base md:text-lg">
                  Pentru a planifica evenimente speciale, workshop-uri sau recuperări care necesită o configurare personalizată a resurselor, vă rugăm să trimiteți detaliile direct către administratorul sistemului prin email:
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <Mail className="h-5 w-5 text-brand-blue" />
                <a 
                  href={`mailto:${adminEmail}`}
                  className="text-brand-blue font-black text-lg md:text-xl hover:text-brand-blue-dark transition-colors underline underline-offset-8 decoration-2 decoration-blue-100 hover:decoration-brand-blue"
                >
                  {adminEmail}
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t bg-white py-10 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p className="text-slate-600 font-bold mb-1">
            © 2026 {appName} - Aplicație web pentru gestionarea recuperărilor didactice
          </p>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-semibold">
            Universitatea Ștefan cel Mare din Suceava
          </p>
        </div>
      </footer>
    </div>
  );
}