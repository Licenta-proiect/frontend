"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Calendar, Clock, MapPin, Trash2, Users, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Reservation } from "./ProfessorReservations";

interface ReservationCardProps {
  reservation: Reservation;
  onCancel?: (id: string) => void;
}

export function ReservationCard({ reservation, onCancel }: ReservationCardProps) {
  const isUpcoming = reservation.status === "reserved";
  const isCanceled = reservation.status === "cancelled";
  const isEvent = reservation.type.toLowerCase() === "event";

  const dateObj = new Date(reservation.date);
  
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "reserved": return "bg-blue-50 text-brand-blue border-blue-100 font-bold";
      case "completed": return "bg-green-50 text-green-700 border-green-100 font-bold";
      case "cancelled": return "bg-red-50 text-brand-red border-red-100 font-bold";
      default: return "bg-gray-50 text-gray-700 border-gray-100 font-bold";
    }
  };

  return (
    <Card className={cn(
        "border shadow-xs group transition-all duration-300 border-l-4 border-l-brand-blue",
        isCanceled ? "opacity-85 grayscale-[0.2]" : "hover:border-brand-blue")}>
      <CardContent className="p-5 space-y-4"> 
        {/* Info row + Action button */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-3 flex-1">
            {/* Subject + Status badge + Activity type badge */}
            <div className="flex items-center justify-between gap-4">
                <div className="font-semibold text-md text-gray-900">{reservation.subject}</div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className={cn(getStatusColor(reservation.status), "text-[10px]")}>
                    {reservation.status === "reserved" ? "PROGRAMATĂ" : 
                    reservation.status === "completed" ? "FINALIZATĂ" : "ANULATĂ"}
                  </Badge>
                  <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-gray-200 font-bold text-[10px]">
                    {isEvent ? "EVENIMENT" : reservation.type.toUpperCase()}
                  </Badge>
                </div>
            </div>
            
            {/* Detail row */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium text-gray-700">

              {/* Date */}
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-brand-blue" />
                <span className="capitalize">
                  {dateObj.toLocaleDateString("ro-RO")}
                </span>
              </div>

              {/* Time interval */}
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-brand-blue" />
                <span>
                  {String(reservation.start_hour).padStart(2, '0')}:00 - {String(reservation.start_hour + reservation.duration).padStart(2, '0')}:00
                </span>
              </div>

              {/* Room */}
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-brand-blue" />
                <span>Sala {reservation.room}</span>
              </div>

              {/* Additional Teachers - Shown only if available */}
              {reservation.additional_professors && reservation.additional_professors.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <UserCheck className="h-4 w-4 text-brand-blue shrink-0" />
                  <span className="text-gray-600 leading-tight">
                    {reservation.additional_professors.join(", ")}
                  </span>
                </div>
              )}

              {/* Groups - Display icon only if there are subgroups */}
              {reservation.groups.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-brand-blue shrink-0 mt-0.5" />
                  <span className="text-gray-600 leading-tight">{reservation.groups.join(", ")}</span>
                </div>
              )}
              
            </div>
          </div>

          {/* Cancel button — only for upcoming reservations */}
          <div className="flex gap-2 shrink-0">
            {isUpcoming && onCancel && !isEvent && (
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
        </div>

        {/* Cancellation reason */}
        {isCanceled && reservation.cancellation_reason && (
          <div className="border-red-50">
            <div className="text-xs p-3 rounded-lg bg-red-50/50 border border-red-100 flex items-start gap-2">
              <AlertCircle className="h-3.5 w-3.5 text-brand-red shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-brand-red mr-2">Motiv anulare:</span>
                <span className="text-gray-700 italic">&quot;{reservation.cancellation_reason}&quot;</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}