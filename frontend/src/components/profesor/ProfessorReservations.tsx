"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Calendar, History, Loader2, Inbox } from "lucide-react";
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
import { toast } from "sonner";
import { ReservationCard } from "./ReservationCard";
import api from "@/services/api"; // Importăm direct instanța api

export interface Reservation {
  id: string;
  subject: string;
  groups: string[];
  room: string;
  date: Date;
  startTime: string;
  endTime: string;
  week: number;
  status: "active" | "upcoming" | "completed" | "canceled";
  tip: string;
}

export function ProfessorReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [reservationToCancel, setReservationToCancel] = useState<string | null>(null);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      // Apelăm ruta direct aici
      const response = await api.get("/profesor/rezervari");
      
      const mappedData: Reservation[] = response.data.map((r: any) => ({
        id: r.id,
        subject: r.materie,
        groups: r.grupe,
        room: r.sala,
        date: new Date(r.data),
        startTime: `${String(r.ora_start).padStart(2, '0')}:00`,
        endTime: `${String(r.ora_start + r.durata).padStart(2, '0')}:00`,
        week: r.saptamana,
        status: r.status === "efectuată" ? "completed" : 
                r.status === "anulat" ? "canceled" : "upcoming",
        tip: r.tip
      }));

      setReservations(mappedData);
    } catch (error) {
      toast.error("Eroare la încărcarea rezervărilor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleCancelConfirm = async () => {
    if (!reservationToCancel) return;
    try {
      // Apelăm ruta de anulare direct aici
      await api.post(`/profesor/anuleaza-rezervare/${reservationToCancel}`);
      toast.success("Rezervarea a fost anulată cu succes");
      setCancelDialogOpen(false);
      fetchReservations(); // Refresh listă
    } catch (error) {
      toast.error("Nu s-a putut anula rezervarea");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-500">
        <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
        <p className="font-medium">Se încarcă rezervările...</p>
      </div>
    );
  }

  const upcoming = reservations.filter(r => r.status === "upcoming");
  const history = reservations.filter(r => r.status !== "upcoming");

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-10">
      <section className="space-y-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-brand-blue" />
            Rezervări Programate
          </h2>
          <p className="text-sm text-gray-600 font-medium italic">
            Gestionați orele de recuperare confirmate.
          </p>
        </div>

        {upcoming.length === 0 ? (
          <Card className="border-dashed bg-gray-50/50 shadow-none border-gray-200">
            <CardContent className="py-12 text-center text-gray-400">
              <Inbox className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p className="font-medium italic">Nu aveți nicio rezervare activă.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {upcoming.map(res => (
              <ReservationCard 
                key={res.id} 
                reservation={res} 
                onCancel={(id) => { setReservationToCancel(id); setCancelDialogOpen(true); }} 
              />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4 pt-6 border-t border-gray-100">
        <h2 className="text-lg font-bold text-gray-700 flex items-center gap-2">
          <History className="h-5 w-5 text-gray-400" />
          Istoric Rezervări
        </h2>
        <div className="grid gap-3">
          {history.map(res => <ReservationCard key={res.id} reservation={res} />)}
        </div>
      </section>

      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent className="rounded-xl border-gray-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600 font-bold">
              <AlertCircle className="h-5 w-5" /> Confirmare Anulare
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              Sunteți sigur că doriți să anulați această rezervare? Studenții din grupele{" "}
              <span className="font-bold">
                {reservations.find(r => r.id === reservationToCancel)?.groups.join(", ")}
              </span> vor fi notificați.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="font-bold rounded-lg">ÎNAPOI</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelConfirm} className="bg-red-600 hover:bg-red-700 font-bold text-white rounded-lg uppercase">
              Anulează rezervarea
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}