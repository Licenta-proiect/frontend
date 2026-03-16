"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Calendar } from "../ui/calendar";
import { Calendar as CalendarIcon, Clock, MapPin, Users, Info } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ro } from "date-fns/locale";
import api from "@/services/api";
import { toast } from "sonner";
import { SearchSelect } from "../ui/SearchSelect"; // Importă noua componentă

interface Reservation {
  id: number;
  profesor: string;
  email_profesor: string;
  materie: string;
  tip: string;
  sala: string;
  grupe_participante: string[];
  data: string;
  ora_start: number;
  durata: number;
  status: string;
  motiv_anulare: string | null;
}

interface GroupedReservations {
  [subgroupId: string]: Reservation[];
}

export function StudentCalendar() {
  const [data, setData] = useState<GroupedReservations>({});
  const [selectedGroupId, setSelectedGroupId] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true);
        const response = await api.get("/subgrupe/rezervari");
        setData(response.data);
      } catch (error) {
        toast.error("Nu s-au putut încărca datele calendarului.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchReservations();
  }, []);

  const groupOptions = useMemo(() => {
    const subgroupIds = Object.keys(data);
    
    const options = subgroupIds.map((id) => {
      const fullName = data[id][0]?.grupe_participante.find(name => name.length > 0) || "";
  
      let label = `Subgrupa ${id}`;
      if (fullName) {
        const match = fullName.match(/(.*an\s\d+)/i);
        if (match && match[1]) {
          label = match[1].trim();
        }
      }

      return { label: label, value: id };
    });

    const uniqueOptions = Array.from(new Map(options.map(item => [item.label, item])).values());

    const sortedOptions = uniqueOptions.sort((a, b) => 
      a.label.localeCompare(b.label, 'ro', { sensitivity: 'base' })
    );

    return [{ label: "Toate subgrupele", value: "all" }, ...sortedOptions];
  }, [data]);

  const allUniqueReservations = useMemo(() => {
    const all = Object.values(data).flat();
    return Array.from(new Map(all.map(item => [item.id, item])).values());
  }, [data]);

  const filteredSessions = useMemo(() => {
    if (selectedGroupId === "all") return allUniqueReservations;

    const selectedOption = groupOptions.find(opt => opt.value === selectedGroupId);
    if (!selectedOption) return [];

    const matchingSubgroupIds = Object.keys(data).filter(id => {
      const fullName = data[id][0]?.grupe_participante[0] || "";
      return fullName.startsWith(selectedOption.label);
    });

    const combined = matchingSubgroupIds.flatMap(id => data[id]);
    return Array.from(new Map(combined.map(item => [item.id, item])).values());
  }, [selectedGroupId, data, allUniqueReservations, groupOptions]);

  const sessionsOnSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return filteredSessions.filter((session) => {
      const sessionDate = parseISO(session.data);
      return sessionDate.toDateString() === selectedDate.toDateString();
    });
  }, [selectedDate, filteredSessions]);

  const eventDates = useMemo(() => {
    return filteredSessions.map(s => parseISO(s.data));
  }, [filteredSessions]);

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "rezervat": return "bg-blue-100 text-blue-700 border-blue-200";
      case "efectuată": return "bg-green-100 text-green-700 border-green-200";
      case "anulat": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-md">
        <CardHeader className="bg-slate-50/50 border-b mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <CalendarIcon className="h-6 w-6 text-primary" />
                Calendar Recuperări
              </CardTitle>
              <CardDescription className="text-base">
                Monitorizarea activităților didactice programate în afara orarului normal
              </CardDescription>
            </div>
            
            <div className="flex flex-col space-y-2">
              <Label className="text-sm font-medium">Filtrare Subgrupă</Label>
              <SearchSelect
                options={groupOptions}
                value={selectedGroupId}
                onChange={setSelectedGroupId}
                placeholder="Alege subgrupa..."
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="p-4 bg-white rounded-xl shadow-sm border w-full flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  locale={ro}
                  className="rounded-md"
                  modifiers={{ hasEvent: eventDates }}
                  modifiersStyles={{
                    hasEvent: { 
                      fontWeight: 'bold', 
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      color: '#2563eb',
                      borderRadius: '50%'
                    }
                  }}
                />
              </div>
              <div className="mt-6 p-4 bg-blue-50/50 rounded-lg border border-blue-100 w-full">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold">Legendă</p>
                    <p>Zilele marcate cu cerc albastru indică prezența unor recuperări programate.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="font-bold text-xl text-slate-800">
                  {selectedDate 
                    ? format(selectedDate, "eeee, d MMMM yyyy", { locale: ro })
                    : "Selectați o zi"}
                </h3>
                <Badge variant="secondary" className="px-3 py-1 text-sm">
                  {sessionsOnSelectedDate.length} Activități
                </Badge>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                   <div className="animate-spin rounded-full h-8 w-8 border-primary border-b-2 mb-4"></div>
                   <p className="text-slate-500">Se încarcă recuperările...</p>
                </div>
              ) : sessionsOnSelectedDate.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-xl border-2 border-dashed">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                  <p className="text-slate-500 font-medium">Nu există nicio activitate programată.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {sessionsOnSelectedDate.map((session) => (
                    <Card 
                      key={session.id} 
                      className="border-l-4 border-l-brand-blue shadow-sm hover:bg-gray-50/50 transition-colors overflow-hidden"
                    >
                      <CardContent className="p-5">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          
                          {/* Informații Materie și Profesor */}
                          <div className="space-y-3 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-bold text-lg text-slate-900">{session.materie}</h4>
                              <Badge className={`${getStatusStyle(session.status)} border shadow-none font-bold uppercase text-[10px]`}>
                                {session.status}
                              </Badge>
                            </div>
                            
                            <p className="text-sm font-semibold text-brand-blue -mt-2">
                              {session.profesor}
                            </p>

                            {/* Detalii Logistice (Grid orizontal similar cu cardul 2) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm font-medium">
                              <div className="flex items-center gap-2 text-gray-700">
                                <Clock className="h-4 w-4 text-brand-blue" />
                                <span>{session.ora_start}:00 - {session.ora_start + session.durata}:00</span>
                              </div>
                              
                              <div className="flex items-center gap-2 text-gray-700">
                                <MapPin className="h-4 w-4 text-brand-blue" />
                                <span>Sala {session.sala}</span>
                              </div>

                              <div className="flex items-center gap-2 text-gray-700">
                                <Users className="h-4 w-4 text-brand-blue" />
                                <div className="flex items-center gap-2">
                                  <span className="truncate">{session.grupe_participante.join(", ")}</span>
                                  {/* Badge pentru tipul materiei lângă grupă */}
                                  <Badge variant="secondary" className="bg-blue-50 text-brand-blue border-blue-100 text-[11px] h-5 px-1.5">
                                    {session.tip}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Opțional: Motiv anulare (dacă există) */}
                          {session.status === "anulat" && session.motiv_anulare && (
                            <div className="lg:max-w-[200px] p-2 bg-red-50 text-red-700 text-[11px] rounded border border-red-100 italic">
                              <strong>Motiv:</strong> {session.motiv_anulare}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}