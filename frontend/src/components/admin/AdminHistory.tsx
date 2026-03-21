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
  Check, ChevronsUpDown 
} from "lucide-react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { ro } from "date-fns/locale";
import api from "@/services/api";
import { cn } from "@/lib/utils";

interface Reservation {
  id: number;
  professor: string;
  professor_email: string;
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

  const availableGroups = useMemo(() => {
    const groupsSet = new Set<string>();
    reservations.forEach(r => {
      r.groups.forEach(g => groupsSet.add(g));
    });
    return Array.from(groupsSet).sort();
  }, [reservations]);

  useEffect(() => {
    fetchData();
  }, []);

  const filteredRecords = useMemo(() => {
    return reservations.filter((r) => {
      const matchStatus = filterStatus === "all" || r.status.toLowerCase() === filterStatus.toLowerCase();
      const matchProf = filterProfessor === "all" || r.professor === filterProfessor;
      const matchRoom = filterRoom === "all" || r.room === filterRoom;
      const matchGroup = filterGroup === "all" || r.groups.includes(filterGroup);
      
      return matchStatus && matchProf && matchRoom && matchGroup;
    });
  }, [reservations, filterStatus, filterProfessor, filterRoom, filterGroup]);

  const handleReset = () => {
    setFilterStatus("all");
    setFilterProfessor("all");
    setFilterRoom("all");
    setFilterGroup("all");
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
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 font-semibold text-xl">
            <Filter className="h-5 w-5 text-brand-blue" />
            Panou Control Istoric
          </CardTitle>
          <CardDescription className="text-gray-600 font-medium">
            Monitorizarea activităților didactice și gestionarea înregistrărilor
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Grid: 2 coloane pe orice ecran peste mobil */}
          <div className="grid grid-cols-2 gap-4 items-end">
            
            {/* Status */}
            <div className="space-y-2 col-span-2 md:col-span-1">
              <Label className="text-sm font-medium">Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="border-gray-200 w-full">
                  <SelectValue placeholder="Toate" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toate Statusurile</SelectItem>
                  <SelectItem value="reserved">Programate</SelectItem>
                  <SelectItem value="completed">Finalizate</SelectItem>
                  <SelectItem value="cancelled">Anulate</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Profesor */}
            <div className="space-y-2 col-span-2 md:col-span-1">
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
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Caută profesor..." />
                    <CommandList>
                      <CommandEmpty>Nu a fost găsit.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem onSelect={() => { setFilterProfessor("all"); setOpenProf(false); }}>
                          <Check className={cn("mr-2 h-4 w-4", filterProfessor === "all" ? "opacity-100" : "opacity-0")} />
                          Toți Profesorii
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

            {/* Sală */}
            <div className="space-y-2 col-span-2 md:col-span-1">
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
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Caută sala..." />
                    <CommandList>
                      <CommandEmpty>Nu a fost găsită.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem onSelect={() => { setFilterRoom("all"); setOpenRoom(false); }}>
                          <Check className={cn("mr-2 h-4 w-4", filterRoom === "all" ? "opacity-100" : "opacity-0")} />
                          Toate Sălile
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

            {/* Grupă */}
            <div className="space-y-2 col-span-2 md:col-span-1">
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
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Caută grupă..." />
                    <CommandList>
                      <CommandEmpty>Nu a fost găsită.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem onSelect={() => { setFilterGroup("all"); setOpenGroup(false); }}>
                          <Check className={cn("mr-2 h-4 w-4", filterGroup === "all" ? "opacity-100" : "opacity-0")} />
                          Toate Grupele
                        </CommandItem>
                        {availableGroups.map((groupName) => (
                          <CommandItem 
                            key={groupName} 
                            value={groupName} 
                            onSelect={() => { setFilterGroup(groupName); setOpenGroup(false); }}
                          >
                            <Check className={cn("mr-2 h-4 w-4", filterGroup === groupName ? "opacity-100" : "opacity-0")} />
                            {groupName}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Buton Resetează */}
            <div className="col-span-1">
              <Button onClick={handleReset} variant="outline" className="w-full border-gray-200">
                <RefreshCcw className="h-4 w-4 mr-2" /> <span className="sm:inline">Resetează</span>
              </Button>
            </div>

            {/* Buton Export */}
            <div className="col-span-1">
              <Button onClick={handleExportCSV} className="w-full bg-brand-blue hover:bg-brand-blue/90">
                <Download className="h-4 w-4 mr-2" /> <span className="sm:inline">Export CSV</span>
              </Button>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <FileText className="h-5 w-5 text-brand-blue" />
            Rezultate Filtrare
          </h3>
          <Badge variant="secondary" className="bg-blue-50 text-brand-blue border-blue-100">
            {filteredRecords.length} înregistrări
          </Badge>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border">
            <div className="animate-spin rounded-full h-8 w-8 border-brand-blue border-b-2 mb-4"></div>
            <p className="text-slate-500">Se încarcă datele din server...</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-xl border-2 border-dashed">
            <Search className="h-12 w-12 mx-auto mb-4 text-slate-300" />
            <p className="text-slate-500 font-medium italic">Nu s-a găsit nicio înregistrare conform filtrelor.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredRecords.map((session) => {
              const isCanceled = session.status.toLowerCase() === "cancelled";
              const sessionDate = parseISO(session.date);

              return (
                <Card 
                  key={session.id} 
                  className={cn(
                    "border shadow-sm group transition-all duration-300 border-l-4",
                    isCanceled ? "border-l-brand-red opacity-85" : "border-l-brand-blue hover:border-brand-blue"
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
                                <Badge variant="secondary" className="bg-gray-100 text-[10px] uppercase font-bold">
                                    {session.type}
                                </Badge>
                            </div>
                          </div>
                          <p className="text-sm font-semibold text-brand-blue">{session.professor}</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium text-gray-700">
                          <div className="flex items-center gap-1.5">
                            <CalendarIcon className="h-4 w-4 text-brand-blue" />
                            <span>{format(sessionDate, "dd MMM yyyy", { locale: ro })} (Sapt. {session.week_number})</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4 text-brand-blue" />
                            <span>{String(session.start_hour).padStart(2, '0')}:00 - {String(session.start_hour + session.duration).padStart(2, '0')}:00</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-4 w-4 text-brand-blue" />
                            <span>Sala {session.room}</span>
                          </div>
                          <div className="flex items-start gap-1.5">
                            <Users className="h-4 w-4 text-brand-blue shrink-0 mt-0.5" />
                            <span className="leading-tight">{session.groups.join(", ")}</span>
                          </div>
                        </div>
                      </div>
                    </div>

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
      </div>
    </div>
  );
}