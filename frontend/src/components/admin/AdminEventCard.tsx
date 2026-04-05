"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar as CalendarIcon, Clock, MapPin, Users, 
  AlertCircle, Mail, UserCheck, Trash2 
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { ro } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Reservation } from "./AdminHistory";

interface AdminEventCardProps {
  session: Reservation;
  onCancelClick: (id: number) => void;
}

export function AdminEventCard({ session, onCancelClick }: AdminEventCardProps) {
  const isCanceled = session.status.toLowerCase() === "cancelled";
  const isUpcoming = session.status.toLowerCase() === "reserved";
  const isEvent = session.type.toLowerCase() === "event";
  const sessionDate = parseISO(session.date);

  const getStatusStyle = (status: string) => {
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
      isCanceled ? "opacity-85 grayscale-[0.2]" : "hover:border-brand-blue"
    )}>
      <CardContent className="p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-3 flex-1">
            <div className="space-y-1">
              {/* Status + Type */}
              <div className="flex items-center justify-between gap-4">
                <div className="font-semibold text-md text-gray-800 leading-none">
                  {session.subject}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className={cn(getStatusStyle(session.status), "text-[10px] uppercase")}>
                    {session.status === "reserved" ? "PROGRAMATĂ" : session.status === "completed" ? "FINALIZATĂ" : "ANULATĂ"}
                  </Badge>
                  <Badge variant="secondary" className="bg-gray-100 text-[10px] uppercase font-bold text-gray-600">
                    {isEvent ? "EVENIMENT" : session.type.toUpperCase()}
                  </Badge>
                </div>
              </div>
              
              {!isEvent && (
                <>
                  {/* Professor name */}
                  <p className="text-sm font-semibold text-brand-blue">{session.professor}</p>
                  
                  {/* Professor email */}
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Mail className="h-4 w-4 text-brand-blue" />
                    <span className="text-xs italic">{session.professor_email}</span>
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium text-gray-700">
              {/* Day */}
              <div className="flex items-center gap-1.5">
                <CalendarIcon className="h-4 w-4 text-brand-blue" />
                <span>
                  {format(sessionDate, "dd MMM yyyy", { locale: ro })}
                </span>
              </div>

              {/* Duration */}
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-brand-blue" />
                <span>{String(session.start_hour).padStart(2, '0')}:00 - {String(session.start_hour + session.duration).padStart(2, '0')}:00</span>
              </div>

              {/* Room */}
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-brand-blue" />
                <span>Sala {session.room}</span>
              </div>

              {/* Additional professors */}
              {session.additional_professors && session.additional_professors.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <UserCheck className="h-4 w-4 text-brand-blue shrink-0" />
                  <span className="text-gray-600 leading-tight">
                    {session.additional_professors.join(", ")}
                  </span>
                </div>
              )}

              {/* Groups */}
              {session.groups.length > 0 && (
                <div className="flex items-start gap-1.5">
                  <Users className="h-4 w-4 text-brand-blue shrink-0 mt-0.5" />
                  <span className="leading-tight">{session.groups.join(", ")}</span>
                </div>
              )}
            </div>
          </div>

          {/* Cancel button for events */}
          <div className="shrink-0">
            {isEvent && !isCanceled && isUpcoming && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => onCancelClick(session.id)}
                className="text-brand-red shadow-xs border-red-100 hover:bg-red-50 hover:text-brand-red font-bold uppercase text-[11px]"
              >
                <Trash2 className="h-3.5 w-3.5 mr-2" /> Anulează
              </Button>
            )}
          </div>
        </div>

        {/* Cancellation reason */}
        {isCanceled && session.cancellation_reason && (
          <div className="text-xs p-3 rounded-lg bg-red-50/50 border border-red-100 flex items-start gap-2">
            <AlertCircle className="h-3.5 w-3.5 text-brand-red shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-brand-red mr-2">Motiv anulare:</span>
              <span className="text-gray-700 italic">&quot;{session.cancellation_reason}&quot;</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}