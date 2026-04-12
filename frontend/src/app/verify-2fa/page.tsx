"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { ShieldCheck, Loader2, AlertCircle } from "lucide-react";

/**
 * Component for handling the Two-Factor Authentication verification logic.
 * Uses a temporary token from the URL to validate the OTP code sent via email.
 */
function Verify2FAContent() {
  const [otpCode, setOtpCode] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState(3);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const tempToken = searchParams.get("temp_token");

  const handleVerification = async () => {
    if (otpCode.length < 6) {
      toast.error("Introduceți codul complet de 6 cifre");
      return;
    }

    setIsPending(true);
    try {
      // API call to verify the OTP code using the temporary session token
      const response = await api.post("/auth/verify-2fa", {
        temp_token: tempToken,
        code: otpCode
      });

      const { access_token, role, firstName, lastName, email } = response.data;

      // Persist authentication data in Cookies and LocalStorage
      Cookies.set("access_token", access_token, { expires: 7 });
      Cookies.set("user_role", role, { expires: 7 });
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("userRole", role);
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userFirstName", firstName);
      localStorage.setItem("userLastName", lastName);

      toast.success("Autentificare reușită!");
      
      // Navigate to the appropriate dashboard based on user role
      const destination = role === "ADMIN" ? "/admin" : "/profesor";
      router.push(destination);
    } catch {
      const updatedAttempts = remainingAttempts - 1;
      setRemainingAttempts(updatedAttempts);
      setOtpCode(""); // Reset input on failure

      if (updatedAttempts <= 0) {
        toast.error("Prea multe încercări eșuate. Veți fi redirecționat la pagina principală.");
        // Delay redirection to allow the user to read the error message
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } else {
        toast.error(`Cod invalid. Mai aveți ${updatedAttempts} ${updatedAttempts === 1 ? 'încercare' : 'încercări'}.`);
      }
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="bg-linear-to-br from-blue-50 to-white flex flex-col items-center justify-center min-h-screen px-4 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 w-full max-w-md space-y-6 text-center">
        <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
          <ShieldCheck className="text-brand-blue h-8 w-8" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">Verificare securitate</h1>
          <p className="text-slate-500 text-sm">
            Am trimis un cod de 6 cifre pe adresa dvs. de email. Introduceți-l mai jos pentru a continua.
          </p>
        </div>

        <div className="space-y-4">
          <Input 
            value={otpCode} 
            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))} 
            placeholder="000000" 
            disabled={remainingAttempts <= 0}
            className="text-center text-2xl md:text-2xl font-mono h-16 tracking-[0.5em] border-slate-200 focus:ring-brand-blue bg-white"
            />
          
          <div className="flex items-center justify-center gap-2 text-sm font-medium text-amber-600 bg-amber-50 py-2 rounded-lg border border-amber-100">
            <AlertCircle className="h-4 w-4" />
            <span>Încercări rămase: {remainingAttempts}</span>
          </div>
        </div>

        <Button 
          onClick={handleVerification} 
          disabled={isPending || remainingAttempts <= 0}
          className="w-full bg-brand-blue hover:bg-brand-blue-dark h-12 text-md font-semibold"
        >
          {isPending ? <Loader2 className="animate-spin mr-2" /> : null}
          Verifică și conectează-te
        </Button>
      </div>
    </div>
  );
}

export default function Verify2FA() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Încărcare...</div>}>
      <Verify2FAContent />
    </Suspense>
  );
}