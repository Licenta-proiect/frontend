"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, CheckCircle2, Filter, Loader2, RotateCcw } from "lucide-react";
import { ProfessorScheduleForm, AvailableSlot, SearchFilters, SelectOption } from "@/components/professor/ProfessorScheduleForm";
import { toast } from "sonner";
import api from "@/services/api";
import { Label } from "../ui/label";

export interface BackendSlot {
  room_id: number;
  start_time: number;
  end_time: number;
}

export interface BackendDay {
  day_name: string;
  date: string;
  options: BackendSlot[];
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

  // --- FILTERING LOGIC ---
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

  // Extract unique filter options from raw results
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

  // Maps backend data structure to UI-ready AvailableSlot[]
  const transformBackendData = (filters: SearchFilters, slotsRaw: RawSlotsResponse): AvailableSlot[] => {
    if (!slotsRaw || (Array.isArray(slotsRaw) && slotsRaw.length === 0)) return [];
    
    const results: AvailableSlot[] = [];
    const { allRooms, allGroups, studentCount } = filters;

    Object.entries(slotsRaw).forEach(([week, days]: [string, BackendDay[]]) => {
      days.forEach((dayData: BackendDay) => {
        dayData.options.forEach((slot: BackendSlot, index: number) => {
          const roomName = allRooms?.find((r: SelectOption) => r.value === slot.room_id.toString())?.label || `Sala ${slot.room_id}`;
          
          const dateObj = new Date(dayData.date);
          
          results.push({
            id: `${slot.room_id}-${week}-${dayData.date}-${slot.start_time}-${index}`,
            week: parseInt(week),
            date: dateObj,
            startTime: `${slot.start_time}:00`,
            endTime: `${slot.end_time}:00`,
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
    setFilterDay("all");
    setFilterWeek("all");
    setFilterRoom("all");

    if (!filters) {
      setHasSearched(false);
      setAvailableSlots([]);
      return;
    }

    const formatted = transformBackendData(filters, rawResults);
    
    if (formatted.length === 0) {
      setHasSearched(false);
      setAvailableSlots([]);
      toast.info("Nu s-au găsit sloturi disponibile pentru criteriile selectate.");
    } else {
      setHasSearched(true);
      setAvailableSlots(formatted);
      toast.success(`Am găsit ${formatted.length} sloturi disponibile`);
    }
  };

  const confirmBooking = async (slot: AvailableSlot) => {
    if (!lastFilters) return;

    try {
      setIsBooking(slot.id);
      const response = await api.post("/reservations/confirm-reservation", {
        email: localStorage.getItem("userEmail"),
        room_id: parseInt(slot.id.split('-')[0]),
        group_ids: lastFilters.selectedGroups.map(id => parseInt(id)),
        subject: lastFilters.selectedSubject,
        activity_type: lastFilters.selectedType, 
        day: slot.date.getDay() === 0 ? 7 : slot.date.getDay(),
        week: slot.week,
        start_hour: parseInt(slot.startTime.split(':')[0]),
        duration: parseInt(slot.endTime.split(':')[0]) - parseInt(slot.startTime.split(':')[0]),
        reservation_date: slot.date.toISOString().split('T')[0],
        number_of_people: parseInt(lastFilters.studentCount) || 0
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

  const resetLocalFilters = () => {
    setFilterDay("all");
    setFilterWeek("all");
    setFilterRoom("all");
  };

  return (
    <div className="space-y-6">
      <ProfessorScheduleForm onSearch={handleSearchResults} />

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
              
             {/* Day Filter */}
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

              {/* Week Filter */}
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

              {/* Room Filter */}
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

              {/* Reset Local Filters Button */}
              {(filterDay !== "all" || filterWeek !== "all" || filterRoom !== "all") && (
                <div className="h-9 flex items-center"> 
                  <Button 
                    variant="outline" 
                    onClick={resetLocalFilters}
                    className="h-9 text-sm px-4 gap-2 border-gray-200 text-gray-700  hover:bg-gray-50"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Resetează filtrele
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* CASE 1: Initial search returned nothing from server */}
            {availableSlots.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="font-medium">Nu s-au găsit sloturi disponibile</p>
              </div>
            ) : /* CASE 2: We have data from the server, but the top filters (Day, Week, Room) removed everything */
              filteredSlots.length === 0 ? (
                <div className="text-center py-12 bg-gray-50/50 rounded-lg border border-dashed">
                  <Filter className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p className="font-medium text-gray-600 italic">Nu există rezultate pentru filtrele selectate.</p>
                </div>
              ) : (
                /* CASE 3: We have results that pass the filters */
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
                            className="bg-green-600 hover:bg-green-600 text-white font-semibold gap-2 opacity-100"
                          >
                            <CheckCircle2 className="h-4 w-4" /> Rezervat
                          </Button>
                        ) : (
                          <Button 
                            onClick={() => confirmBooking(slot)}
                            disabled={isBooking === slot.id}
                            className="bg-brand-blue hover:bg-brand-blue-dark text-white font-semibold"
                          >
                            {isBooking === slot.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Rezervă slot"
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