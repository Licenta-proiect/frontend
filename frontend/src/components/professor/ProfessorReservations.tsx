"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Calendar, History, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import api from "@/services/api";
import { ReservationCard } from "./ReservationCard";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "../ui/button";
import { AxiosError } from "axios";

export interface Reservation {
  id: string;          
  subject: string;      
  type: string;          
  room: string;         
  groups: string[];      
  additional_professors?: string[]; 
  week: number;    
  day: string;           
  date: string;         
  start_hour: number;    
  duration: number;      
  status: string;       
  cancellation_reason: string | null;
}

export function ProfessorReservations() {
  const step = 5;
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [reservationToCancel, setReservationToCancel] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [activeLimit, setActiveLimit] = useState(step);
  const [historyLimit, setHistoryLimit] = useState(step);
  
  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await api.get<Reservation[]>("/professor/reservations");

      const mappedData = response.data.map((r): Reservation => {
        return {
          ...r,
          id: r.id.toString()
        };
      });

      setReservations(mappedData);
    } catch (error) {
      const axiosError = error as AxiosError<{ detail?: string }>;
      const message = axiosError.response?.data?.detail || "Eroare la încărcarea rezervărilor";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReservations(); }, []);

  const handleCancelConfirm = async () => {
    if (!reservationToCancel) return;
    const userEmail = localStorage.getItem("userEmail");
    const token = localStorage.getItem("access_token");

    try {
      await api.post("/reservations/cancel-reservation", {
        reservation_id: reservationToCancel,
        email: userEmail,
        reason: cancelReason || ""
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success("Rezervarea a fost anulată");
      setCancelDialogOpen(false);
      setCancelReason("");
      fetchReservations(); 
    } catch (error) {
      const axiosError = error as AxiosError<{ detail?: string }>;
      const message = axiosError.response?.data?.detail || "Eroare la anulare";
      toast.error(message);
    }
  };

  const toSentenceCase = (str: string) => {
    if (!str) return "";
    const lower = str.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  };

  const activityTypes = useMemo(() => {
    const types = new Set(
      reservations.map(r => {
        const typeName = r.type.toLowerCase() === 'event' ? 'eveniment' : r.type;
        return toSentenceCase(typeName);
      })
    );
    return Array.from(types).sort();
  }, [reservations]);

  const filtered = useMemo(() => {
    return reservations.filter(r => {
      const matchesSearch = 
        r.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.room.toLowerCase().includes(searchQuery.toLowerCase());
        
      const currentTypeFormatted = toSentenceCase(
        r.type.toLowerCase() === 'event' ? 'eveniment' : r.type
      );
      
      const matchesType = statusFilter === "all" || currentTypeFormatted === statusFilter;
      return matchesSearch && matchesType;
    });
  }, [reservations, searchQuery, statusFilter]);

  const allActive = useMemo(() => filtered.filter(r => r.status === "reserved"), [filtered]);
  const allHistory = useMemo(() => filtered.filter(r => r.status !== "reserved"), [filtered]);

  const visibleActive = useMemo(() => allActive.slice(0, activeLimit), [allActive, activeLimit]);
  const visibleHistory = useMemo(() => allHistory.slice(0, historyLimit), [allHistory, historyLimit]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-500">
        <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
        <p className="font-medium">Se încarcă rezervările...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-10 space-y-6">
      {/* Toolbar: Search + Filter Type */}
      <div className="flex flex-col sm:flex-row justify-end gap-3">
        {/* Activity Type Filter */}
        <div className="w-full sm:w-64">
          <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setActiveLimit(step); setHistoryLimit(step); }}>
            <SelectTrigger className="h-10 border-gray-200 shadow-xs text-sm bg-white w-full">
              <SelectValue placeholder="Tip activitate" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toate tipurile</SelectItem>
              {activityTypes.map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Search bar */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Caută după materie sau sală..." 
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setActiveLimit(step); setHistoryLimit(step); }}
            className="pl-9 h-10 border-gray-200 shadow-xs text-sm bg-white w-full"
          />
        </div>
      </div>

      {/* Card 1: Upcoming reservations */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 font-semibold text-xl">
            <Calendar className="h-5 w-5 text-brand-blue" /> Rezervări viitoare
          </CardTitle>
          <CardDescription className="text-gray-600 font-medium">{allActive.length} rezervări programate</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {allActive.length === 0 ? (
            <div className="text-center py-12 bg-gray-50/50 rounded-lg border border-dashed">
              <p className="font-medium text-gray-600 italic">Nicio rezervare activă</p>
            </div>
          ) : (
            <>
              <div className="grid gap-4">
                {visibleActive.map((res) => (
                  <ReservationCard 
                    key={res.id} 
                    reservation={res}
                    onCancel={(id) => { setReservationToCancel(id); setCancelDialogOpen(true); }} 
                  />
                ))}
              </div>

              {/* Show More/Less */}
              <div className="flex flex-col items-center gap-2 pt-2">
                {allActive.length > activeLimit && (
                  <Button 
                    variant="ghost" 
                    className="w-full font-semibold border-gray-200 text-brand-blue hover:bg-blue-50 transition-all active:scale-95"
                    onClick={() => setActiveLimit(prev => prev + step)}
                  >
                    Încarcă mai multe rezervări ({allActive.length - activeLimit} rămase)
                  </Button>
                )}
                {activeLimit > step && (
                  <Button variant="link" className="text-gray-500" onClick={() => setActiveLimit(step)}>
                    Arată mai puține
                  </Button>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Card 2: History */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 font-semibold text-xl">
            <History className="h-5 w-5 text-brand-blue" /> Istoric rezervări
          </CardTitle>
          <CardDescription className="text-gray-600 font-medium">Rezervări finalizate sau anulate</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {allHistory.length === 0 ? (
            <div className="text-center py-12 bg-gray-50/50 rounded-lg border border-dashed">
              <p className="font-medium text-gray-600 italic">Istoric gol</p>
            </div>
          ) : (
            <>
              <div className="grid gap-4">
                {visibleHistory.map((res) => (
                  <ReservationCard key={res.id} reservation={res} />
                ))}
              </div>

              {/* Show More/Less */}
              <div className="flex flex-col items-center gap-2 pt-2">
                {allHistory.length > historyLimit && (
                  <Button 
                    variant="ghost" 
                    className="w-full font-semibold border-gray-200 text-brand-blue hover:bg-blue-50 transition-all active:scale-95"
                    onClick={() => setHistoryLimit(prev => prev + step)}
                  >
                    Încarcă mai multe din istoric ({allHistory.length - historyLimit} rămase)
                  </Button>
                )}
                {historyLimit > step && (
                  <Button variant="link" className="text-gray-500" onClick={() => setHistoryLimit(step)}>
                    Arată mai puține
                  </Button>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Cancel confirmation dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent className="rounded-xl border-gray-200 shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-semibold text-xl text-gray-900">Anulare rezervare</AlertDialogTitle>
            <AlertDialogDescription>
              Sunteți sigur că doriți să anulați? Această acțiune va elibera sala pentru alți colegi.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {/* Optional cancellation reason */}
          <div className="py-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 ml-1">
                Motivul anulării (opțional)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Exemplu: Modificare orar..."
                className="w-full p-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-sm transition-all resize-none placeholder:text-gray-400"
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button 
                variant="ghost" 
                className="font-semibold rounded-lg border-gray-200 text-gray-600 hover:bg-gray-100"
              >
                Înapoi
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button 
                onClick={handleCancelConfirm} 
                className="bg-brand-red hover:bg-red-700 text-white font-semibold rounded-lg shadow-md transition-all active:scale-95"
              >
                Confirmă anularea
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}