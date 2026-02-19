"use client";

import { ReactNode, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, LogOut, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import { toast } from "sonner";
import Cookies from "js-cookie";
import api from "@/services/api";

interface DashboardLayoutProps {
  children: ReactNode;
  userRole: "student" | "professor" | "admin";
  userName: string;
  userEmail: string;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  tabs: { id: string; label: string; icon: ReactNode }[];
}

export default function DashboardLayout({ children, userRole, userName, userEmail, activeTab, onTabChange, tabs }: DashboardLayoutProps) {
  const router = useRouter();

  useEffect(() => {
    // 1. Verificare locală rapidă
    const token = Cookies.get("access_token");
    const userFirstName = localStorage.getItem("userFirstName");
    
    if (!token || !userFirstName) {
      localStorage.clear();
      Cookies.remove("access_token");
      router.push("/");
      return;
    }

    // 2. Verificare "Who Am I" către server
    // Acest apel va forța backend-ul să verifice dacă user-ul mai există în DB
    const verifyAuth = async () => {
      try {
        // Folosim un endpoint care returnează date puține pentru performanță
        // În cazul tău, /data/tip-activitate sau un endpoint nou de profile
        await api.get("/me");
      } catch {
        // Dacă primești 401, interceptorul din services/api.ts 
        // va rula automat localStorage.clear() și window.location.href = "/"
        console.error("Sesiune invalidă detectată de server.");
      }
    };

    verifyAuth();
  }, [router]);

  const [sheetOpen, setSheetOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await api.get("/logout");
    } catch (error) {
      console.error("Backend logout failed:", error);
    } finally {
      localStorage.clear();
      Cookies.remove("access_token");
      Cookies.remove("user_role");
      toast.success("Deconectare reușită!");

      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    }
  };

  const handleTabChange = (tabId: string) => {
    onTabChange?.(tabId);
    setSheetOpen(false);
  };

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
                    <Calendar className="h-6 w-6" /> Sistem de gestionare a recuperărilor
                  </SheetTitle>
                  <SheetDescription className="sr-only">
                    Meniu de navigare pentru Sistemul de gestionare a recuperărilor.
                  </SheetDescription>
                </SheetHeader>
                <nav className="space-y-2 mt-6">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium ${
                        activeTab === tab.id 
                          ? "bg-brand-blue text-white shadow-md" 
                          : "text-black hover:bg-gray-100 hover:text-brand-blue"
                      }`}
                    >
                      {tab.icon} <span>{tab.label}</span>
                    </button>
                  ))}
                  <div className="pt-4 mt-4 border-t">
                    <button 
                      onClick={handleLogout} 
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-black hover:bg-gray-100 hover:text-brand-blue active:scale-95 font-medium transition-colors"
                    >
                      <LogOut className="h-5 w-5" /> <span>Deconectare</span>
                    </button>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
            
            <div className="flex items-center gap-2 shrink-0">
              <Calendar className="h-7 w-7 md:h-9 md:w-9 text-brand-blue" />
              <div className="flex flex-col justify-center">
                <span className="text-xl md:text-2xl font-bold text-black tracking-tight leading-none">SGR</span>
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
                  onClick={handleLogout} 
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