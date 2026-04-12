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
      {/* HEADER - Păstrat neschimbat */}
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
        {/* HERO SECTION - Titlu redimensionat la 2xl/4xl (mai mic și elegant) */}
        <section className="container mx-auto px-4 pt-16 pb-12 md:pt-24 md:pb-16 max-w-5xl text-center space-y-10">
          <div className="space-y-6">
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Management digital pentru <br />
              <span className="text-brand-blue">Facultatea de Inginerie Electrică și Știința Calculatoarelor</span>
            </h1>
            
            <p className="text-base md:text-lg text-slate-500 max-w-3xl mx-auto leading-relaxed italic">
              O soluție unificată pentru planificarea, vizualizarea și gestionarea eficientă a activităților didactice și extra-curriculare.
            </p>
          </div>

          {/* DESCRIERE FUNCȚIONALITĂȚI REALE - Păstrate conform cerinței */}
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

        {/* SECȚIUNE DE INFORMARE EVENIMENTE - Design natural, fără chenar la iconiță */}
        <section className="container mx-auto px-4 pb-24">
          <div className="max-w-4xl mx-auto border-t border-slate-100 pt-16">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="inline-flex items-center gap-2 text-brand-blue bg-blue-50 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                <Sparkles className="h-3 w-3" /> Solicitări Speciale
              </div>
              
              <div className="max-w-2xl space-y-4">
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight">
                  Aveți nevoie de o planificare personalizată?
                </h2>
                <p className="text-slate-600 leading-relaxed text-base md:text-lg">
                  Pentru a planifica evenimente speciale, workshop-uri sau recuperări care necesită o configurare personalizată a resurselor, vă rugăm să trimiteți detaliile direct către administratorul sistemului:
                </p>
              </div>

              {/* Email link cu iconiță integrată natural */}
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
      <footer className="border-t bg-slate-50/80 py-12 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p className="text-slate-600 font-bold mb-1">
            © 2026 SGRD - Sistem de gestionare a recuperărilor didactice
          </p>
          <p className="text-sm text-slate-400 font-medium">
            Facultatea de Inginerie Electrică și Știința Calculatoarelor
          </p>
          <div className="h-px w-12 bg-slate-200 mx-auto my-4" />
          <p className="text-[10px] text-slate-400 uppercase tracking-[0.3em] font-semibold">
            Universitatea Ștefan cel Mare din Suceava
          </p>
        </div>
      </footer>
    </div>
  );
}