"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/services/api";
import axios from "axios";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { ShieldCheck, Loader2, Timer, LogIn, Mail, KeyRound, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOtpLoading, setIsOtpLoading] = useState<boolean>(false);

  // --- PASSWORDLESS AUTHENTICATION STATES ---
  const [email, setEmail] = useState<string>("");
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
   */
  const handleGoogleLogin = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await api.get("/admin/sync/status");

      if (response.data.is_updating) {
        window.location.href = "/maintenance";
        return;
      }

      const backendUrl = process.env.NEXT_PUBLIC_API_URL;
      window.location.href = `${backendUrl}/login`;
      
    } catch (error: unknown) {
      setIsLoading(false);
      if (axios.isAxiosError(error) && error.response?.status === 503) {
        return; // Interceptor handles 503
      }
      toast.error("Eroare la conectarea cu Google.");
    }
  };

  // --- PASSWORDLESS AUTHENTICATION METHOD ---

  /**
   * Phase 1: Request Magic Code via Email
   */
  const handleSendOtp = async (e: React.SyntheticEvent): Promise<void> => {
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

      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/passwordless/request`, { 
        email: email.toLowerCase().trim() 
      });

      toast.success("Codul de verificare a fost trimis cu succes pe e-mail!");
      setAuthStep("code");
      setCountdown(300); 
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const errorMsg = error.response?.data?.detail || "Eroare la solicitarea codului.";
        
        if (error.response?.status === 403) {
          toast.error(`Acces interzis: ${errorMsg}`, { duration: 7000 });
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
  const handleVerifyOtp = async (e: React.SyntheticEvent): Promise<void> => {
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
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/passwordless/verify`, { 
        email: email.toLowerCase().trim(), 
        code: otpCode.trim() 
      });

      const data = response.data;

      // Set session context across cookies and localStorage natively without internal route middleware drops
      Cookies.set("access_token", data.access_token, { expires: 7 });
      Cookies.set("user_role", data.user.role, { expires: 7 });

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("userRole", data.user.role);
      localStorage.setItem("userEmail", data.user.email);
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
      
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const errorMsg = error.response?.data?.detail || "Cod incorect sau expirat.";
        
        if (error.response?.status === 403) {
          toast.error(`Acces interzis: ${errorMsg}`, { duration: 7000 });
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

  return (
    <div className="bg-linear-to-br from-blue-50 to-white flex flex-col items-center justify-center min-h-screen px-4 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 w-full max-w-md space-y-6 text-center">
        
        {authStep === "email" ? (
          <>
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
              <LogIn className="text-brand-blue h-7 w-7" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-slate-900">Acces platformă</h1>
              <p className="text-slate-500 text-sm">Alegeți modalitatea de conectare securizată</p>
            </div>

            {/* Method A: Unified Google SSO */}
            <Button
              size="lg"
              onClick={handleGoogleLogin}
              disabled={isLoading || isOtpLoading}
              className="w-full bg-brand-blue hover:bg-brand-blue-dark h-14 text-lg font-semibold transition-all active:scale-95 text-white"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <LogIn className="mr-2 h-5 w-5" />
              )}
              Conectare cu Google
            </Button>

            {/* Visual Form Separator */}
            <div className="relative flex py-2 items-center">
              <div className="grow border-t border-slate-200"></div>
              <span className="shrink mx-4 text-xs text-slate-400 uppercase font-bold tracking-wider">sau fără parolă</span>
              <div className="grow border-t border-slate-200"></div>
            </div>

            {/* Method B: Passwordless Magic Code */}
            <form onSubmit={handleSendOtp} className="space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 px-0.5">
                  Email instituțional
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <Input
                    type="email"
                    placeholder="nume.prenume@usv.ro"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 border-slate-200 focus-visible:ring-brand-blue bg-white"
                    disabled={isLoading || isOtpLoading}
                    required
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                variant="outline" 
                className="w-full h-14 text-lg font-semibold border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors" 
                disabled={isLoading || isOtpLoading}
              >
                {isOtpLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Se trimite codul...
                  </>
                ) : (
                  "Trimite codul de conectare"
                )}
              </Button>
            </form>
          </>
        ) : (
          <>
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <ShieldCheck className="text-brand-blue h-8 w-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-slate-900">Verificare securitate</h1>
              <p className="text-slate-500 text-sm">Codul unic a fost transmis pe adresa de email.</p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="space-y-4 text-left">
                <div className="relative">
                  <KeyRound className="absolute left-4 top-6 h-4 w-4 text-slate-400 z-10" />
                  <Input
                    type="text"
                    placeholder="000000"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    className="text-center text-xl font-mono h-16 tracking-[0.5em] border-slate-200 focus-visible:ring-brand-blue bg-white pl-10"
                    disabled={isLoading || isOtpLoading}
                    required
                  />
                </div>
                
                <div className="flex justify-center">
                  <div className={`w-full flex items-center gap-2 text-sm font-medium px-6 py-2 rounded-lg border justify-center transition-all duration-300
                      ${countdown < 60 ? 
                      'text-red-600 bg-red-50 border-red-100 animate-pulse' : 
                      'text-brand-blue bg-blue-50 border-blue-100'}`}>
                    <Timer className="h-4 w-4" />
                    <span>Expiră în: {formatCountdown(countdown)}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2.5 pt-1">
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-1/3 h-14 text-sm text-slate-500 font-semibold rounded-lg hover:bg-slate-50" 
                  onClick={() => setAuthStep("email")}
                  disabled={isOtpLoading}
                >
                  <ArrowLeft className="mr-1 h-3 w-3" /> Înapoi
                </Button>
                <Button 
                  type="submit" 
                  className="w-2/3 h-14 bg-brand-blue hover:bg-brand-blue-dark text-white font-semibold transition-all" 
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
          </>
        )}
      </div>
    </div>
  );
}