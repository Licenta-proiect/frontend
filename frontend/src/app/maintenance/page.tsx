"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Hammer, RefreshCw, ArrowLeft } from "lucide-react";

/**
 * Component displayed when the backend is in maintenance mode (is_updating = true)
 */
export default function MaintenancePage() {
  const router = useRouter();

  return (
    <div className="bg-linear-to-br from-blue-50 to-white flex flex-col items-center justify-center min-h-screen px-4 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 w-full max-w-md space-y-6 text-center">
        
        {/* Iconița cu animație de rotație/pulsare */}
        <div className="bg-amber-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto relative">
          <Hammer className="text-amber-600 h-10 w-10" />
          <RefreshCw className="absolute -right-1 -top-1 text-amber-500 h-6 w-6 animate-spin duration-3000" />
        </div>
        
        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">
            Sistem în curs de actualizare
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed">
            Momentan sincronizăm datele cu orarul oficial al facultății. 
            Anumite funcționalități (rezervări, căutări, autentificare) sunt suspendate pentru a asigura integritatea datelor.
          </p>
        </div>

        {/* Status Indicator */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center justify-center gap-3">
          <div className="flex space-x-1">
            <span className="h-2 w-2 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="h-2 w-2 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span className="h-2 w-2 bg-amber-500 rounded-full animate-bounce"></span>
          </div>
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
            Sincronizare în desfășurare...
          </span>
        </div>

        <div className="pt-4 space-y-3">
          <Button 
            onClick={() => window.location.reload()} 
            className="w-full bg-brand-blue hover:bg-brand-blue-dark h-14 text-lg font-semibold shadow-md transition-all active:scale-95"
          >
            <RefreshCw className="mr-2 h-5 w-5" />
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
          Această procedură durează de obicei între 1 și 3 minute.
        </p>
      </div>
    </div>
  );
}