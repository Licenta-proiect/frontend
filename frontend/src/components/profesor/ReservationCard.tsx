"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Trash2, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReservationCardProps {
  reservation: {
    id: string;
    subject: string;
    groups: string[];
    room: string;
    date: Date;
    startTime: string;
    endTime: string;
    status: "upcoming" | "completed" | "canceled";
    tip: string;
  };
  onCancel?: (id: string) => void;
}

export function ReservationCard({ reservation, onCancel }: ReservationCardProps) {
  const isUpcoming = reservation.status === "upcoming";

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming": return "bg-blue-50 text-brand-blue border-blue-100 font-bold";
      case "completed": return "bg-green-50 text-green-700 border-green-100 font-bold";
      case "canceled": return "bg-red-50 text-brand-red border-red-100 font-bold";
      default: return "bg-gray-50 text-gray-700 border-gray-100 font-bold";
    }
  };

  return (
    <Card className="border shadow-xs group hover:border-brand-blue/50 transition-all duration-300">
      <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="font-medium text-md text-gray-900">{reservation.subject}</div>
            <Badge variant="outline" className={cn(getStatusColor(reservation.status))}>
              {reservation.status === "upcoming" ? "PROGRAMATĂ" : reservation.status.toUpperCase()}
            </Badge>
            <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-none font-bold text-[10px]">
              {reservation.tip}
            </Badge>
          </div>
          
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-medium text-gray-600">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-brand-blue" />
              <span>{reservation.date.toLocaleDateString("ro-RO")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-brand-blue" />
              <span>{reservation.startTime} - {reservation.endTime}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-brand-blue" />
              <span>Sala {reservation.room}</span>
            </div>
          </div>

          <div className="flex gap-1.5 mt-2">
            {reservation.groups.map(g => (
              <span key={g} className="text-[11px] bg-white border border-gray-200 px-2 py-0.5 rounded text-gray-500 font-bold">
                {g}
              </span>
            ))}
          </div>
        </div>

        <div className="flex gap-2 shrink-0">
          {isUpcoming && onCancel && (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => onCancel(reservation.id)} 
              className="text-brand-red shadow-xs border-red-100 hover:bg-red-50 hover:text-brand-red font-semibold"
            >
              <Trash2 className="h-3.5 w-3.5 mr-2" /> Anulează
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}