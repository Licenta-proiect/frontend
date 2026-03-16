"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Calendar, Clock, MapPin, Trash2, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Reservation } from "./ProfessorReservations";

interface ReservationCardProps {
  reservation: Reservation;
  onCancel?: (id: string) => void;
}

export function ReservationCard({ reservation, onCancel }: ReservationCardProps) {
  const isUpcoming = reservation.status === "upcoming";
  const isCanceled = reservation.status === "canceled";

  const dateObj = new Date(reservation.data);
  const dayName = new Intl.DateTimeFormat('ro-RO', { weekday: 'long' }).format(dateObj);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming": return "bg-blue-50 text-brand-blue border-blue-100 font-bold";
      case "completed": return "bg-green-50 text-green-700 border-green-100 font-bold";
      case "canceled": return "bg-red-50 text-brand-red border-red-100 font-bold";
      default: return "bg-gray-50 text-gray-700 border-gray-100 font-bold";
    }
  };

  return (
    <Card className={cn(
      "border shadow-xs group transition-all duration-300",
      isUpcoming ? "hover:border-brand-blue/50" : "opacity-85 grayscale-[0.2]"
    )}>
      <CardContent className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5">
        <div className="space-y-3">
          {/* Materie + Status + Tip */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="font-semibold text-md text-gray-900">{reservation.materie}</div>
            <Badge variant="outline" className={cn(getStatusColor(reservation.status), "text-[10px]")}>
              {reservation.status === "upcoming" ? "PROGRAMATĂ" : 
               reservation.status === "completed" ? "FINALIZATĂ" : "ANULATĂ"}
            </Badge>
            <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-gray-200 font-bold text-[10px]">
              {reservation.tip.toUpperCase()}
            </Badge>
          </div>
          
          {/* Informații Detaliate */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium text-gray-700">
            {/* Săptămâna */}
            <div className="flex items-center gap-1.5">
              <span>Săptămâna {reservation.saptamana}</span>
            </div>

            {/* Ziua și Data */}
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-brand-blue" />
              <span className="capitalize">{dayName}, {dateObj.toLocaleDateString("ro-RO")}</span>
            </div>

            {/* Interval Orar */}
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-brand-blue" />
              <span>
                {String(reservation.ora_start).padStart(2, '0')}:00 - {String(reservation.ora_start + reservation.durata).padStart(2, '0')}:00
              </span>
            </div>

            {/* Sala */}
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-brand-blue" />
              <span>{reservation.sala}</span>
            </div>

            {/* Grupe */}
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-brand-blue" />
              <span>{reservation.grupe.join(", ")}</span>
            </div>
          </div>
        </div>

        {/* Buton Anulare (doar pentru active) */}
        <div className="flex gap-2 shrink-0">
          {isUpcoming && onCancel && (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => onCancel(reservation.id)} 
              className="text-brand-red shadow-xs border-red-100 hover:bg-red-50 hover:text-brand-red font-bold uppercase text-[11px]"
            >
              <Trash2 className="h-3.5 w-3.5 mr-2" /> Anulează
            </Button>
          )}
        </div>

        {/* Motiv Anulare (Apare dedesubt pe toată lățimea) */}
        {isCanceled && reservation.motiv_anulare && (
          <div className="border-red-100">
            <div className="text-xs p-3 rounded-lg bg-red-50/50 border border-red-50 flex items-start gap-2">
              <AlertCircle className="h-3.5 w-3.5 text-brand-red shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-brand-red mr-2">Motiv anulare:</span>
                <span className="text-gray-700 italic">&quot;{reservation.motiv_anulare}&quot;</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}