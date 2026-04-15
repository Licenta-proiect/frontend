"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Hammer, RefreshCw, ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/services/api";
import { useEffect, useState } from "react";

/**
 * Component displayed when the backend is in maintenance mode (is_updating = true)
 */
export default function MaintenancePage() {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Function that checks if maintenance has finished
    const checkStatus = async () => {
      try {
        const response = await api.get("/admin/sync/status");
        
        if (response.data.is_updating === false) {
          setIsRedirecting(true);
          toast.success("Actualizarea s-a terminat! Revenim la aplicație...");
          
          // Wait a bit for the user to see the success message
          setTimeout(() => {
            // We try to return to the previous page or dashboard
            const lastRole = localStorage.getItem("userRole");
            if (lastRole === "ADMIN") router.push("/admin?tab=sync");
            else if (lastRole === "PROFESSOR") router.push("/profesor");
            else router.push("/");
          }, 2000);
        }
      } catch (error) {
        console.error("Eroare la verificarea statusului:", error);
      }
    };

    // We check every 5 seconds
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="bg-linear-to-br from-blue-50 to-white flex flex-col items-center justify-center min-h-screen px-4 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 w-full max-w-md space-y-6 text-center">
        
        <div className="bg-amber-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto relative">
          {isRedirecting ? (
            <CheckCircle2 className="text-green-600 h-10 w-10 animate-bounce" />
          ) : (
            <>
              <Hammer className="text-amber-600 h-10 w-10" />
              <RefreshCw className="absolute -right-1 -top-1 text-amber-500 h-6 w-6 animate-spin duration-3000" />
            </>
          )}
        </div>
        
        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {isRedirecting ? "Actualizare finalizată" : "Sistem în curs de actualizare"}
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed">
            {isRedirecting 
              ? "Toate datele au fost sincronizate cu succes. Vă redirecționăm imediat..." 
              : "Momentan sincronizăm datele cu orarul oficial al facultății. Anumite funcționalități sunt suspendate pentru a asigura integritatea datelor."}
          </p>
        </div>

        {!isRedirecting && (
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center justify-center gap-3">
            <div className="flex space-x-1">
              <span className="h-2 w-2 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="h-2 w-2 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="h-2 w-2 bg-amber-500 rounded-full animate-bounce"></span>
            </div>
            <span className="text-xs font-semibold text-slate-600 tracking-wider">
              Verificăm starea sistemului...
            </span>
          </div>
        )}

        <div className="pt-4 space-y-3">
          <Button 
            onClick={() => window.location.reload()} 
            disabled={isRedirecting}
            className="w-full bg-brand-blue hover:bg-brand-blue-dark h-14 text-lg font-semibold shadow-md transition-all active:scale-95"
          >
            <RefreshCw className={`mr-2 h-5 w-5 ${isRedirecting ? '' : 'animate-spin'}`} />
            Reîncearcă accesul
          </Button>

          <Button 
            variant="ghost"
            onClick={() => router.push("/")} 
            className="w-full text-slate-500 hover:text-brand-blue h-10 text-sm"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Înapoi la pagina principală
          </Button>
        </div>

        <p className="text-[10px] text-slate-400 italic">
          Această procedură poate dura câteva minute. Pagina se va reîmprospăta automat.
        </p>
      </div>
    </div>
  );
}