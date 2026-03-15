"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar, History, Loader2, Search, Inbox, AlertCircle } from "lucide-react";
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
  studentCount: number;
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
      const mappedData = response.data.map((r: any) => ({
        id: r.id,
        subject: r.materie,
        groups: r.grupe || [],
        room: r.sala,
        date: new Date(r.data),
        startTime: `${String(r.ora_start).padStart(2, '0')}:00`,
        endTime: `${String(r.ora_start + r.durata).padStart(2, '0')}:00`,
        week: r.saptamana,
        status: r.status === "anulată" ? "canceled" : 
                (new Date(r.data) < new Date() ? "completed" : "upcoming"),
        tip: r.tip,
        studentCount: r.numar_persoane || 0
      }));
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

  // 1. Extragem datele exact așa cum le salvează AuthCallback
  const userEmail = localStorage.getItem("userEmail");
  const token = localStorage.getItem("access_token");

  // 2. Verificare de siguranță
  if (!userEmail || !token) {
    toast.error("Sesiune invalidă. Te rugăm să te reconectezi.");
    return;
  }

  try {
    // 3. Apelul către backend
    await api.post("/rezervari/anuleaza-rezervare", {
      rezervare_id: reservationToCancel,
      email: userEmail, // Acum userEmail va avea valoarea corectă
      motiv: "Anulare profesor"
    }, {
      headers: {
        Authorization: `Bearer ${token}` // Trimitem și token-ul pentru Depends(get_current_user)
      }
    });

    toast.success("Rezervarea a fost anulată cu succes");
    setCancelDialogOpen(false);
    fetchReservations(); 
  } catch (error: any) {
    // Gestionare erori...
    const detail = error.response?.data?.detail;
    toast.error(typeof detail === "string" ? detail : "Eroare la anulare");
  }
};

  const filtered = reservations.filter(r => 
    r.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.room.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-500">
        <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
        <p className="font-medium">Se încarcă rezervările...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-gray-900 font-semibold text-xl">
                <Calendar className="h-5 w-5 text-brand-blue" /> Lista rezervări
              </CardTitle>
              <CardDescription className="font-medium text-gray-600">
                {filtered.length} rezervări găsite în total
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Caută după materie sau sală..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 focus-visible:ring-1 border-gray-200 shadow-xs text-sm"
              />
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {filtered.length === 0 ? (
            <p className="text-center py-10 text-gray-500 italic">Nicio rezervare găsită</p>
          ) : (
            <div className="grid gap-4">
              {filtered.map((res) => (
                <ReservationCard 
                  key={res.id} 
                  reservation={res} 
                  onCancel={(id) => { setReservationToCancel(id); setCancelDialogOpen(true); }} 
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reutilizăm AlertDialog-ul stilizat */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent className="rounded-xl border-gray-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600 font-bold">
              <AlertCircle className="h-5 w-5" /> Confirmare Anulare
            </AlertDialogTitle>
            <AlertDialogDescription>
              Sigur doriți să anulați rezervarea? Acțiunea este ireversibilă.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="font-bold rounded-lg">ÎNAPOI</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelConfirm} className="bg-red-600 hover:bg-red-700 font-bold text-white rounded-lg uppercase">
              Confirmă Anularea
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}