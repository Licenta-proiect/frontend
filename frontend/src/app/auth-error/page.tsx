"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { ProfessorAccessRequest } from "@/components/ProfessorAccessRequest";

/**
 * Component that displays the error message and access request options
 * when a user is denied entry to the application.
 */
function ErrorContent() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message") || "Nu aveți permisiunea de a accesa această aplicație.";

  // Retrieve the support email from environment variables
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-white flex flex-col items-center justify-center p-4 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 w-full max-w-md space-y-6 text-center">
        {/* Visual Indicator - Red Shield Alert */}
        <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
          <ShieldAlert className="h-8 w-8 text-red-600" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">Acces refuzat</h1>
          <p className="text-slate-600 font-medium leading-relaxed">
            {message}
          </p>
        </div>

        {/* Helpful information box for teachers */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-500 italic leading-snug">
          Dacă sunteți cadru didactic și nu aveți o adresă de email înregistrată în orarul oficial, vă rugăm să solicitați acces mai jos.
        </div>

        <div className="space-y-4">
          {/* Action: Trigger access request form */}
          <div className="w-full">
            <ProfessorAccessRequest />
          </div>

          {/* Secondary Action: Direct email contact */}
          {adminEmail && (
            <div className="flex items-center justify-center gap-2 text-sm font-medium text-slate-500 pt-2">
              <Mail className="h-4 w-4" />
              <span>Contact:</span>
              <a 
                href={`mailto:${adminEmail}`} 
                className="text-brand-blue hover:underline font-semibold"
              >
                {adminEmail}
              </a>
            </div>
          )}
        </div>

        {/* Navigation: Return to Landing Page */}
        <Button asChild variant="ghost" className="w-full h-12 text-slate-600 hover:text-brand-blue hover:bg-slate-50 font-semibold transition-colors">
          <Link href="/" className="flex items-center justify-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Înapoi la pagina principală
          </Link>
        </Button>
      </div>
    </div>
  );
}

/**
 * Main Page Component wrapped in Suspense to handle useSearchParams hooks
 * during client-side navigation.
 */
export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center italic text-slate-500">Se încarcă...</div>}>
      <ErrorContent />
    </Suspense>
  );
}