"use client";

import { useState, Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { ShieldCheck, Loader2, Timer } from "lucide-react";
import { jwtDecode, JwtPayload } from "jwt-decode";

// Definim structura token-ului pentru a evita eroarea "any"
interface CustomJwtPayload extends JwtPayload {
  iat_2fa: number;
  pending_2fa?: boolean;
}

function Verify2FAContent() {
  const [otpCode, setOtpCode] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState(3);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  
  const hasNotifiedExpiration = useRef(false);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const tempToken = searchParams.get("temp_token");

  useEffect(() => {
    if (!tempToken) return;

    try {
      // Folosim interfața definită în loc de any
      const decoded = jwtDecode<CustomJwtPayload>(tempToken);
      const issuedAt = decoded.iat_2fa * 1000; 
      const expiresAt = issuedAt + (5 * 60 * 1000); 

      const updateTimer = () => {
        const now = new Date().getTime();
        const difference = expiresAt - now;
        
        if (difference <= 0) {
          setTimeLeft(0);
          // Declanșează toast-ul de expirare o singură dată
          if (!hasNotifiedExpiration.current) {
            toast.error("Codul de verificare a expirat. Te rugăm să te autentifici din nou.");
            hasNotifiedExpiration.current = true;
          }
          return;
        }
        setTimeLeft(Math.floor(difference / 1000));
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    } catch (e) {
      console.error("Token invalid", e);
    }
  }, [tempToken]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleVerification = async () => {
    if (otpCode.length < 6) {
      toast.error("Introduceți codul complet de 6 cifre");
      return;
    }

    setIsPending(true);
    try {
      const response = await api.post("/auth/verify-2fa", {
        temp_token: tempToken,
        code: otpCode
      });

      const { access_token, role, firstName, lastName, email } = response.data;

      Cookies.set("access_token", access_token, { expires: 7 });
      Cookies.set("user_role", role, { expires: 7 });
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("userRole", role);
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userFirstName", firstName);
      localStorage.setItem("userLastName", lastName);

      toast.success("Autentificare reușită!");
      const destination = role === "ADMIN" ? "/admin" : "/profesor";
      router.push(destination);
    } catch (error: unknown) {
      // Tratăm eroarea ca fiind de tip Axios pentru a accesa proprietățile de răspuns
      const axiosError = error as { response?: { data?: { detail?: string } } };
      const backendMessage = axiosError.response?.data?.detail || "Cod invalid";
      
      const updatedAttempts = remainingAttempts - 1;
      setRemainingAttempts(updatedAttempts);
      setOtpCode("");

      if (updatedAttempts <= 0) {
        toast.error("Prea multe încercări eșuate. Veți fi redirecționat.");
        setTimeout(() => router.push("/"), 2000);
      } else {
        toast.error(`Mai aveți ${updatedAttempts} încercări.`);
        console.log(backendMessage);
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
          <p className="text-slate-500 text-sm">Codul a fost trimis pe email.</p>
        </div>

        <div className="space-y-4">
          <Input 
            value={otpCode} 
            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))} 
            placeholder="000000" 
            disabled={remainingAttempts <= 0 || timeLeft === 0}
            className="text-center text-xl md:text-xl font-mono h-16 tracking-[0.5em] border-slate-200 focus:ring-brand-blue bg-white"
            />
          
          <div className="flex justify-center">
            <div className={`w-full flex items-center gap-2 text-sm font-medium px-6 py-2 rounded-lg border justify-center 
                ${timeLeft !== null && timeLeft < 60 ? 
                'text-red-600 bg-red-50 border-red-100' : 
                'text-blue-600 bg-blue-50 border-blue-100'}`}>
              <Timer className="h-4 w-4" />
              <span>{timeLeft !== null ? formatTime(timeLeft) : "--:--"}</span>
            </div>
          </div>
        </div>

        <Button 
          onClick={handleVerification} 
          disabled={isPending || remainingAttempts <= 0 || timeLeft === 0}
          className="w-full bg-brand-blue hover:bg-brand-blue-dark h-14 text-lg font-semibold"
        >
          {isPending ? <Loader2 className="animate-spin mr-2" /> : null}
          {timeLeft === 0 ? "Cod expirat" : "Verifică și conectează-te"}
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