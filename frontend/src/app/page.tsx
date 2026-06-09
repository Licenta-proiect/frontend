"use client";

import { Button } from "@/components/ui/button";
import { Calendar, LogIn, CheckCircle2, Sparkles, Mail } from "lucide-react"; 
import { ProfessorAccessRequest } from "@/components/ProfessorAccessRequest";
import { useRouter } from "next/navigation";

/**
 * Landing Page Component
 * Handles user introduction to the platform and dual-method authentication.
 */
export default function Home() {
  const router = useRouter();
  const appName = process.env.NEXT_PUBLIC_APP_TITLE;
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
              onClick={() => router.push("/login")} 
              size="sm"
              className="bg-brand-blue hover:bg-brand-blue-dark active:scale-95 md:h-11 md:px-6 gap-2 text-xs md:text-base px-3 text-white font-medium transition-all shadow-sm"
            >
              <LogIn className="h-4 w-4 md:h-5 md:w-5" />
              <span className="hidden xs:inline">Autentificare</span>
              <span className="xs:hidden">Intră</span>
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

            <Button
              size="lg"
              onClick={() => router.push("/login")}
              className="h-12 md:h-12 px-8 md:px-12 bg-brand-blue hover:bg-brand-blue-dark text-base font-bold transition-all active:scale-95 text-white shadow-md shadow-blue-200/50"
            >
              Accesează platforma
            </Button>
            
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