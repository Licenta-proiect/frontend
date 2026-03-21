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
  Calendar as CalendarIcon, Clock, MapPin, Users, Info, 
  AlertCircle, Check, ChevronsUpDown 
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { ro } from "date-fns/locale";
import api from "@/services/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Reservation {
  id: number;
  professor: string;
  professor_email: string;
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
    const subgroupIds = Object.keys(data);
    
    const options = subgroupIds.map((id) => {
      const fullName = data[id][0]?.participating_groups.find(name => name.length > 0) || "";
  
      let label = `Subgrupa ${id}`;
      if (fullName) {
        const match = fullName.match(/(.*an\s\d+)/i);
        if (match && match[1]) {
          label = match[1].trim();
        }
      }

      return { label: label, value: id };
    });

    const uniqueOptions = Array.from(new Map(options.map(item => [item.label, item])).values());

    const sortedOptions = uniqueOptions.sort((a, b) => 
      a.label.localeCompare(b.label, 'ro', { sensitivity: 'base' })
    );

    return [{ label: "Toate subgrupele", value: "all" }, ...sortedOptions];
  }, [data]);

  const allUniqueReservations = useMemo(() => {
    const all = Object.values(data).flat();

    const activeReservations = all.filter(
      (session) => session.status.toLowerCase() !== "cancelled"
    );

    return Array.from(new Map(activeReservations.map(item => [item.id, item])).values());
  }, [data]);

  const filteredSessions = useMemo(() => {
    if (selectedGroupId === "all") return allUniqueReservations;

    const selectedOption = groupOptions.find(opt => opt.value === selectedGroupId);
    if (!selectedOption) return [];

    const matchingSubgroupIds = Object.keys(data).filter(id => {
      const fullName = data[id][0]?.participating_groups[0] || "";
      return fullName.startsWith(selectedOption.label);
    });

    const combined = matchingSubgroupIds.flatMap(id => data[id]);
    return Array.from(new Map(combined.map(item => [item.id, item])).values());
  }, [selectedGroupId, data, allUniqueReservations, groupOptions]);

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

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "reserved": return "bg-blue-50 text-brand-blue border-blue-100 font-bold";
      case "completed": return "bg-green-50 text-green-700 border-green-100 font-bold";
      case "cancelled": return "bg-red-50 text-brand-red border-red-100 font-bold";
      default: return "bg-gray-50 text-gray-700 border-gray-100 font-bold";
    }
  };

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
            
            <div className="flex flex-col space-y-4">
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
          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="p-4 bg-white rounded-xl shadow-sm border w-full flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  locale={ro}
                  className="rounded-md"
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
                    <p>Zilele marcate cu cerc albastru indică prezența unor recuperări programate.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-4">
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
                   <p className="text-slate-500">Se încarcă recuperările...</p>
                </div>
              ) : sessionsOnSelectedDate.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-xl border-2 border-dashed">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                  <p className="text-slate-500 font-medium italic">Nu există nicio activitate programată.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-150 overflow-y-auto pr-2 custom-scrollbar">
                  {sessionsOnSelectedDate.map((session) => {
                    const isCanceled = session.status.toLowerCase() === "cancelled";

                    return (
                      <Card 
                        key={session.id} 
                        className={cn(
                          "border shadow-xs group transition-all duration-300 border-l-4 border-l-brand-blue",
                          isCanceled ? "opacity-85 grayscale-[0.2]" : "hover:border-brand-blue"
                        )}
                      >
                        <CardContent className="p-5 space-y-4">
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            
                            <div className="space-y-3 flex-1">
                              <div className="space-y-1">
                                <div className="flex items-center justify-between gap-4">
                                  <div className="font-semibold text-md text-gray-800 leading-none">
                                    {session.subject}
                                  </div>
                                  
                                  <div className="flex items-center gap-2 shrink-0">
                                    <Badge 
                                      variant="outline" 
                                      className={cn(getStatusStyle(session.status), "text-[10px] font-bold uppercase whitespace-nowrap")}
                                    >
                                      {session.status.toLowerCase() === "reserved" ? "PROGRAMATĂ" : 
                                       session.status.toLowerCase() === "completed" ? "FINALIZATĂ" : "ANULATĂ"}
                                    </Badge>
                                    <Badge 
                                      variant="secondary" 
                                      className="bg-gray-100 text-gray-700 border-gray-200 font-bold text-[10px] uppercase whitespace-nowrap"
                                    >
                                      {session.type}
                                    </Badge>
                                  </div>
                                </div>

                                <p className="text-sm font-semibold text-brand-blue">
                                  {session.professor}
                                </p>
                              </div>

                              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium text-gray-700">
                                {/* Duration */}
                                <div className="flex items-center gap-1.5">
                                  <Clock className="h-4 w-4 text-brand-blue" />
                                  <span>
                                    {String(session.start_hour).padStart(2, '0')}:00 - {String(session.start_hour + session.duration).padStart(2, '0')}:00
                                  </span>
                                </div>

                                {/* Room */}
                                <div className="flex items-center gap-1.5">
                                  <MapPin className="h-4 w-4 text-brand-blue" />
                                  <span>Sala {session.room}</span>
                                </div>

                                {/* Groups */}
                                <div className="flex items-start gap-1.5">
                                  <Users className="h-4 w-4 text-brand-blue shrink-0 mt-0.5" />
                                  <span className="leading-tight">
                                    {session.participating_groups.join(", ")}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Cancellation reason */}
                          {isCanceled && session.cancellation_reason && (
                            <div className="border-red-50">
                              <div className="text-xs p-3 rounded-lg bg-red-50/50 border border-red-100 flex items-start gap-2">
                                <AlertCircle className="h-3.5 w-3.5 text-brand-red shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-bold text-brand-red mr-2">Motiv anulare:</span>
                                  <span className="text-gray-700 italic">&quot;{session.cancellation_reason}&quot;</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}