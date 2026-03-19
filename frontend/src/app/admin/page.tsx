"use client";

import { useMemo, useSyncExternalStore, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { Database, FileText, UserCog } from "lucide-react";
import { AdminUsers } from "@/components/admin/AdminUsers";
import { AdminSync } from "@/components/admin/AdminSync";
import { toast } from "sonner";

const AdminHistory = () => <div className="p-6 bg-white rounded-lg shadow">Istoric Rezervări Sistem</div>;

const emptySubscribe = () => () => {};
  // Custom hook to detect if we are on the client side. Prevents hydration mismatch errors
function useIsClient() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

function AdminDashboardContent() {
  const isClient = useIsClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read the active tab from the URL. If it doesn't exist, fallback to "sync"
  const activeTab = searchParams.get("tab") || "sync";

  // Change the tab by updating the URL (without page refresh)
  const handleTabChange = (tabId: string) => {
    router.push(`/admin?tab=${tabId}`, { scroll: false });
  };

  useEffect(() => {
    toast.dismiss();
  }, [activeTab]);

  const user = useMemo(() => {
    if (!isClient) return { name: "Utilizator", email: "", role: "admin" as const };

    return {
      name: `${localStorage.getItem("userLastName") || "Admin"} ${localStorage.getItem("userFirstName") || ""}`.trim(),
      email: localStorage.getItem("userEmail") || "",
      role: "admin" as const,
    };
  }, [isClient]);

  const tabs = useMemo(() => [
    { id: "sync", label: "Sincronizare orar", icon: <Database className="h-5 w-5" /> },
    { id: "history", label: "Istoric rezervări", icon: <FileText className="h-5 w-5" /> },
    { id: "users", label: "Gestionare utilizatori", icon: <UserCog className="h-5 w-5" /> },
  ], []);

  if (!isClient) return null;

  return (
    <DashboardLayout
      userRole={user.role}
      userName={user.name}
      userEmail={user.email}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      tabs={tabs}
    >
      <div className="space-y-6">
        {activeTab === "sync" && <AdminSync />}
        {activeTab === "history" && <AdminHistory />}
        {activeTab === "users" && <Suspense fallback={<div>Încărcare...</div>}><AdminUsers /></Suspense>}
      </div>
    </DashboardLayout>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={null}>
      <AdminDashboardContent />
    </Suspense>
  );
}