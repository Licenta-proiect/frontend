"use client";

import { useMemo, useSyncExternalStore, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { Database, FileText, UserCog } from "lucide-react";
import { AdminUsers } from "@/components/admin/AdminUsers";

const AdminHistory = () => <div className="p-6 bg-white rounded-lg shadow">Istoric Rezervări Sistem</div>;
const AdminSync = () => <div className="p-6 bg-white rounded-lg shadow">Gestionare Utilizatori și Roluri</div>;

const emptySubscribe = () => () => {};
function useIsClient() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

function AdminDashboardContent() {
  const isClient = useIsClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Citim tab-ul din URL. Dacă nu există, fallback la "sync"
  const activeTab = searchParams.get("tab") || "sync";

  // Schimbăm tab-ul prin actualizarea URL-ului (fără refresh de pagină)
  const handleTabChange = (tabId: string) => {
    router.push(`/admin?tab=${tabId}`, { scroll: false });
  };

  const user = useMemo(() => {
    if (!isClient) return { name: "Utilizator", email: "", role: "admin" as const };

    return {
      name: `${localStorage.getItem("userFirstName") || "Admin"} ${localStorage.getItem("userLastName") || ""}`.trim(),
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
        {activeTab === "users" && <AdminUsers />}
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