"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { 
  FileText, Filter, Calendar as CalendarIcon, Clock, 
  MapPin, Search, Download, Users, AlertCircle, RefreshCcw,
  Check, ChevronsUpDown, 
  Mail
} from "lucide-react";
import { AdminCancelEventDialog } from "./AdminCancelEventDialog";
import { UserCheck, Trash2 } from "lucide-react"; 
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { ro } from "date-fns/locale";
import api from "@/services/api";
import { cn } from "@/lib/utils";

interface Reservation {
  id: number;
  professor: string;
  professor_email: string;
  additional_professors: string[];
  subject: string;
  type: string;
  room: string;
  groups: string[];
  date: string;
  start_hour: number;
  duration: number;
  status: string;
  cancellation_reason: string | null;
  week_number?: number;
}

export function AdminHistory() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [professors, setProfessors] = useState<{ id: number; lastName: string; firstName: string }[]>([]);
  const [rooms, setRooms] = useState<{ id: number; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterProfessor, setFilterProfessor] = useState<string>("all");
  const [filterRoom, setFilterRoom] = useState<string>("all");
  const [filterGroup, setFilterGroup] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // UI States
  const [openProf, setOpenProf] = useState(false);
  const [openRoom, setOpenRoom] = useState(false);
  const [openGroup, setOpenGroup] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [resReq, profReq, roomReq] = await Promise.all([
        api.get("/admin/reservations"),
        api.get("/data/professors"),
        api.get("/data/rooms")
      ]);
      
      setReservations(resReq.data);
      setProfessors(profReq.data);
      setRooms(roomReq.data);
    } catch (error) {
      console.error(error);
      toast.error("Eroare la încărcarea datelor.");
    } finally {
      setIsLoading(false);
    }
  };

  // Inside the AdminHistory component
  const groupOptions = useMemo(() => {
    const groupsSet = new Set<string>();
    
    reservations.forEach(r => {
        r.groups.forEach(groupFullName => {
        const match = groupFullName.match(/(.*an\s\d+)/i);
        if (match && match[1]) {
            groupsSet.add(match[1].trim());
        } else {
            groupsSet.add(groupFullName); 
        }
        });
    });

    return Array.from(groupsSet).sort((a, b) => 
        a.localeCompare(b, 'ro', { sensitivity: 'base' })
    );
  }, [reservations]);

  useEffect(() => {
    fetchData();
  }, []);

  const toSentenceCase = (str: string) => {
    if (!str) return "";
    const lower = str.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  };

  const activityTypes = useMemo(() => {
    const types = new Set(reservations.map(r => toSentenceCase(r.type === 'event' ? 'eveniment' : r.type)));
    return Array.from(types).sort();
  }, [reservations]);

 const filteredRecords = useMemo(() => {
    return reservations.filter((r) => {
      const matchStatus = filterStatus === "all" || r.status.toLowerCase() === filterStatus.toLowerCase();
      const matchProf = filterProfessor === "all" || r.professor === filterProfessor;
      const matchRoom = filterRoom === "all" || r.room === filterRoom;
      const matchGroup = filterGroup === "all" || r.groups.some(g => g.startsWith(filterGroup));
      
      const formattedType = toSentenceCase(r.type === 'event' ? 'eveniment' : r.type);
      const matchType = filterType === "all" || formattedType === filterType;
      
      return matchStatus && matchProf && matchRoom && matchGroup && matchType;
    });
  }, [reservations, filterStatus, filterProfessor, filterRoom, filterGroup, filterType]);

  const handleReset = () => {
    setFilterStatus("all");
    setFilterProfessor("all");
    setFilterRoom("all");
    setFilterGroup("all");
    setFilterType("all");
  };

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "reserved": return "bg-blue-50 text-brand-blue border-blue-100 font-bold";
      case "completed": return "bg-green-50 text-green-700 border-green-100 font-bold";
      case "cancelled": return "bg-red-50 text-brand-red border-red-100 font-bold";
      default: return "bg-gray-50 text-gray-700 border-gray-100 font-bold";
    }
  };

  const handleExportCSV = () => {
    if (filteredRecords.length === 0) {
      toast.error("Nu există date de exportat");
      return;
    }
    const headers = ["Data", "Ora", "Materie", "Tip", "Profesor", "Sala", "Grupe", "Status", "Motiv Anulare"];
    const rows = filteredRecords.map(r => [
      format(parseISO(r.date), "yyyy-MM-dd"),
      `${r.start_hour}:00 - ${r.start_hour + r.duration}:00`,
      r.subject,
      r.type,
      r.professor,
      r.room,
      r.groups.join(" | "),
      r.status,
      r.cancellation_reason || "-"
    ]);

    const csvContent = "\ufeff" + [headers.join(","), ...rows.map(row => row.map(cell => `"${cell}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `istoric_admin_${format(new Date(), "dd-MM-yyyy")}.csv`);
    link.click();
    toast.success("Fișierul CSV a fost generat.");
  };

  return (
    <div className="space-y-6">
      <AdminCancelEventDialog 
        open={cancelDialogOpen} 
        onOpenChange={setCancelDialogOpen} 
        reservationId={selectedId} 
        onSuccess={fetchData} 
      />

      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-gray-900 font-semibold">
            <Filter className="h-5 w-5 text-brand-blue" />
              Filtre căutare
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Grid: 2 columns on any screen over mobile */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
            
            {/* Status */}
           <div className="space-y-2">
              <Label className="text-sm font-medium">Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="border-gray-200 w-full">
                  <SelectValue placeholder="Toate" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toate statusurile</SelectItem>
                  <SelectItem value="reserved">Programate</SelectItem>
                  <SelectItem value="completed">Finalizate</SelectItem>
                  <SelectItem value="cancelled">Anulate</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Activity Type */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Tip Activitate</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="border-gray-200 w-full">
                  <SelectValue placeholder="Toate tipurile" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toate tipurile</SelectItem>
                  {activityTypes.map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Professor */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Profesor</Label>
              <Popover open={openProf} onOpenChange={setOpenProf}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-full justify-between font-normal border-gray-200 px-3">
                    <span className="truncate">
                      {filterProfessor === "all" ? "Toți profesorii" : filterProfessor}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Caută profesor..." />
                    <CommandList className="max-h-64">
                      <CommandEmpty>Nu a fost găsit.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem onSelect={() => { setFilterProfessor("all"); setOpenProf(false); }}>
                          <Check className={cn("mr-2 h-4 w-4", filterProfessor === "all" ? "opacity-100" : "opacity-0")} />
                          Toți profesorii
                        </CommandItem>
                        {professors.map((p) => {
                          const name = `${p.lastName} ${p.firstName}`;
                          return (
                            <CommandItem key={p.id} value={name} onSelect={() => { setFilterProfessor(name); setOpenProf(false); }}>
                              <Check className={cn("mr-2 h-4 w-4", filterProfessor === name ? "opacity-100" : "opacity-0")} />
                              {name}
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Room */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Sală</Label>
              <Popover open={openRoom} onOpenChange={setOpenRoom}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-full justify-between font-normal border-gray-200 px-3">
                    <span className="truncate">
                      {filterRoom === "all" ? "Toate sălile" : filterRoom}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Caută sala..." />
                    <CommandList className="max-h-64">
                      <CommandEmpty>Nu a fost găsită.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem onSelect={() => { setFilterRoom("all"); setOpenRoom(false); }}>
                          <Check className={cn("mr-2 h-4 w-4", filterRoom === "all" ? "opacity-100" : "opacity-0")} />
                          Toate sălile
                        </CommandItem>
                        {rooms.map((r) => (
                          <CommandItem key={r.id} value={r.name} onSelect={() => { setFilterRoom(r.name); setOpenRoom(false); }}>
                            <Check className={cn("mr-2 h-4 w-4", filterRoom === r.name ? "opacity-100" : "opacity-0")} />
                            {r.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Group */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Grupă</Label>
              <Popover open={openGroup} onOpenChange={setOpenGroup}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-full justify-between font-normal border-gray-200 px-3">
                    <span className="truncate">
                      {filterGroup === "all" ? "Toate grupele" : filterGroup}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Caută grupă..." />
                    <CommandList className="max-h-64">
                      <CommandEmpty>Nu a fost găsită.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem onSelect={() => { setFilterGroup("all"); setOpenGroup(false); }}>
                          <Check className={cn("mr-2 h-4 w-4", filterGroup === "all" ? "opacity-100" : "opacity-0")} />
                          Toate grupele
                        </CommandItem>
                        {groupOptions.map((groupLabel) => (
                          <CommandItem 
                            key={groupLabel} 
                            value={groupLabel} 
                            onSelect={() => { setFilterGroup(groupLabel); setOpenGroup(false); }}
                          >
                            <Check className={cn("mr-2 h-4 w-4", filterGroup === groupLabel ? "opacity-100" : "opacity-0")} />
                            {groupLabel}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex gap-2 w-full">
              {/* Reset button */}
              <Button onClick={handleReset} variant="outline" className="flex-1 border-gray-200" title="Resetează filtrele">
                <RefreshCcw className="h-4 w-4" />
              </Button>
              
              {/* Export button */}
              <Button onClick={handleExportCSV} className="flex-1 bg-brand-blue hover:bg-brand-blue-dark shadow-md" title="Export CSV">
                <Download className="h-4 w-4" />
              </Button>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Results section */}
        <Card className="border-gray-200 shadow-sm overflow-hidden">
        <CardHeader className="pt-4 pb-0">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <CardTitle className="text-lg text-gray-900 font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5 text-brand-blue" />
                Istoric rezervări și anulări
              </CardTitle>
              <CardDescription className="text-gray-600 font-medium">
                {filteredRecords.length} înregistrări găsite
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-brand-blue border-b-2 mb-4"></div>
              <p className="text-slate-500">Se încarcă datele din server...</p>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-20 bg-slate-50/50 rounded-xl border-2 border-dashed">
              <Search className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <p className="text-slate-500 font-medium italic">Nu s-a găsit nicio înregistrare conform filtrelor.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredRecords.map((session) => {
                const isCanceled = session.status.toLowerCase() === "cancelled";
                const isUpcoming = session.status.toLowerCase() === "reserved";
                const isEvent = session.type.toLowerCase() === "event";
                const sessionDate = parseISO(session.date);

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
                                <Badge variant="outline" className={cn(getStatusStyle(session.status), "text-[10px] uppercase")}>
                                  {session.status === "reserved" ? "PROGRAMATĂ" : session.status === "completed" ? "FINALIZATĂ" : "ANULATĂ"}
                                </Badge>
                                <Badge variant="secondary" className="bg-gray-100 text-[10px] uppercase font-bold text-gray-600">
                                  {isEvent ? "EVENIMENT" : session.type.toUpperCase()}
                                </Badge>
                              </div>
                            </div>
                            
                            <p className="text-sm font-semibold text-brand-blue">{session.professor}</p>
                            
                            <div className="flex items-center gap-1.5">
                              <Mail className="h-4 w-4 text-brand-blue" />
                              <span className="text-sm text-gray-700 italic">{session.professor_email}</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium text-gray-700">
                            {/* Data & Săptămâna */}
                            <div className="flex items-center gap-1.5">
                              <CalendarIcon className="h-4 w-4 text-brand-blue" />
                              <span>
                                {format(sessionDate, "dd MMM yyyy", { locale: ro })} 
                                {session.week_number ? ` (Săpt. ${session.week_number})` : ""}
                              </span>
                            </div>

                            {/* Ora */}
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-4 w-4 text-brand-blue" />
                              <span>{String(session.start_hour).padStart(2, '0')}:00 - {String(session.start_hour + session.duration).padStart(2, '0')}:00</span>
                            </div>

                            {/* Sala */}
                            <div className="flex items-center gap-1.5">
                              <MapPin className="h-4 w-4 text-brand-blue" />
                              <span>Sala {session.room}</span>
                            </div>

                            {/* Profesori Adiționali */}
                            {session.additional_professors && session.additional_professors.length > 0 && (
                              <div className="flex items-center gap-1.5">
                                <UserCheck className="h-4 w-4 text-brand-blue shrink-0" />
                                <span className="text-gray-600 leading-tight">
                                  {session.additional_professors.join(", ")}
                                </span>
                              </div>
                            )}

                            {/* Grupe */}
                            {session.groups.length > 0 && (
                              <div className="flex items-start gap-1.5">
                                <Users className="h-4 w-4 text-brand-blue shrink-0 mt-0.5" />
                                <span className="leading-tight">{session.groups.join(", ")}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Buton Anulare (pentru Admin apare la orice rezervare viitoare) */}
                        <div className="shrink-0">
                          {isUpcoming && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => { setSelectedId(session.id); setCancelDialogOpen(true); }}
                              className="text-brand-red border-red-100 hover:bg-red-50 font-bold uppercase text-[11px]"
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-2" /> Anulează
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Motiv Anulare */}
                      {isCanceled && session.cancellation_reason && (
                        <div className="text-xs p-3 rounded-lg bg-red-50/50 border border-red-100 flex items-start gap-2">
                          <AlertCircle className="h-3.5 w-3.5 text-brand-red shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-brand-red mr-2">Motiv anulare:</span>
                            <span className="text-gray-700 italic">&quot;{session.cancellation_reason}&quot;</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}