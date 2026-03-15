"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Calendar, History } from "lucide-react";
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

// Interfața rămâne aceeași
interface Reservation {
  id: string;
  subject: string;
  groups: string[];
  room: string;
  date: Date;
  startTime: string;
  endTime: string;
  week: number;
  studentCount: number;
  status: "active" | "upcoming" | "completed";
}

export function ProfessorReservations() {
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [reservationToCancel, setReservationToCancel] = useState<string | null>(null);

  // Datele tale Mock...
  const [reservations, setReservations] = useState<Reservation[]>([
    // ... aceleași date pe care le-ai furnizat în codul inițial
  ]);

  const handleCancelConfirm = () => {
    if (reservationToCancel) {
      setReservations((prev) => prev.filter((r) => r.id !== reservationToCancel));
      toast.success("Rezervarea a fost anulată cu succes");
      setCancelDialogOpen(false);
      setReservationToCancel(null);
    }
  };

  const upcomingReservations = reservations.filter((r) => r.status !== "completed");
  const completedReservations = reservations.filter((r) => r.status === "completed");

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-10">
      {/* Sectiunea Rezervari Active/Viitoare */}
      <section className="space-y-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-brand-blue" />
            Rezervări Programate
          </h2>
          <p className="text-sm text-gray-500">
            Gestionați orele de recuperare confirmate pentru săptămânile curente.
          </p>
        </div>

        {upcomingReservations.length === 0 ? (
          <Card className="border-dashed shadow-none bg-gray-50/50">
            <CardContent className="py-12 text-center text-gray-500">
              <Calendar className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p className="font-medium">Nu aveți nicio rezervare activă în acest moment.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {upcomingReservations.map((res) => (
              <ReservationCard 
                key={res.id} 
                reservation={res} 
                onCancel={(id) => {
                  setReservationToCancel(id);
                  setCancelDialogOpen(true);
                }} 
              />
            ))}
          </div>
        )}
      </section>

      {/* Sectiunea Istoric */}
      <section className="space-y-4">
        <div className="flex flex-col gap-1 pt-4 border-t border-gray-100">
          <h2 className="text-lg font-bold text-gray-700 flex items-center gap-2">
            <History className="h-5 w-5 text-gray-400" />
            Istoric Rezervări
          </h2>
        </div>

        <div className="grid gap-3">
          {completedReservations.map((res) => (
            <ReservationCard key={res.id} reservation={res} />
          ))}
        </div>
      </section>

      {/* Dialogul de Confirmare */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent className="rounded-xl border-gray-200 shadow-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600 font-bold">
              <AlertCircle className="h-5 w-5" />
              Confirmare Anulare
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 text-sm">
              Sunteți sigur că doriți să anulați această rezervare? Studenții din grupele{" "}
              <span className="font-bold">
                {reservations.find(r => r.id === reservationToCancel)?.groups.join(", ")}
              </span>{" "}
              vor primi o notificare de anulare automată.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel className="rounded-lg border-gray-200 font-bold text-gray-700">
              RENUNȚĂ
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelConfirm}
              className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg"
            >
              ANULEAZĂ REZERVAREA
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}