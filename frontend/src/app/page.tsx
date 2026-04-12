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
        {/* HERO SECTION - Minimalist și Modern */}
        <section className="container mx-auto px-4 pt-16 pb-12 md:pt-28 md:pb-20 max-w-4xl text-center space-y-10">
          <div className="space-y-6">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              Management digital pentru <br />
              <span className="text-brand-blue">activitățile didactice FIESC</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
              O soluție unificată pentru planificarea și vizualizarea recuperărilor, dezvoltată pentru a elimina erorile de programare și suprapunerile de orar.
            </p>
          </div>

          {/* CE FACE APLICAȚIA - Prezentare directă */}
          <div className="flex flex-col items-center space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 text-left w-full max-w-3xl">
              <div className="flex items-start gap-3">
                <div className="mt-1 bg-blue-50 p-1 rounded-full"><CheckCircle2 className="h-5 w-5 text-brand-blue" /></div>
                <div>
                  <p className="font-bold text-slate-800">Programarea recuperărilor</p>
                  <p className="text-sm text-slate-500">Identifică sloturile libere și rezervă săli în timp real.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 bg-blue-50 p-1 rounded-full"><CheckCircle2 className="h-5 w-5 text-brand-blue" /></div>
                <div>
                  <p className="font-bold text-slate-800">Mediu unificat de vizualizare</p>
                  <p className="text-sm text-slate-500">Toate modificările de orar centralizate într-un singur loc.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 bg-blue-50 p-1 rounded-full"><CheckCircle2 className="h-5 w-5 text-brand-blue" /></div>
                <div>
                  <p className="font-bold text-slate-800">Gestionarea resurselor</p>
                  <p className="text-sm text-slate-500">Sincronizare completă cu materiile și grupele alocate.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 bg-blue-50 p-1 rounded-full"><CheckCircle2 className="h-5 w-5 text-brand-blue" /></div>
                <div>
                  <p className="font-bold text-slate-800">Planificare evenimente</p>
                  <p className="text-sm text-slate-500">Suport pentru conferințe, workshop-uri sau sesiuni speciale.</p>
                </div>
              </div>
            </div>

            <Button
              size="lg"
              onClick={handleGoogleLogin}
              className="bg-brand-blue hover:bg-brand-blue-dark h-14 px-12 text-lg font-bold transition-all active:scale-95 shadow-xl shadow-blue-200/50 rounded-2xl"
            >
              Intră în platformă <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>

        {/* SECȚIUNE DE INFORMARE EVENIMENTE - Rafinată și Sugestivă */}
        <section className="container mx-auto px-4 pb-24">
          <div className="max-w-4xl mx-auto border-t border-slate-100 pt-16">
            <div className="bg-slate-50/50 rounded-[2rem] p-8 md:p-12 border border-slate-100/80">
              <div className="flex flex-col md:flex-row gap-10 items-center">
                <div className="space-y-4 flex-1">
                  <div className="inline-flex items-center gap-2 text-brand-blue bg-blue-50 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="h-3 w-3" /> Solicitări Speciale
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">
                    Aveți nevoie de o planificare personalizată?
                  </h2>
                  <p className="text-slate-600 leading-relaxed">
                    Pentru a planifica evenimente speciale, workshop-uri sau recuperări care necesită o configurare personalizată a resurselor, vă rugăm să trimiteți detaliile direct către administratorul sistemului.
                  </p>
                </div>
                
                <div className="shrink-0 w-full md:w-auto">
                  <a 
                    href={`mailto:${adminEmail}`}
                    className="flex flex-col items-center gap-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-brand-blue hover:shadow-md transition-all group"
                  >
                    <div className="bg-blue-50 p-3 rounded-xl group-hover:bg-brand-blue transition-colors">
                      <Mail className="h-6 w-6 text-brand-blue group-hover:text-white" />
                    </div>
                    <span className="font-bold text-slate-900">{adminEmail}</span>
                    <span className="text-xs text-slate-400 font-medium">Click pentru a trimite email</span>
                  </a>
                </div>
              </div>
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