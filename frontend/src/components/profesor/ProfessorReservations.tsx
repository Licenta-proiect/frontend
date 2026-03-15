"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Calendar, History, Loader2, Search, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import api from "@/services/api";
import { ReservationCard } from "./ReservationCard";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export interface Reservation {
  id: string;
  subject: string;
  groups: string[];
  room: string;
  date: Date;
  startTime: string;
  endTime: string;
  week: number;
  status: "upcoming" | "completed" | "canceled";
  tip: string;
}

export function ProfessorReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [reservationToCancel, setReservationToCancel] = useState<string | null>(null);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await api.get("/profesor/rezervari");
      
      const mappedData = response.data.map((r: any) => {
        const resDate = new Date(r.data);
        const isPast = resDate < new Date();
        
        // Mapare status bazată pe JSON-ul tău: "rezervat" sau "anulat"
        let status: "upcoming" | "completed" | "canceled" = "upcoming";
        if (r.status === "anulat") {
          status = "canceled";
        } else if (isPast) {
          status = "completed";
        } else {
          status = "upcoming";
        }

        return {
          id: r.id.toString(),
          subject: r.materie,
          groups: r.grupe || [],
          room: r.sala,
          date: resDate,
          startTime: `${String(r.ora_start).padStart(2, '0')}:00`,
          endTime: `${String(r.ora_start + r.durata).padStart(2, '0')}:00`,
          week: r.saptamana,
          status: status,
          tip: r.tip
        };
      });
      setReservations(mappedData);
    } catch (error) {
      toast.error("Eroare la încărcarea rezervărilor");
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
      await api.post("/rezervari/anuleaza-rezervare", {
        rezervare_id: reservationToCancel,
        email: userEmail,
        motiv: "Anulare profesor"
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success("Rezervarea a fost anulată");
      setCancelDialogOpen(false);
      fetchReservations(); 
    } catch (error: any) {
      toast.error("Eroare la anulare");
    }
  };

  const filtered = reservations.filter(r => 
    r.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.room.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeReservations = filtered.filter(r => r.status === "upcoming");
  const historyReservations = filtered.filter(r => r.status !== "upcoming");

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
      <div className="flex justify-end">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Caută..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 border-gray-200 shadow-xs text-sm"
          />
        </div>
      </div>

      {/* CARD 1: ACTIVE */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 font-semibold text-xl">
            <Calendar className="h-5 w-5 text-brand-blue" /> Rezervări viitoare
          </CardTitle>
          <CardDescription>{activeReservations.length} rezervări programate</CardDescription>
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

      {/* CARD 2: ISTORIC */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 font-semibold text-xl">
            <History className="h-5 w-5 text-brand-blue" /> Istoric rezervări
          </CardTitle>
          <CardDescription>Rezervări finalizate sau trecute</CardDescription>
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

      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" /> Confirmare Anulare
            </AlertDialogTitle>
            <AlertDialogDescription>Sigur doriți să anulați?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ÎNAPOI</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelConfirm} className="bg-red-600 hover:bg-red-700">
              CONFIRMĂ ANULAREA
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}