"use client";

import { useMemo, useSyncExternalStore, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { Database, FileText, UserCog } from "lucide-react";
import { AdminUsers } from "@/components/admin/AdminUsers";
import { AdminSync } from "@/components/admin/AdminSync";
import { AdminHistory } from "@/components/admin/AdminHistory";
import { toast } from "sonner";

const emptySubscribe = () => () => {};
  // Custom hook to detect if we are on the client side. Prevents hydration mismatch errors
function useIsClient() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

function AdminDashboardContent() {
  const isClient = useIsClient();
  const searchParams = useSearchParams();

  // Read the active tab from the URL. If it doesn't exist, fallback to "sync"
  const activeTab = searchParams.get("tab") || "sync";

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
    { id: "reserve", label: "Rezervare eveniment", icon: <ClipboardList className="h-5 w-5" /> },
    { id: "history", label: "Istoric rezervări", icon: <FileText className="h-5 w-5" /> },
    { id: "sync", label: "Sincronizare orar", icon: <Database className="h-5 w-5" /> },
    { id: "users", label: "Gestionare utilizatori", icon: <UserCog className="h-5 w-5" /> },
  ], []);

  if (!isClient) return null;

  return (
    <DashboardLayout
      userRole={user.role}
      userName={user.name}
      userEmail={user.email}
      activeTab={activeTab}
      tabs={tabs}
    >
      <div className="space-y-6">
        {activeTab === "reserve" && <AdminEvents />}
        {activeTab === "history" && <AdminHistory />}
        {activeTab === "sync" && <AdminSync />}
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