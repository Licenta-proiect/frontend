"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Users, CheckCircle2, Filter, Loader2 } from "lucide-react";
import { ProfessorScheduleForm, AvailableSlot, SearchFilters, SelectOption } from "@/components/profesor/ProfessorScheduleForm";
import { toast } from "sonner";
import api from "@/services/api";

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

export type RawSlotsResponse = Record<string, BackendDay[]>;

export function ProfessorSchedule() {
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [sortBy, setSortBy] = useState<string>("week");

  const [lastFilters, setLastFilters] = useState<SearchFilters | null>(null);
  const [isBooking, setIsBooking] = useState<string | null>(null);

  const transformBackendData = (filters: SearchFilters, slotsRaw: RawSlotsResponse): AvailableSlot[] => {
    if (!slotsRaw || (Array.isArray(slotsRaw) && slotsRaw.length === 0)) return [];
    
    const results: AvailableSlot[] = [];
    const { allRooms, allGroups, studentCount } = filters;

    Object.entries(slotsRaw).forEach(([week, days]: [string, BackendDay[]]) => {
      days.forEach((dayData: BackendDay) => {
        dayData.optiuni.forEach((slot: BackendSlot, index: number) => {
          const roomName = allRooms?.find((r: SelectOption) => r.value === slot.sala_id.toString())?.label || `Sala ${slot.sala_id}`;
          
          const [day, month, year] = dayData.data.split('.');
          const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 12, 0, 0);

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
    if (!lastFilters) return;

    try {
      setIsBooking(slot.id);
      const response = await api.post("/rezervari/confirma-rezervare", {
        email: localStorage.getItem("userEmail"),
        sala_id: parseInt(slot.id.split('-')[0]),
        grupe_ids: lastFilters.selectedGroups.map(id => parseInt(id)),
        materie: lastFilters.selectedSubject,
        tip_activitate: "Recuperare", 
        zi: slot.date.getDay() === 0 ? 7 : slot.date.getDay(),
        saptamana: slot.week,
        ora_start: parseInt(slot.startTime.split(':')[0]),
        durata: parseInt(slot.endTime.split(':')[0]) - parseInt(slot.startTime.split(':')[0]),
        data_rezervare: slot.date.toISOString().split('T')[0],
        numar_persoane: parseInt(lastFilters.studentCount) || 0
      });

      if (response.data.success) {
        toast.success("Rezervare confirmată!");
        setAvailableSlots(prev => prev.filter(s => s.id !== slot.id));
      }
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || "Eroare la rezervare";
      toast.error(errorMessage);
    } finally {
      setIsBooking(null);
    }
  };

  const sortedSlots = [...availableSlots].sort((a, b) => {
    if (sortBy === "week") return a.week - b.week;
    if (sortBy === "time") return a.startTime.localeCompare(b.startTime);
    return 0;
  });

  return (
    <div className="space-y-6">
      {/* Randarea formularului extras */}
      <ProfessorScheduleForm onSearch={handleSearchResults} />

      {/* Secțiunea de Rezultate */}
      {hasSearched && availableSlots.length > 0 && (
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-lg font-bold">Sloturi Disponibile</CardTitle>
              <CardDescription className="font-medium text-gray-600 text-sm">
                Am găsit {availableSlots.length} sloturi pentru săptămânile 1-14
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-45 h-8 text-xs border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="text-xs">
                  <SelectItem value="week">După săptămână</SelectItem>
                  <SelectItem value="time">După oră</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {availableSlots.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="font-medium">Nu s-au găsit sloturi disponibile</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {sortedSlots.map((slot) => (
                  <Card key={slot.id} className="border-l-4 border-l-brand-blue shadow-sm hover:bg-gray-50/50 transition-colors">
                    <CardContent className="pt-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-blue-50 text-brand-blue border-blue-100 font-bold">Săptămâna {slot.week}</Badge>
                            <Badge variant="outline" className="gap-1 border-green-200 text-green-700 bg-green-50 font-bold text-[10px] uppercase tracking-wider">
                              <CheckCircle2 className="h-3 w-3" /> Disponibil
                            </Badge>
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
                            <div className="flex items-center gap-2 text-gray-700">
                              <Users className="h-4 w-4 text-brand-blue" />
                              <span>Max: {slot.capacity}</span>
                            </div>
                          </div>
                        </div>
                        <Button 
                          onClick={() => confirmBooking(slot)}
                          disabled={isBooking === slot.id}
                          className="bg-brand-blue hover:bg-brand-blue-dark text-white font-bold"
                        >
                          {isBooking === slot.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Rezervă Slot"}
                        </Button>
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