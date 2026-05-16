"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { 
  Calendar as CalendarIcon, Clock, Info, Check, ChevronsUpDown 
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { ro } from "date-fns/locale";
import api from "@/services/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { StudentCalendarCard } from "./StudentCalendarCard";

export interface Reservation {
  id: number;
  professor: string;
  professor_email: string;
  additional_professors?: string[]; 
  subject: string;
  type: string;
  room: string;
  participating_groups: string[];
  date: string; // ISO format from backend
  start_hour: number;
  duration: number;
  status: string; // "reserved", "completed", "cancelled"
  cancellation_reason: string | null;
}

interface GroupedReservations {
  [subgroupId: string]: Reservation[];
}

export function StudentCalendar() {
  const [data, setData] = useState<GroupedReservations>({});
  const [selectedGroupId, setSelectedGroupId] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [openCombobox, setOpenCombobox] = useState(false);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("/subgroups/reservations"); 
        setData(response.data);
      } catch (error) {
        toast.error("Nu s-au putut încărca datele calendarului.");
        console.error("Fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReservations();
  }, []);

  const groupOptions = useMemo(() => {
    const specializations = new Set<string>();

    Object.values(data).forEach((reservationsList) => {
      reservationsList.forEach((res) => {

        res.participating_groups.forEach((groupFullName) => {
          const match = groupFullName.match(/^(.*?\ban\s\d+)/i);
          if (match && match[1]) {
            specializations.add(match[1].trim());
          } else {
            specializations.add(groupFullName.trim());
          }
        });
      });
    });

    const options = Array.from(specializations).map((spec) => ({
      label: spec,
      value: spec, 
    }));

    const sortedOptions = options.sort((a, b) =>
      a.label.localeCompare(b.label, "ro", { sensitivity: "base" })
    );

    return [{ label: "Toate subgrupele", value: "all" }, ...sortedOptions];
  }, [data]);

  const allUniqueReservations = useMemo(() => {
    const all = Object.values(data).flat();
    return Array.from(new Map(all.map(item => [item.id, item])).values());
  }, [data]);

  const filteredSessions = useMemo(() => {
    if (selectedGroupId === "all") return allUniqueReservations;

    return allUniqueReservations.filter((session) =>
      session.participating_groups.some((groupName) =>
        groupName.trim().startsWith(selectedGroupId)
      )
    );
  }, [selectedGroupId, allUniqueReservations]);

  const sessionsOnSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return filteredSessions.filter((session) => {
      const sessionDate = parseISO(session.date);
      return sessionDate.toDateString() === selectedDate.toDateString();
    });
  }, [selectedDate, filteredSessions]);

  const eventDates = useMemo(() => {
    return filteredSessions.map(s => parseISO(s.date));
  }, [filteredSessions]);

  return (
    <div className="space-y-6">
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1"> 
              <CardTitle className="flex items-center gap-2 text-gray-900 font-semibold text-xl">
                <CalendarIcon className="h-5 w-5 text-brand-blue" />
                Calendar recuperări
              </CardTitle>
              <CardDescription className="text-gray-600 font-medium pt-0.5">
                Monitorizarea activităților didactice programate în afara orarului normal
              </CardDescription>
            </div>
            
            <div className="flex flex-col space-y-4 w-full md:w-1/2">
              <Label className="text-sm font-medium">Filtrare subgrupă</Label>
              <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openCombobox}
                    className="w-full justify-between font-normal border-gray-200 hover:bg-transparent"
                  >
                    <span className="truncate">
                      {selectedGroupId === "all" 
                        ? "Toate subgrupele" 
                        : groupOptions.find((opt) => opt.value === selectedGroupId)?.label || "Selectează subgrupa"}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Caută subgrupă..." />
                    <CommandList className="max-h-64">
                      <CommandEmpty>Nu am găsit nicio subgrupă.</CommandEmpty>
                      <CommandGroup>
                        {groupOptions.map((opt) => (
                          <CommandItem
                            key={opt.value}
                            value={opt.label}
                            onSelect={() => {
                              setSelectedGroupId(opt.value);
                              setOpenCombobox(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedGroupId === opt.value ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {opt.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid md:grid-cols-12 gap-6">
            <div className="md:col-span-5 flex flex-col items-center">
              <div className="p-2 md:p-4 bg-white rounded-xl shadow-sm border w-full flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  locale={ro}
                  className="rounded-md scale-90 md:scale-100 origin-top" 
                  modifiers={{ hasEvent: eventDates }}
                  modifiersStyles={{
                    hasEvent: { 
                      fontWeight: 'bold', 
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      color: '#2563eb',
                      borderRadius: '50%'
                    }
                  }}
                />
              </div>

              <div className="mt-6 p-4 bg-blue-50/50 rounded-lg border border-blue-100 w-full">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold">Legendă</p>
                    <p>Zilele marcate cu albastru indică prezența unor activități programate.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-7 space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="font-bold text-md text-slate-900">
                  {selectedDate 
                    ? format(selectedDate, "eeee, d MMMM yyyy", { locale: ro })
                    : "Selectați o zi"}
                </h3>
                <Badge variant="secondary" className="px-3 py-1 text-sm">
                  {sessionsOnSelectedDate.length} {sessionsOnSelectedDate.length === 1 ? "activitate" : "activități"}                
                </Badge>
              </div>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                   <div className="animate-spin rounded-full h-8 w-8 border-primary border-b-2 mb-4"></div>
                   <p className="text-slate-500">Se încarcă activitățile...</p>
                </div>
              ) : sessionsOnSelectedDate.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-xl border-2 border-dashed">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                  <p className="text-slate-500 font-medium italic">Nu există nicio activitate programată.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-150 overflow-y-auto pr-2 custom-scrollbar">
                  {sessionsOnSelectedDate.map((session) => (
                    <StudentCalendarCard key={session.id} session={session} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}