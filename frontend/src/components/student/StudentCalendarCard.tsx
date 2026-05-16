"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Users, AlertCircle, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Reservation } from "./StudentCalendar";

interface StudentCalendarCardProps {
  session: Reservation;
}

export function StudentCalendarCard({ session }: StudentCalendarCardProps) {
  const isCanceled = session.status.toLowerCase() === "cancelled";
  const isEvent = session.type.toLowerCase() === "event";

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "reserved": return "bg-blue-50 text-brand-blue border-blue-100 font-bold";
      case "completed": return "bg-green-50 text-green-700 border-green-100 font-bold";
      case "cancelled": return "bg-red-50 text-brand-red border-red-100 font-bold";
      default: return "bg-gray-50 text-gray-700 border-gray-100 font-bold";
    }
  };

  return (
    <Card 
      className={cn( 
        "border shadow-xs group transition-all duration-300 border-l-4 border-l-brand-blue",
        isCanceled ? "opacity-85 grayscale-[0.2]" : "hover:border-brand-blue"
      )}
    >
      <CardContent className="p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-3 flex-1">
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-4">
                <div className="font-semibold text-md text-gray-800 leading-none">
                  {session.subject}
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  <Badge 
                    variant="outline" 
                    className={cn(getStatusStyle(session.status), "text-[10px] font-bold uppercase whitespace-nowrap")}
                  >
                    {session.status.toLowerCase() === "reserved" ? "PROGRAMATĂ" : 
                    session.status.toLowerCase() === "completed" ? "FINALIZATĂ" : "ANULATĂ"}
                  </Badge>
                  <Badge 
                    variant="secondary" 
                    className="bg-gray-100 text-gray-700 border-gray-200 font-bold text-[10px] uppercase whitespace-nowrap"
                  >
                    {isEvent ? "EVENIMENT" : session.type.toUpperCase()}
                  </Badge>
                </div>
              </div>

              
              {!isEvent && (
                <>
                    <p className="text-sm font-semibold text-brand-blue">
                        {session.professor}
                    </p>
                </>
              )}
            </div>

            <div className="flex flex-col gap-3 text-sm font-medium text-gray-700">
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {/* Time */}
                <div className="flex items-center gap-1.5 shrink-0">
                    <Clock className="h-4 w-4 text-brand-blue" />
                    <span>
                        {String(session.start_hour).padStart(2, '0')}:00 - {String(session.start_hour + session.duration).padStart(2, '0')}:00
                    </span>
                </div>

                {/* Room */}
                <div className="flex items-center gap-1.5 shrink-0">
                    <MapPin className="h-4 w-4 text-brand-blue" />
                    <span>Sala {session.room}</span>
                </div>
            </div>

              {/* Additional Teachers (Same as Professor View) */}
              {session.additional_professors && session.additional_professors.length > 0 && (
                <div className="flex items-start gap-1.5 w-full border-t border-gray-50 pt-2">
                  <UserCheck className="h-4 w-4 text-brand-blue shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    <span className="text-gray-600 leading-tight">
                      {session.additional_professors.join(", ")}
                    </span>
                  </div>
                </div>
              )}

              {/* Groups */}
              <div className="flex items-start gap-1.5 w-full border-t border-gray-50 pt-2">
                <Users className="h-4 w-4 text-brand-blue shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-gray-600 leading-tight">
                    {session.participating_groups.length > 0 
                      ? session.participating_groups.join(", ") 
                      : "Toți studenții"}
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Cancellation Message */}
        {isCanceled && session.cancellation_reason && (
          <div className="border-red-50">
            <div className="text-xs p-3 rounded-lg bg-red-50/50 border border-red-100 flex items-start gap-2">
              <AlertCircle className="h-3.5 w-3.5 text-brand-red shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-brand-red mr-2">Motiv anulare:</span>
                <span className="text-gray-700 italic">&quot;{session.cancellation_reason}&quot;</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}