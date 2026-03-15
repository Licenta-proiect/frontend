"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, CheckCircle2, Filter, Loader2 } from "lucide-react";
import { ProfessorScheduleForm, AvailableSlot, SearchFilters, SelectOption } from "@/components/profesor/ProfessorScheduleForm";
import { toast } from "sonner";
import api from "@/services/api";
import { Label } from "../ui/label";

export interface BackendSlot {
  sala_id: number;
  ora_start: number;
  ora_final: number;
}

export interface BackendDay {
  zi_nume: string;
  data: string;
  optiuni: BackendSlot[];
}

const DAYS_ORDER: Record<string, number> = {
  "Luni": 1, "Marți": 2, "Miercuri": 3, "Joi": 4, "Vineri": 5, "Sâmbătă": 6, "Duminică": 7
};

export type RawSlotsResponse = Record<string, BackendDay[]>;

export function ProfessorSchedule() {
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  
  const [filterDay, setFilterDay] = useState<string>("all");
  const [filterWeek, setFilterWeek] = useState<string>("all");
  const [filterRoom, setFilterRoom] = useState<string>("all");

  const [lastFilters, setLastFilters] = useState<SearchFilters | null>(null);
  const [isBooking, setIsBooking] = useState<string | null>(null);
  
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);

  // --- LOGICA DE FILTRARE ---
  const filteredSlots = useMemo(() => {
    return availableSlots.filter((slot) => {
      const dayName = slot.date.toLocaleDateString("ro-RO", { weekday: "long" });
      const capitalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);
      
      const matchDay = filterDay === "all" || capitalizedDay === filterDay;
      const matchWeek = filterWeek === "all" || slot.week.toString() === filterWeek;
      const matchRoom = filterRoom === "all" || slot.room === filterRoom;
      
      return matchDay && matchWeek && matchRoom;
    });
  }, [availableSlots, filterDay, filterWeek, filterRoom]);

  // Extragere opțiuni unice pentru filtre din rezultatele brute
  const uniqueRooms = useMemo(() => 
    Array.from(new Set(availableSlots.map(s => s.room))).sort(), 
  [availableSlots]);

  const uniqueWeeks = useMemo(() => 
    Array.from(new Set(availableSlots.map(s => s.week))).sort((a, b) => a - b), 
  [availableSlots]);

  const availableDays = useMemo(() => {
    const days = Array.from(new Set(availableSlots.map(s => {
      const d = s.date.toLocaleDateString("ro-RO", { weekday: "long" });
      return d.charAt(0).toUpperCase() + d.slice(1);
    })));
    return days.sort((a, b) => (DAYS_ORDER[a] || 99) - (DAYS_ORDER[b] || 99));
  }, [availableSlots]);

  const transformBackendData = (filters: SearchFilters, slotsRaw: RawSlotsResponse): AvailableSlot[] => {
    if (!slotsRaw || (Array.isArray(slotsRaw) && slotsRaw.length === 0)) return [];
    
    const results: AvailableSlot[] = [];
    const { allRooms, allGroups, studentCount } = filters;

    Object.entries(slotsRaw).forEach(([week, days]: [string, BackendDay[]]) => {
      days.forEach((dayData: BackendDay) => {
        dayData.optiuni.forEach((slot: BackendSlot, index: number) => {
          const roomName = allRooms?.find((r: SelectOption) => r.value === slot.sala_id.toString())?.label || `Sala ${slot.sala_id}`;
          
          const dateObj = new Date(dayData.data);
          
          results.push({
            id: `${slot.sala_id}-${week}-${dayData.data}-${slot.ora_start}-${index}`,
            week: parseInt(week),
            date: dateObj,
            startTime: `${slot.ora_start}:00`,
            endTime: `${slot.ora_final}:00`,
            room: roomName,
            capacity: parseInt(studentCount) || 0,
            availableGroups: allGroups
              ?.filter((g: SelectOption) => filters.selectedGroups?.includes(g.value))
              .map((g: SelectOption) => g.label) || []
          });
        });
      });
    });
    return results;
  };

  const handleSearchResults = (filters: SearchFilters | null, rawResults: RawSlotsResponse) => {
    setLastFilters(filters);
    setBookedSlots([]);

    if (!filters) {
      setHasSearched(false);
      setAvailableSlots([]);
      return;
    }

    const formatted = transformBackendData(filters, rawResults);
    
    if (formatted.length === 0) {
      // Dacă nu sunt rezultate, resetăm starea de căutare pentru a ascunde zona
      setHasSearched(false);
      setAvailableSlots([]);
      toast.info("Nu s-au găsit sloturi disponibile pentru criteriile selectate.");
    } else {
      // Dacă avem rezultate, le afișăm
      setHasSearched(true);
      setAvailableSlots(formatted);
      toast.success(`Am găsit ${formatted.length} sloturi disponibile`);
    }
  };

  const confirmBooking = async (slot: AvailableSlot) => {
    // Validăm existența filtrelor folosite la căutare
    if (!lastFilters) return;

    try {
      setIsBooking(slot.id);
      const response = await api.post("/rezervari/confirma-rezervare", {
        email: localStorage.getItem("userEmail"),
        sala_id: parseInt(slot.id.split('-')[0]),
        grupe_ids: lastFilters.selectedGroups.map(id => parseInt(id)),
        materie: lastFilters.selectedSubject,
        tip_activitate: lastFilters.selectedType, 
        zi: slot.date.getDay() === 0 ? 7 : slot.date.getDay(),
        saptamana: slot.week,
        ora_start: parseInt(slot.startTime.split(':')[0]),
        durata: parseInt(slot.endTime.split(':')[0]) - parseInt(slot.startTime.split(':')[0]),
        data_rezervare: slot.date.toISOString().split('T')[0],
        numar_persoane: parseInt(lastFilters.studentCount) || 0
      });

      if (response.data.success) {
        toast.success("Rezervare confirmată cu succes!");
        setBookedSlots(prev => [...prev, slot.id]);
      }
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || "Eroare la rezervare";
      toast.error(errorMessage);
    } finally {
      setIsBooking(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Randarea formularului extras */}
      <ProfessorScheduleForm onSearch={handleSearchResults} />

      {/* Secțiunea de Rezultate */}
      {hasSearched && (
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg">Sloturi disponibile</CardTitle>
                <CardDescription>
                  {filteredSlots.length} opțiuni găsite conform filtrelor
                </CardDescription>
              </div>
            </div>

            <div className="flex flex-wrap items-end gap-4 mt-4 p-4 w-fit">
              <div className="space-y-1.5 min-w-35">
                <Label className="text-xs font-semibold text-gray-500 flex items-center gap-1.5 ml-0.5">
                  <Calendar className="h-3.5 w-3.5" /> Ziua
                </Label>
                <Select value={filterDay} onValueChange={setFilterDay}>
                  <SelectTrigger className="h-9 text-sm bg-white">
                    <SelectValue placeholder="Toate zilele" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toate zilele</SelectItem>
                    {availableDays.map(day => <SelectItem key={day} value={day}>{day}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 min-w-35">
                <Label className="text-xs font-semibold text-gray-500 flex items-center gap-1.5 ml-0.5">
                  <Filter className="h-3.5 w-3.5" /> Săptămâna
                </Label>
                <Select value={filterWeek} onValueChange={setFilterWeek}>
                  <SelectTrigger className="h-9 text-sm bg-white">
                    <SelectValue placeholder="Oricare" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toate</SelectItem>
                    {uniqueWeeks.map(w => <SelectItem key={w} value={w.toString()}>Săptămâna {w}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 min-w-35">
                <Label className="text-xs font-semibold text-gray-500 flex items-center gap-1.5 ml-0.5">
                  <MapPin className="h-3.5 w-3.5" /> Sala
                </Label>
                <Select value={filterRoom} onValueChange={setFilterRoom}>
                  <SelectTrigger className="h-9 text-sm bg-white">
                    <SelectValue placeholder="Toate sălile" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toate sălile</SelectItem>
                    {uniqueRooms.map(room => <SelectItem key={room} value={room}>{room}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {availableSlots.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="font-medium">Nu s-au găsit sloturi disponibile</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredSlots.map((slot) => (
                  <Card key={slot.id} className="border-l-4 border-l-brand-blue shadow-sm hover:bg-gray-50/50 transition-colors">
                    <CardContent className="pt-3">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-blue-50 text-brand-blue border-blue-100 font-bold">Săptămâna {slot.week}</Badge>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm font-medium">
                            <div className="flex items-center gap-2 text-gray-700">
                              <Calendar className="h-4 w-4 text-brand-blue" />
                              <span>{slot.date.toLocaleDateString("ro-RO", { weekday: "long", day: "numeric", month: "long" })}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-700">
                              <Clock className="h-4 w-4 text-brand-blue" />
                              <span>{slot.startTime} - {slot.endTime}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-700">
                              <MapPin className="h-4 w-4 text-brand-blue" />
                              <span>{slot.room}</span>
                            </div>
                          </div>
                        </div>
                        
                        {bookedSlots.includes(slot.id) ? (
                          <Button 
                            disabled 
                            className="bg-green-600 hover:bg-green-600 text-white font-bold gap-2 opacity-100"
                          >
                            <CheckCircle2 className="h-4 w-4" /> Rezervat
                          </Button>
                        ) : (
                          <Button 
                            onClick={() => confirmBooking(slot)}
                            disabled={isBooking === slot.id}
                            className="bg-brand-blue hover:bg-brand-blue-dark text-white font-bold"
                          >
                            {isBooking === slot.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Rezervă Slot"
                            )}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}