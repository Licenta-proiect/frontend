"use client";

import { useState, useMemo } from "react";
import { AdminEventForm } from "./AdminEventForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/services/api";
import { format } from "date-fns";
import { ro } from "date-fns/locale";

interface AdminSlot {
  date: string;
  room_id: number;
  room_name: string;
  start_time: number;
  end_time: number;
  id: string; // generated locally
}

export function AdminEvents() {
  const [results, setResults] = useState<AdminSlot[]>([]);
  const [lastFilters, setLastFilters] = useState<any>(null);
  const [isBooking, setIsBooking] = useState<string | null>(null);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);

  const handleSearchResponse = (filters: any | null, days: any[]) => {
    setLastFilters(filters);
    setBookedSlots([]);
    
    if (!filters || !days) {
      setResults([]);
      return;
    }

    // Flattening the backend response: { date: "...", options: [...] } -> AdminSlot[]
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
      toast.success("Eveniment rezervat cu succes!");
      setBookedSlots(prev => [...prev, slot.id]);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Eroare la confirmarea rezervării");
    } finally {
      setIsBooking(null);
    }
  };

  return (
    <div className="space-y-6">
      <AdminEventForm onSearch={handleSearchResponse} />

      {results.length > 0 && (
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Sloturi optime identificate</CardTitle>
            <CardDescription>
              Am găsit {results.length} intervale libere pentru toți participanții și sălile selectate.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {results.map((slot) => (
                <Card key={slot.id} className="border-l-4 border-l-brand-blue shadow-sm hover:bg-gray-50/50 transition-colors">
                  <CardContent className="pt-4">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="space-y-2">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm font-medium">
                          <div className="flex items-center gap-2 text-gray-700">
                            <Calendar className="h-4 w-4 text-brand-blue" />
                            <span>{format(new Date(slot.date), "EEEE, d MMMM yyyy", { locale: ro })}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-700">
                            <Clock className="h-4 w-4 text-brand-blue" />
                            <span>{slot.start_time}:00 - {slot.end_time}:00 ({lastFilters?.duration}h)</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-700">
                            <MapPin className="h-4 w-4 text-brand-blue" />
                            <span className="font-bold">{slot.room_name}</span>
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}