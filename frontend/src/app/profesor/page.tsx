"use client";

import { useMemo, useSyncExternalStore, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { ClipboardList, FileText } from "lucide-react";
import { ProfessorSchedule } from "@/components/professor/ProfessorSchedule";
import { ProfessorReservations } from "@/components/professor/ProfessorReservations";
import { toast } from "sonner";

const emptySubscribe = () => () => {};
/**
 * Custom hook to detect if the component is mounted on the client
 * Essential for accessing localStorage and avoiding hydration errors
 */
function useIsClient() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

function ProfessorDashboardContent() {
  const isClient = useIsClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get active tab from URL, defaults to "schedule"
  const activeTab = searchParams.get("tab") || "schedule";

  // Updates URL query parameter to switch tabs without full page reload
  const handleTabChange = (tabId: string) => {
    router.push(`/profesor?tab=${tabId}`, { scroll: false });
  };

  // Clear existing toasts when switching tabs
  useEffect(() => {
    toast.dismiss();
  }, [activeTab]);

  const user = useMemo(() => {
    if (!isClient) return { name: "Utilizator", email: "", role: "professor" as const };
    return {
      name: `${localStorage.getItem("userLastName") || "Profesor"} ${localStorage.getItem("userFirstName") || ""}`.trim(),
      email: localStorage.getItem("userEmail") || "",
      role: "professor" as const,
    };
  }, [isClient]);

  const tabs = useMemo(() => [
    { id: "schedule", label: "Programare recuperare", icon: <ClipboardList className="h-5 w-5" /> },
    { id: "reservations", label: "Rezervările mele", icon: <FileText className="h-5 w-5" /> },
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
        {activeTab === "schedule" && <ProfessorSchedule />}
        {activeTab === "reservations" && <ProfessorReservations />}
      </div>
    </DashboardLayout>
  );
}

export default function ProfessorDashboard() {
  return (
    <Suspense fallback={null}>
      <ProfessorDashboardContent />
    </Suspense>
  );
}