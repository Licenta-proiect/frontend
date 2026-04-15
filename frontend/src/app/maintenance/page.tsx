"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/services/api";
import { Hammer, RefreshCw, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

/**
 * MaintenancePage Component
 * Handles the UI and logic when the system is in maintenance mode.
 * Automatically redirects the user once the synchronization process finishes.
 */
export default function MaintenancePage() {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Polling function to check the system status on the backend
    const checkStatus = async () => {
      try {
        const response = await api.get("/admin/sync/status");
        
        // If the sync process is finished
        if (response.data.is_updating === false) {
          setIsRedirecting(true);
          toast.success("Actualizarea s-a terminat! Revenim la aplicație...");
          
          // Small delay so the user can read the success state
          setTimeout(() => {
            const lastRole = localStorage.getItem("userRole");
            // Logic to redirect based on the last known session role
            if (lastRole === "ADMIN") router.push("/admin?tab=sync");
            else if (lastRole === "PROFESSOR") router.push("/profesor");
            else router.push("/");
          }, 2000);
        }
      } catch (error) {
        // Errors are ignored here to prevent console noise during transient network drops
        console.error("Error checking maintenance status:", error);
      }
    };

    // Check every 5 seconds
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="bg-linear-to-br from-blue-50 to-white flex flex-col items-center justify-center min-h-screen px-4 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 w-full max-w-md space-y-6 text-center">
        
        {/* State Icon Container */}
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto relative ${isRedirecting ? 'bg-green-100' : 'bg-amber-100'}`}>
          {isRedirecting ? (
            // Static checkmark icon after completion
            <CheckCircle2 className="text-green-600 h-10 w-10" />
          ) : (
            <>
              <Hammer className="text-amber-600 h-10 w-10" />
              <RefreshCw className="absolute -right-1 -top-1 text-amber-500 h-6 w-6 animate-spin duration-3000" />
            </>
          )}
        </div>
        
        {/* Textual Information */}
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

        {/* Status Indicator (Bouncing dots) */}
        {!isRedirecting && (
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center justify-center gap-3">
            <div className="flex space-x-1">
              <span className="h-2 w-2 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="h-2 w-2 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="h-2 w-2 bg-amber-500 rounded-full animate-bounce"></span>
            </div>
            <span className="text-xs font-semibold text-slate-600 tracking-wider">
              Sincronizare în fundal...
            </span>
          </div>
        )}

        {/* Footer info */}
        <p className="text-[10px] text-slate-400 italic pt-4">
          Pagina se va reîmprospăta automat la finalizarea procesului.
        </p>
      </div>
    </div>
  );
}