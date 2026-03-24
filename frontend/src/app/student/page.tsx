"use client";

import { useMemo, useSyncExternalStore, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { Calendar, Search } from "lucide-react";
import { StudentSearch } from "@/components/student/StudentSearch";
import { StudentCalendar } from "@/components/student/StudentCalendar";
import { toast } from "sonner";

const emptySubscribe = () => () => {};

/**
 * Hook to determine if the code is running on the client side.
 * Prevents hydration errors when accessing localStorage.
 */
function useIsClient() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

function StudentDashboardContent() {
  const isClient = useIsClient();
  const searchParams = useSearchParams();

  // Determine active tab from URL, default to "calendar"
  const activeTab = searchParams.get("tab") || "calendar";

  // Clear notifications when changing tabs
  useEffect(() => {
    toast.dismiss();
  }, [activeTab]);

  const user = useMemo(() => {
    if (!isClient) return { name: "Utilizator", email: "", role: "student" as const };
    return {
      name: `${localStorage.getItem("userLastName") || "Student"} ${localStorage.getItem("userFirstName") || ""}`.trim(),
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