"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Users, Trash2 } from "lucide-react";
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
    week: number;
    studentCount: number;
    status: "active" | "upcoming" | "completed";
  };
  onCancel?: (id: string) => void;
}

export function ReservationCard({ reservation, onCancel }: ReservationCardProps) {
  const isCompleted = reservation.status === "completed";

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-50 text-brand-blue border-blue-100 font-bold";
      case "active":
        return "bg-green-50 text-green-700 border-green-100 font-bold";
      case "completed":
        return "bg-gray-100 text-gray-600 border-gray-200 font-medium";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "upcoming": return "PROGRAMATĂ";
      case "active": return "ÎN DESFĂȘURARE";
      case "completed": return "FINALIZATĂ";
      default: return status.toUpperCase();
    }
  };

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-200 border-gray-200 shadow-sm hover:shadow-md",
      isCompleted ? "opacity-80 grayscale-[0.2] bg-gray-50/50" : "border-l-4 border-l-brand-blue"
    )}>
      <CardContent className="p-0">
        {/* Header-ul cardului */}
        <div className="px-5 py-3 flex items-center justify-between border-b border-gray-100/80 bg-white/50">
          <span className="font-bold text-gray-900 text-base">{reservation.subject}</span>
          <Badge variant="outline" className={cn("text-[10px] px-2 py-0.5", getStatusStyles(reservation.status))}>
            {getStatusLabel(reservation.status)}
          </Badge>
        </div>

        {/* Info Grid */}
        <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Calendar className="h-4 w-4 text-brand-blue shrink-0" />
            <span>
              {reservation.date.toLocaleDateString("ro-RO", {
                weekday: "short",
                day: "numeric",
                month: "short",
              })}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Clock className="h-4 w-4 text-brand-blue shrink-0" />
            <span>{reservation.startTime} - {reservation.endTime}</span>
          </div>

          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <MapPin className="h-4 w-4 text-brand-blue shrink-0" />
            <span>Sala {reservation.room}</span>
          </div>

          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Users className="h-4 w-4 text-brand-blue shrink-0" />
            <span>{reservation.studentCount} studenți</span>
          </div>
        </div>

        {/* Footer - Grupe și Acțiuni */}
        <div className="px-5 py-3 flex flex-wrap items-center justify-between gap-3 bg-gray-50/30 border-t border-gray-100">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Grupe:</span>
            {reservation.groups.map((group) => (
              <Badge key={group} variant="secondary" className="bg-white border-gray-200 text-gray-700 font-medium">
                {group}
              </Badge>
            ))}
          </div>

          {!isCompleted && onCancel && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCancel(reservation.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 px-3 gap-1.5 font-bold text-xs"
            >
              <Trash2 className="h-3.5 w-3.5" />
              ANULEAZĂ
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}