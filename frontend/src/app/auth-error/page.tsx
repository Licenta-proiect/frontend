"use client";

import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { ProfessorAccessRequest } from "@/components/ProfessorAccessRequest";

function ErrorContent() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message") || "Nu aveți permisiunea de a accesa această aplicație.";

  // Adresa de email a administratorului din sistem
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-white flex items-center justify-center p-4 font-sans">
      <Card className="max-w-md w-full shadow-sm">
        <CardHeader className="text-center">
          <div className="mx-auto bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <ShieldAlert className="h-8 w-8 text-brand-red" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Acces refuzat</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600 font-medium leading-relaxed">
            {message}
          </p>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 text-sm text-gray-500 italic">
            Dacă sunteți cadru didactic și nu aveți o adresă de email înregistrată în orarul oficial, vă rugăm să utilizați butonul de mai jos pentru a solicita acces administratorului.
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          {/* Reutilizăm componenta existentă de solicitare acces */}
          <div className="w-full flex flex-col items-center gap-2">
             <ProfessorAccessRequest />
             
             {/* Container pentru text și link-ul de email */}
            {adminEmail && (
                <div className="text-sm text-gray-500 flex items-center gap-1 font-medium pt-2">
                <Mail className="h-3 w-3" />
                <span>Contact:</span>
                <a 
                    href={`mailto:${adminEmail}`} 
                    className="text-brand-blue hover:underline"
                >
                    {adminEmail}
                </a>
                </div>
            )}
            </div>
          
          <Button asChild variant="ghost" className="w-full text-gray-600 hover:text-brand-blue">
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Înapoi la pagina principală
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center italic text-gray-500">Se încarcă...</div>}>
      <ErrorContent />
    </Suspense>
  );
}