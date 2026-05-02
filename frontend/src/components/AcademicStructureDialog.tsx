"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarDays, Loader2 } from "lucide-react";
import api from "@/services/api";
import { cn } from "@/lib/utils";

interface CalendarEntry {
  academicYear: string;
  semester: number;
  weekNumber: number;
  period: string;
  isCurrent: boolean;
}

interface AcademicData {
  currentSemester: number;
  currentWeek: number;
  status: string;
  fullCalendar: CalendarEntry[];
}

export function AcademicStructureDialog() {
  const [data, setData] = useState<AcademicData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open && !data) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const response = await api.get("/data/academic-structure");
          setData(response.data);
        } catch (error) {
          console.error("Eroare la încărcarea structurii academice:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [open, data]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="
          h-8 gap-2 font-bold text-brand-blue shadow-xs border-blue-100 hover:bg-blue-50 hover:text-brand-blue uppercase text-xs"
        >
          <CalendarDays className="h-4 w-4" />
          Structură an
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl h-auto max-h-[85vh] flex flex-col p-0 overflow-hidden rounded-lg">
        <DialogHeader className="p-6 pb-2 border-b shrink-0">
          <DialogTitle className="text-gray-900 font-semibold text-xl flex items-center gap-2">
            <CalendarDays className="text-brand-blue" />
            Structură an universitar {data?.fullCalendar[0]?.academicYear}
          </DialogTitle>
          {data?.status && (
            <p className="text-sm text-brand-blue font-semibold tracking-wider italic">
              Status curent: {data.status}
            </p>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 pt-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
              <p className="text-sm text-gray-500 mt-2 font-medium">Se încarcă structura...</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden border-gray-200 shadow-sm bg-white">
              <Table>
                <TableHeader className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                  <TableRow>
                    <TableHead className="w-20 font-bold text-gray-700">Semestrul</TableHead>
                    <TableHead className="w-20 font-bold text-gray-700 text-center">Săptămâna</TableHead>
                    <TableHead className="font-bold text-gray-700">Perioada</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.fullCalendar.map((entry, idx) => (
                    <TableRow 
                      key={idx}
                      className={cn(
                        "transition-colors",
                        entry.isCurrent 
                          ? "bg-blue-50 hover:bg-blue-100" 
                          : "hover:bg-gray-50"
                      )}
                    >
                      <TableCell className={cn("font-medium", entry.isCurrent && "text-brand-blue font-bold")}>
                        {entry.semester}
                      </TableCell>
                      <TableCell className={cn("text-center font-medium", entry.isCurrent && "text-brand-blue font-bold")}>
                        {entry.weekNumber}
                      </TableCell>
                      <TableCell className={cn("text-sm", entry.isCurrent ? "font-bold text-brand-blue" : "text-gray-600")}>
                        {entry.period.split(';').map((segment, sIdx) => (
                          <span key={sIdx} className="block">
                            {segment.trim()}
                          </span>
                        ))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}