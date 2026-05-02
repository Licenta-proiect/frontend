"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { 
  FileText, Filter, Search, RefreshCcw,
  Check, ChevronsUpDown,
  Loader2
} from "lucide-react";
import { AdminCancelEventDialog } from "./AdminCancelEventDialog";
import { AdminEventCard } from "./AdminEventCard";
import { toast } from "sonner";
import api from "@/services/api";
import { cn } from "@/lib/utils";

export interface Reservation {
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
  const step = 10;
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [rooms, setRooms] = useState<{ id: number; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [displayLimit, setDisplayLimit] = useState(step);

  // Filter States
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterRoom, setFilterRoom] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // UI States
  const [openRoom, setOpenRoom] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [resReq, roomReq] = await Promise.all([
        api.get("/admin/reservations"),
        api.get("/data/rooms")
      ]);
      
      setReservations(resReq.data);
      setRooms(roomReq.data);
    } catch (error) {
      console.error(error);
      toast.error("Eroare la încărcarea datelor.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      await fetchData();
    };
    load();
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

 const allFilteredRecords = useMemo(() => {
    return reservations.filter((r) => {
      const matchStatus = filterStatus === "all" || r.status.toLowerCase() === filterStatus.toLowerCase();
      const matchRoom = filterRoom === "all" || r.room === filterRoom;
      
      const formattedType = toSentenceCase(r.type === 'event' ? 'eveniment' : r.type);
      const matchType = filterType === "all" || formattedType === filterType;
      
      return matchStatus && matchRoom && matchType;
    });
  }, [reservations, filterStatus, filterRoom, filterType]);

  const visibleRecords = useMemo(() => {
    return allFilteredRecords.slice(0, displayLimit);
  }, [allFilteredRecords, displayLimit]);

  const handleReset = () => {
    setFilterStatus("all");
    setFilterRoom("all");
    setFilterType("all");
    setDisplayLimit(step); 
  };

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-brand-blue" /></div>;

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
      
            {/* Status */}
           <div className="space-y-2">
              <Label className="text-sm font-medium">Status</Label>
              <Select value={filterStatus} onValueChange={(val) => { setFilterStatus(val); setDisplayLimit(step); }}>
                <SelectTrigger className="border-gray-200 w-full h-10 bg-white">
                  <SelectValue placeholder="Toate statusurile" />
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
              <Label className="text-sm font-medium">Tip activitate</Label>
              <Select value={filterType} onValueChange={(val) => { setFilterType(val); setDisplayLimit(step); }}>
                <SelectTrigger className="border-gray-200 w-full h-10 bg-white">
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

            {/* Room */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Sală</Label>
              <Popover open={openRoom} onOpenChange={setOpenRoom}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-full h-10 justify-between font-normal border-gray-200 px-3 bg-white">
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
                        <CommandItem onSelect={() => { setFilterRoom("all"); setOpenRoom(false); setDisplayLimit(step); }}>
                          <Check className={cn("mr-2 h-4 w-4", filterRoom === "all" ? "opacity-100" : "opacity-0")} />
                          Toate sălile
                        </CommandItem>
                        {rooms.map((r) => (
                          <CommandItem key={r.id} value={r.name} onSelect={() => { setFilterRoom(r.name); setOpenRoom(false); setDisplayLimit(step); }}>
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

            <Button 
              onClick={handleReset} 
              variant="outline" 
              className="bg-brand-blue hover:bg-brand-blue-dark text-white hover:text-white font-medium shadow-md transition-all active:scale-95 h-10"
            >
              <RefreshCcw className="h-4 w-4 mr-2" />
              Resetează filtrele
            </Button>
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
                {allFilteredRecords.length} înregistrări găsite
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {allFilteredRecords.length === 0 ? (
            <div className="text-center py-20 bg-slate-50/50 rounded-xl border-2 border-dashed">
              <Search className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <p className="text-slate-500 font-medium italic">Nu s-a găsit nicio înregistrare conform filtrelor.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-4">
                {visibleRecords.map((session) => (
                  <AdminEventCard 
                    key={session.id} 
                    session={session} 
                    onCancelClick={(id) => {
                      setSelectedId(id);
                      setCancelDialogOpen(true);
                    }} 
                  />
                ))}
              </div>

              {/* SHOW MORE / LESS */}
              <div className="flex flex-col items-center gap-2 pt-2">
                {allFilteredRecords.length > displayLimit && (
                  <Button 
                    variant="ghost" 
                    className="w-full font-semibold border-gray-200 text-brand-blue hover:bg-blue-50 transition-all active:scale-95"
                    onClick={() => setDisplayLimit(prev => prev + step)}
                  >
                    Încarcă mai multe înregistrări ({allFilteredRecords.length - displayLimit} rămase)
                  </Button>
                )}

                {displayLimit > step && (
                  <Button 
                    variant="link" 
                    className="text-gray-500"
                    onClick={() => setDisplayLimit(step)}
                  >
                    Arată mai puține
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}