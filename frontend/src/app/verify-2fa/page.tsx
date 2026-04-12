"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { ShieldCheck, Loader2 } from "lucide-react";

function Verify2FAContent() {
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const tempToken = searchParams.get("temp_token");

  const handleVerify = async () => {
    if (code.length < 6) {
      toast.error("Introduceți codul complet de 6 cifre");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post("/auth/verify-2fa", {
        temp_token: tempToken,
        code: code
      });

      const { access_token, role, firstName, lastName, email } = res.data;

      // Sincronizare cu restul aplicației
      Cookies.set("access_token", access_token, { expires: 7 });
      Cookies.set("user_role", role, { expires: 7 });
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("userRole", role);
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userFirstName", firstName);
      localStorage.setItem("userLastName", lastName);

      toast.success("Autentificare reușită!");
      router.push(role === "ADMIN" ? "/admin" : "/profesor");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Cod invalid");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 px-4 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 w-full max-w-md space-y-6 text-center">
        <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
          <ShieldCheck className="text-brand-blue h-8 w-8" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">Verificare Securitate</h1>
          <p className="text-slate-500 text-sm">
            Am trimis un cod de 6 cifre pe adresa dvs. de email. Introduceți-l mai jos pentru a continua.
          </p>
        </div>

        <Input 
          value={code} 
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} 
          placeholder="000000" 
          className="text-center text-3xl font-mono tracking-[0.5em] h-16 border-slate-200 focus:ring-brand-blue"
        />

        <Button 
          onClick={handleVerify} 
          disabled={isSubmitting}
          className="w-full bg-brand-blue hover:bg-brand-blue-dark h-12 text-lg font-semibold"
        >
          {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : null}
          Verifică și Conectează-te
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