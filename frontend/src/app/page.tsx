"use client";

import { Button } from "@/components/ui/button";
import { Calendar, LogIn, Mail, CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import { ProfessorAccessRequest } from "@/components/ProfessorAccessRequest";

export default function Home() {
  /**
   * Triggers the Google OAuth flow via the backend endpoint
   */
  const handleGoogleLogin = () => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    window.location.href = `${backendUrl}/login`;
  };

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@usv.ro";

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-white flex flex-col font-sans selection:bg-blue-100">
      {/* HEADER - Rămâne banda de sus originală */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 md:py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 shrink-0">
            <Calendar className="h-7 w-7 md:h-8 md:w-8 text-brand-blue" />
            <span className="text-xl md:text-2xl font-bold text-black tracking-tight md:hidden">
              SGRD
            </span>
            <span className="hidden md:block text-xl md:text-xl font-semibold text-black tracking-tight">
              Sistem de gestionare a recuperărilor didactice
            </span>
          </div>
          
          <div className="flex gap-2 md:gap-4 items-center">
            <ProfessorAccessRequest />
            <Button 
              onClick={handleGoogleLogin} 
              size="sm"
              className="bg-brand-blue hover:bg-brand-blue-dark active:scale-95 md:h-11 md:px-6 gap-2 text-xs md:text-base px-3 text-white font-medium transition-all shadow-sm"
            >
              <LogIn className="h-4 w-4 md:h-5 md:w-5" />
              <span className="hidden xs:inline">Autentificare Google</span>
              <span className="xs:hidden">Autentificare</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="grow flex flex-col items-center">
        {/* HERO SECTION - Titlu cu numele complet al facultății */}
        <section className="container mx-auto px-4 pt-16 pb-12 md:pt-24 md:pb-16 max-w-5xl text-center space-y-10">
          <div className="space-y-6">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              Management digital pentru <br />
              <span className="text-brand-blue">Facultatea de Inginerie Electrică și Știința Calculatoarelor</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-500 max-w-3xl mx-auto leading-relaxed italic">
              O soluție unificată pentru planificarea, vizualizarea și gestionarea eficientă a activităților didactice și extra-curriculare.
            </p>
          </div>

          {/* DESCRIERE FUNCȚIONALITĂȚI REALE */}
          <div className="flex flex-col items-center space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-10 text-left w-full max-w-6xl border-y border-slate-100 py-12">
              {/* STUDENT */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-brand-blue font-bold uppercase text-xs tracking-widest">
                   Student
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-brand-blue shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-600">Caută <strong>sloturi alternative</strong> de recuperare în cazul în care nu poți participa la activitatea programată inițial.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-brand-blue shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-600">Vizualizează centralizat <strong>toate recuperările didactice</strong> planificate în cadrul facultății.</p>
                  </div>
                </div>
              </div>

              {/* PROFESOR */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-brand-blue font-bold uppercase text-xs tracking-widest">
                   Profesor
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-brand-blue shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-600">Planifică și gestionează <strong>recuperările pentru grupele</strong> la care predai, evitând suprapunerile.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-brand-blue shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-600">Monitorizează orarul personal și <strong>evenimentele la care ești asociat</strong> în timp real.</p>
                  </div>
                </div>
              </div>

              {/* ADMIN */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-brand-blue font-bold uppercase text-xs tracking-widest">
                   Administrator
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-brand-blue shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-600">Planifică și coordonează <strong>evenimente speciale</strong> și fluxul administrativ al facultății.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-brand-blue shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-600">Gestionează utilizatorii, drepturile de acces și <strong>integritatea datelor</strong> din sistem.</p>
                  </div>
                </div>
              </div>
            </div>

            <Button
              size="lg"
              onClick={handleGoogleLogin}
              className="bg-brand-blue hover:bg-brand-blue-dark h-14 px-12 text-base font-extrabold transition-all active:scale-95 shadow-lg shadow-blue-200/40 rounded-xl"
            >
              Intră în platformă <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>

        {/* SECȚIUNE DE INFORMARE EVENIMENTE - Design integrat (fără card separat) */}
        <section className="container mx-auto px-4 pb-24">
          <div className="max-w-4xl mx-auto border-t border-slate-100 pt-16">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="inline-flex items-center gap-2 text-brand-blue bg-blue-50 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                <Sparkles className="h-3 w-3" /> Solicitări Speciale
              </div>
              
              <div className="max-w-2xl space-y-4">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">
                  Aveți nevoie de o planificare personalizată?
                </h2>
                <p className="text-slate-600 leading-relaxed text-lg">
                  Pentru a planifica evenimente speciale, workshop-uri sau recuperări care necesită o configurare personalizată a resurselor, vă rugăm să trimiteți detaliile direct către administratorul sistemului prin email:
                </p>
              </div>

              <a 
                href={`mailto:${adminEmail}`}
                className="group flex items-center gap-3 text-brand-blue font-black text-xl md:text-2xl transition-all"
              >
                <div className="bg-white p-2 rounded-lg border border-slate-200 group-hover:border-brand-blue group-hover:bg-blue-50 transition-colors">
                  <Mail className="h-5 w-5" />
                </div>
                <span className="underline underline-offset-8 decoration-2 decoration-blue-200 group-hover:decoration-brand-blue">
                  {adminEmail}
                </span>
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-white py-10 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-slate-400 font-medium">
            © 2026 SGRD - Facultatea de Inginerie Electrică și Știința Calculatoarelor
          </p>
          <p className="text-xs text-slate-300 mt-1 uppercase tracking-widest">
            Universitatea Ștefan cel Mare din Suceava
          </p>
        </div>
      </footer>
    </div>
  );
}