"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Trash2, Hash } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReservationCardProps {
  reservation: {
    id: number;
    subject: string;
    groups: string[];
    room: string;
    date: Date;
    startTime: string;
    endTime: string;
    status: "upcoming" | "completed" | "canceled";
    tip: string;
    week: number;
  };
  onCancel?: (id: string) => void;
}

export function ReservationCard({ reservation, onCancel }: ReservationCardProps) {
  const isUpcoming = reservation.status === "upcoming";

  // Formatăm ziua săptămânii (ex: Luni)
  const dayName = new Intl.DateTimeFormat('ro-RO', { weekday: 'long' }).format(reservation.date);

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
            <div className="font-bold text-md text-gray-900 tracking-tight">{reservation.subject}</div>
            <Badge variant="outline" className={cn(getStatusColor(reservation.status), "text-[10px]")}>
              {reservation.status === "upcoming" ? "PROGRAMATĂ" : 
               reservation.status === "completed" ? "FINALIZATĂ" : "ANULATĂ"}
            </Badge>
            <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-none font-bold text-[10px]">
              {reservation.tip.toUpperCase()}
            </Badge>
          </div>
          
          {/* Informații Detaliate */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium text-gray-600">
            {/* Săptămâna */}
            <div className="flex items-center gap-1.5">
              <Hash className="h-4 w-4 text-brand-blue" />
              <span>Săptămâna {reservation.week}</span>
            </div>

            {/* Ziua și Data */}
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-brand-blue" />
              <span className="capitalize">{dayName}, {reservation.date.toLocaleDateString("ro-RO")}</span>
            </div>

            {/* Interval Orar */}
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-brand-blue" />
              <span>{reservation.startTime} - {reservation.endTime}</span>
            </div>

            {/* Sala */}
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-brand-blue" />
              <span className="text-gray-900 font-semibold">Sala {reservation.room}</span>
            </div>
          </div>

          {/* Grupe */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {reservation.groups.map(g => (
              <span key={g} className="text-[10px] bg-white border border-gray-200 px-2 py-0.5 rounded text-gray-500 font-bold uppercase tracking-wider">
                {g}
              </span>
            ))}
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
      </CardContent>
    </Card>
  );
}