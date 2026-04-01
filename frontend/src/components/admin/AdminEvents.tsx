"use client";

import { useState, useMemo } from "react";
import { AdminEventForm } from "./AdminEventForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, MapPin, CheckCircle2, Loader2, RotateCcw, Filter } from "lucide-react";
import { toast } from "sonner";
import api from "@/services/api";
import { format, parseISO } from "date-fns";
import { ro } from "date-fns/locale";

interface AdminSlot {
  date: string;
  room_id: number;
  room_name: string;
  start_time: number;
  end_time: number;
  id: string;
}

export function AdminEvents() {
  const [results, setResults] = useState<AdminSlot[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [lastFilters, setLastFilters] = useState<any>(null);
  const [isBooking, setIsBooking] = useState<string | null>(null);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);

  // State pentru filtre locale
  const [filterDate, setFilterDate] = useState<string>("all");
  const [filterRoom, setFilterRoom] = useState<string>("all");

  // --- LOGICĂ FILTRARE ---
  const filteredSlots = useMemo(() => {
    return results.filter((slot) => {
      const matchDate = filterDate === "all" || slot.date === filterDate;
      const matchRoom = filterRoom === "all" || slot.room_name === filterRoom;
      return matchDate && matchRoom;
    });
  }, [results, filterDate, filterRoom]);

  // Extragerea datelor unice pentru dropdown (sortate cronologic)
  const uniqueDates = useMemo(() => {
    const dates = Array.from(new Set(results.map(s => s.date))).sort();
    return dates.map(d => ({
      value: d,
      label: format(parseISO(d), "d MMMM yyyy", { locale: ro })
    }));
  }, [results]);

  // Extragerea sălilor unice
  const uniqueRooms = useMemo(() => 
    Array.from(new Set(results.map(s => s.room_name))).sort(), 
  [results]);

  const handleSearchResponse = (filters: any | null, days: any[]) => {
    setLastFilters(filters);
    setBookedSlots([]);
    setFilterDate("all"); // Resetăm filtrele la o nouă căutare
    setFilterRoom("all");
    
    if (!filters || !days || days.length === 0) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    const flattened: AdminSlot[] = [];
    days.forEach((day: any) => {
      day.options.forEach((opt: any, index: number) => {
        flattened.push({
          date: day.date,
          room_id: opt.room_id,
          room_name: opt.room_name,
          start_time: opt.start_time,
          end_time: opt.end_time,
          id: `${day.date}-${opt.room_id}-${opt.start_time}-${index}`
        });
      });
    });

    setResults(flattened);
    setHasSearched(true);
    if (flattened.length > 0) {
        toast.success(`Am găsit ${flattened.length} sloturi libere.`);
    }
  };

  const confirmAdminBooking = async (slot: AdminSlot) => {
    if (!lastFilters) return;
    setIsBooking(slot.id);
    try {
      const payload = {
        subject: lastFilters.eventName,
        roomId: slot.room_id,
        professorIds: lastFilters.selectedProfessors.map(Number),
        subgroupIds: lastFilters.allSubgroupIds,
        reservationDate: slot.date,
        startHour: slot.start_time,
        duration: lastFilters.duration,
        numberOfPeople: parseInt(lastFilters.studentCount),
        activityType: "event"
      };

      await api.post("/reservations/confirm-admin-event", payload);
      toast.success("Eveniment programat cu succes!");
      setBookedSlots(prev => [...prev, slot.id]);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Eroare la confirmare");
    } finally {
      setIsBooking(null);
    }
  };

  const resetLocalFilters = () => {
    setFilterDate("all");
    setFilterRoom("all");
  };

  return (
    <div className="space-y-6">
      <AdminEventForm onSearch={handleSearchResponse} />

      {hasSearched && (
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Sloturi optime identificate</CardTitle>
            <CardDescription>
              {filteredSlots.length} opțiuni găsite conform filtrelor
            </CardDescription>

            {/* TOOLBAR FILTRE */}
            <div className="flex flex-wrap items-end gap-4 p-4 w-fit">
              {/* Filtru Data Calendaristică */}
              <div className="space-y-1.5 min-w-48">
                <Label className="text-xs font-semibold text-gray-500 flex items-center gap-1.5 ml-0.5">
                  <Calendar className="h-3.5 w-3.5" /> Data calendaristică
                </Label>
                <Select value={filterDate} onValueChange={setFilterDate}>
                  <SelectTrigger className="h-9 text-sm bg-white">
                    <SelectValue placeholder="Toate datele" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toate datele</SelectItem>
                    {uniqueDates.map(d => (
                      <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtru Sală */}
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
                    {uniqueRooms.map(room => (
                      <SelectItem key={room} value={room}>{room}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {(filterDate !== "all" || filterRoom !== "all") && (
                <div className="h-9 flex items-center">
                  <Button 
                    variant="outline" 
                    onClick={resetLocalFilters}
                    className="h-9 text-sm px-4 gap-2 border-gray-200 text-gray-700 hover:bg-gray-50"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Resetează filtrele
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {filteredSlots.length === 0 ? (
              <div className="text-center py-12 bg-gray-50/50 rounded-lg border border-dashed">
                <Filter className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p className="font-medium text-gray-600 italic">Nu există rezultate pentru filtrele selectate.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredSlots.map((slot) => (
                  <Card key={slot.id} className="border-l-4 border-l-brand-blue shadow-sm hover:bg-gray-50/50 transition-colors">
                    <CardContent className="pt-3">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="space-y-3">
                          <Badge className="bg-blue-50 text-brand-blue border-blue-100 font-bold">
                            Eveniment Nou
                          </Badge>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm font-medium">
                            <div className="flex items-center gap-2 text-gray-700">
                              <Calendar className="h-4 w-4 text-brand-blue" />
                              <span>{format(parseISO(slot.date), "EEEE, d MMMM yyyy", { locale: ro })}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-700">
                              <Clock className="h-4 w-4 text-brand-blue" />
                              <span>{slot.start_time}:00 - {slot.end_time}:00</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-700">
                              <MapPin className="h-4 w-4 text-brand-blue" />
                              <span>{slot.room_name}</span>
                            </div>
                          </div>
                        </div>

                        {bookedSlots.includes(slot.id) ? (
                          <Button disabled className="bg-green-600 text-white gap-2 opacity-100">
                            <CheckCircle2 className="h-4 w-4" /> Confirmat
                          </Button>
                        ) : (
                          <Button 
                            onClick={() => confirmAdminBooking(slot)}
                            disabled={isBooking === slot.id}
                            className="bg-brand-blue hover:bg-brand-blue-dark text-white font-semibold min-w-[140px]"
                          >
                            {isBooking === slot.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmă Eveniment"}
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