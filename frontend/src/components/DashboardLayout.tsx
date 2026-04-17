"use client";

import { ReactNode, useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, LogOut, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import { toast } from "sonner";
import Cookies from "js-cookie";
import api from "@/services/api";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface DashboardLayoutProps {
  children: ReactNode;
  userRole: "student" | "professor" | "admin";
  userName: string;
  userEmail: string;
  activeTab?: string;
  tabs: { id: string; label: string; icon: ReactNode }[];
}

export default function DashboardLayout({ children, userRole, userName, userEmail, activeTab, tabs }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sheetOpen, setSheetOpen] = useState(false);
  const isVerifying = useRef(false);
  const hasErrorShown = useRef(false);
  
  /**
   * Handles the logout process by calling the backend /auth/logout
   * and clearing local state/cookies.
   */
  const handleLogout = useCallback(async (silent = false) => {
    try {
      await api.get("/logout");
    } catch (err) {
      console.log("Backend logout failed:", err);
    } finally {
      localStorage.clear();
      Cookies.remove("access_token");
      Cookies.remove("user_role");

      if (!silent && !hasErrorShown.current) {
        toast.success("Deconectare reușită!");
        setTimeout(() => { window.location.href = "/"; }, 2500);
      } else {
        window.location.href = "/";
      }
    }
  }, []);

  useEffect(() => {
    // Fast local check for tokens and basic user data
    const token = Cookies.get("access_token");
    const userFirstName = localStorage.getItem("userFirstName");
    
    if (!token || !userFirstName) {
      localStorage.clear();
      Cookies.remove("access_token");
      router.push("/");
      return;
    }

    /**
     * Server-side identity verification (Who Am I)
     * This forces the backend to verify if the session is still valid
     * and if the user still exists in the Database.
     */
    const verifyAuth = async () => {
      if (isVerifying.current) return;
      isVerifying.current = true;

      try {
        const response = await api.get("/me");
        const serverRole = response.data.role.toUpperCase();
        const expectedRole = userRole.toUpperCase();

        // SECURITY CHECK: If the server role doesn't match the UI role, force logout
        if (serverRole && serverRole !== expectedRole) {
          if (!hasErrorShown.current) {
            hasErrorShown.current = true; 
            console.log("Conflict de roluri detectat!");
            toast.error("Acces neautorizat: Rol invalid.");
            handleLogout(true); 
          }
        }
      } catch {
        // Interceptor handles 401/403, but we log for safety
        console.log("Session verification failed.");
      } finally {
        isVerifying.current = false;
      }
    };

    verifyAuth();
  }, [router, userRole, handleLogout]);

  const getRoleName = (role: string) => {
    const roles = { student: "Student", professor: "Profesor", admin: "Administrator" };
    return roles[role as keyof typeof roles] || role;
  };

  const getInitials = (name: string) => {
    return name.split(" ").filter(Boolean).map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const activeTabLabel = tabs.find(tab => tab.id === activeTab)?.label || "";

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-white font-sans">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="container mx-auto px-4 py-3 md:py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9 md:h-11 md:w-11 hover:text-brand-blue hover:border-brand-blue hover:bg-gray-100 text-black border-gray-200">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 font-sans">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2 text-brand-blue font-bold">
                    <Calendar className="h-6 w-6" /> Sistem de gestionare a recuperărilor didactice
                  </SheetTitle>
                  <SheetDescription className="sr-only">
                    Meniu de navigare pentru Sistemul de gestionare a recuperărilor.
                  </SheetDescription>
                </SheetHeader>
                <nav className="space-y-2 mt-6">
                  {tabs.map((tab) => (
                    <Link
                      key={tab.id}
                      href={`${pathname}?tab=${tab.id}`}
                      onClick={() => setSheetOpen(false)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium ${
                        activeTab === tab.id 
                          ? "bg-brand-blue text-white shadow-md" 
                          : "text-black hover:bg-gray-100 hover:text-brand-blue"
                      }`}
                    >
                      {tab.icon} <span>{tab.label}</span>
                    </Link>
                ))}
                  <div className="pt-4 mt-4 border-t">
                    <button 
                      onClick={() => handleLogout(false)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-black hover:bg-gray-100 hover:text-brand-blue active:scale-95 font-medium transition-colors"
                    >
                      <LogOut className="h-5 w-5" /> <span>Deconectare</span>
                    </button>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
            
            <div className="flex items-center gap-2 shrink-0">
              <Calendar className="h-7 w-7 md:h-9 md:w-9 text-brand-blue shrink-0" />
              <div className="flex flex-col justify-center">
                {/* Short Version: Visible on mobile, hidden from 'md' up */}
                <span className="text-xl md:text-2xl font-bold text-black tracking-tight leading-none md:hidden">
                  SGRD
                </span>
                
                {/* Long Version: Hidden on mobile, visible from 'md' up */}
                <span className="hidden md:block text-xl md:text-xl font-semibold text-black tracking-tight leading-none">
                  Sistem de gestionare a recuperărilor didactice
                </span>
                <span className="text-sm md:text-xs font-semibold text-brand-blue tracking-tight leading-none mt-1">
                  {activeTabLabel} 
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative gap-3 hover:bg-gray-100 active:scale-95 transition-all px-2 md:px-4 md:h-11 group">
                  <Avatar className="h-8 w-8 border border-blue-200 shadow-sm group-hover:border-brand-blue">
                    <AvatarFallback className="bg-brand-blue text-white font-bold text-xs">
                      {getInitials(userName || "U")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left hidden md:block leading-tight">
                    <div className="text-sm font-semibold text-black group-hover:text-brand-blue">{userName}</div>
                    <div className="text-xs text-gray-500 font-semibold">{getRoleName(userRole)}</div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-2 shadow-2xl border-gray-100 font-sans">
                <DropdownMenuLabel className="font-normal p-2">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold text-black">{userName}</p>
                    <p className="text-xs text-gray-500 font-medium truncate">{userEmail}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-2" />
                <DropdownMenuItem 
                  onClick={() => handleLogout(false)}
                  className="text-black focus:bg-gray-100 focus:text-brand-blue cursor-pointer p-3 rounded-md transition-colors font-semibold"
                >
                  <LogOut className="mr-3 h-4 w-4" /> Deconectare
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <main className="max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  );
}