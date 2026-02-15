"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import { toast } from "sonner";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("access_token");
    const role = searchParams.get("role")?.toUpperCase();
    const firstName = searchParams.get("firstName");
    const lastName = searchParams.get("lastName");
    const email = searchParams.get("email");

    if (token && role) {
      // 1. Salvare în Cookies (pentru API)
      Cookies.set("access_token", token, { expires: 7 });
      Cookies.set("user_role", role, { expires: 7 });

      localStorage.setItem("access_token", token);
      localStorage.setItem("userRole", role);
      localStorage.setItem("userEmail", email || "");
      localStorage.setItem("userFirstName", firstName ? decodeURIComponent(firstName).replace(/\+/g, ' ') : "");
      localStorage.setItem("userLastName", lastName ? decodeURIComponent(lastName).replace(/\+/g, ' ') : "");

      toast.success(`Bine ai venit, ${firstName || "Utilizator"}!`);
      
      // 3. Redirecționare
      const route = role === "ADMIN" ? "/admin" : role === "PROFESOR" ? "/profesor" : "/student";
      router.push(route);
    } else {
      router.push("/");
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="mt-4 text-gray-600 font-medium">Se finalizează autentificarea...</p>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={<div>Încărcare...</div>}>
      <AuthCallbackContent />
    </Suspense>
  );
}