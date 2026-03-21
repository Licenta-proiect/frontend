"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Calendar, History, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import api from "@/services/api";
import { ReservationCard } from "./ReservationCard";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "../ui/button";
import { AxiosError } from "axios";

export interface Reservation {
  id: string;          
  subject: string;      
  type: string;          
  room: string;         
  groups: string[];      
  week: number;    
  day: string;           
  date: string;         
  start_hour: number;    
  duration: number;      
  status: string;       
  cancellation_reason: string | null;
}

export function ProfessorReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [reservationToCancel, setReservationToCancel] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");

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

  const filtered = reservations.filter(r => 
    r.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.room.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeReservations = filtered.filter(r => r.status === "reserved");
  const historyReservations = filtered.filter(r => r.status !== "reserved");

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
      {/* Search bar */}
      <div className="flex justify-end">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Caută după materie sau sală..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 border-gray-200 shadow-xs text-sm"
          />
        </div>
      </div>

      {/* Card 1: Upcoming reservations */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 font-semibold text-xl">
            <Calendar className="h-5 w-5 text-brand-blue" /> Rezervări viitoare
          </CardTitle>
          <CardDescription className="text-gray-600 font-medium">{activeReservations.length} rezervări programate</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeReservations.length === 0 ? (
            <div className="text-center py-12 bg-gray-50/50 rounded-lg border border-dashed">
              <p className="font-medium text-gray-600 italic">Nicio rezervare activă</p>
            </div>
          ) : (
            activeReservations.map((res) => (
              <ReservationCard 
                key={res.id} 
                reservation={res}
                onCancel={(id) => { setReservationToCancel(id); setCancelDialogOpen(true); }} 
              />
            ))
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
          {historyReservations.length === 0 ? (
            <div className="text-center py-12 bg-gray-50/50 rounded-lg border border-dashed">
              <p className="font-medium text-gray-600 italic">Istoric gol</p>
            </div>
          ) : (
            historyReservations.map((res) => (
              <ReservationCard key={res.id} reservation={res} />
            ))
          )}
        </CardContent>
      </Card>

        {/* Cancel confirmation dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent className="rounded-xl border-gray-200 shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-semibold text-xl text-gray-900">Confirmare anulare rezervare</AlertDialogTitle>
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
                Anulează
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button 
                onClick={handleCancelConfirm} 
                className="bg-brand-red hover:bg-red-700 text-white font-semibold rounded-lg shadow-md transition-all active:scale-95"
              >
                Confirmă
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}