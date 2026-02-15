"use client";

import { useMemo, useSyncExternalStore, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { ClipboardList, FileText } from "lucide-react";

const ProfessorSchedule = () => <div className="p-6 bg-white rounded-lg shadow">Formular Programare Recuperări</div>;
const ProfessorReservations = () => <div className="p-6 bg-white rounded-lg shadow">Lista Rezervărilor Mele</div>;

const emptySubscribe = () => () => {};
function useIsClient() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

function ProfessorDashboardContent() {
  const isClient = useIsClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeTab = searchParams.get("tab") || "schedule";

  const handleTabChange = (tabId: string) => {
    router.push(`/profesor?tab=${tabId}`, { scroll: false });
  };

  const user = useMemo(() => {
    if (!isClient) return { name: "Utilizator", email: "", role: "professor" as const };
    return {
      name: `${localStorage.getItem("userFirstName") || "Profesor"} ${localStorage.getItem("userLastName") || ""}`.trim(),
      email: localStorage.getItem("userEmail") || "",
      role: "professor" as const,
    };
  }, [isClient]);

  const tabs = useMemo(() => [
    { id: "schedule", label: "Programare Recuperare", icon: <ClipboardList className="h-5 w-5" /> },
    { id: "reservations", label: "Rezervările Mele", icon: <FileText className="h-5 w-5" /> },
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