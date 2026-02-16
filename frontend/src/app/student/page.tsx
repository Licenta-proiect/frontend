"use client";

import { useMemo, useSyncExternalStore, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { Calendar, Search } from "lucide-react";
import { StudentSearch } from "@/components/student/StudentSearch";

const StudentCalendar = () => <div className="p-6 bg-white rounded-lg shadow">Calendar Interactiv Recuperări</div>;

const emptySubscribe = () => () => {};
function useIsClient() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

function StudentDashboardContent() {
  const isClient = useIsClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeTab = searchParams.get("tab") || "calendar";

  const handleTabChange = (tabId: string) => {
    router.push(`/student?tab=${tabId}`, { scroll: false });
  };

  const user = useMemo(() => {
    if (!isClient) return { name: "Utilizator", email: "", role: "student" as const };
    return {
      name: `${localStorage.getItem("userFirstName") || "Student"} ${localStorage.getItem("userLastName") || ""}`.trim(),
      email: localStorage.getItem("userEmail") || "",
      role: "student" as const,
    };
  }, [isClient]);

  const tabs = useMemo(() => [
    { id: "calendar", label: "Calendar recuperări", icon: <Calendar className="h-5 w-5" /> },
    { id: "search", label: "Căutare", icon: <Search className="h-5 w-5" /> },
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
        {activeTab === "calendar" && <StudentCalendar />}
        {activeTab === "search" && <StudentSearch />}
      </div>
    </DashboardLayout>
  );
}

export default function StudentDashboard() {
  return (
    <Suspense fallback={null}>
      <StudentDashboardContent />
    </Suspense>
  );
}