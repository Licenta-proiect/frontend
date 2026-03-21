import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { 
  FileText, Filter, Calendar as CalendarIcon, Clock, 
  MapPin, Search, Download, Users, AlertCircle, RefreshCcw 
} from "lucide-react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { ro } from "date-fns/locale";
import api from "@/services/api";
import { cn } from "@/lib/utils";

interface Reservation {
  id: number;
  professor: string;
  professor_email: string;
  subject: string;
  type: string;
  room: string;
  groups: string[];
  date: string; // ISO
  start_hour: number;
  duration: number;
  status: string;
  cancellation_reason: string | null;
}

export function AdminHistory() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [professors, setProfessors] = useState<{ id: number; lastName: string; firstName: string }[]>([]);
  const [rooms, setRooms] = useState<{ id: number; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterProfessor, setFilterProfessor] = useState<string>("all");
  const [filterWeek, setFilterWeek] = useState<string>("all");
  const [filterRoom, setFilterRoom] = useState<string>("all");

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [resReq, profReq, roomReq] = await Promise.all([
        api.get("/admin/reservations"),
        api.get("/data/professors"),
        api.get("/data/rooms")
      ]);
      setReservations(resReq.data);
      setProfessors(profReq.data);
      setRooms(roomReq.data);
    } catch (error) {
      toast.error("Eroare la încărcarea datelor de administrare.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredRecords = useMemo(() => {
    return reservations.filter((r) => {
      const matchStatus = filterStatus === "all" || r.status.toLowerCase() === filterStatus.toLowerCase();
      const matchProf = filterProfessor === "all" || r.professor === filterProfessor;
      const matchRoom = filterRoom === "all" || r.room === filterRoom;
      // Notă: Filtrarea pe săptămână ar necesita week_number în obiectul Reservation din backend
      return matchStatus && matchProf && matchRoom;
    });
  }, [reservations, filterStatus, filterProfessor, filterRoom]);

  const handleReset = () => {
    setFilterStatus("all");
    setFilterProfessor("all");
    setFilterRoom("all");
    setFilterWeek("all");
  };

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "reserved": return "bg-blue-50 text-brand-blue border-blue-100 font-bold";
      case "completed": return "bg-green-50 text-green-700 border-green-100 font-bold";
      case "cancelled": return "bg-red-50 text-brand-red border-red-100 font-bold";
      default: return "bg-gray-50 text-gray-700 border-gray-100 font-bold";
    }
  };

  const handleExportCSV = () => {
    if (filteredRecords.length === 0) {
      toast.error("Nu există date de exportat");
      return;
    }
    const headers = ["Data", "Ora", "Materie", "Tip", "Profesor", "Sala", "Grupe", "Status", "Motiv Anulare"];
    const rows = filteredRecords.map(r => [
      format(parseISO(r.date), "yyyy-MM-dd"),
      `${r.start_hour}:00 - ${r.start_hour + r.duration}:00`,
      r.subject,
      r.type,
      r.professor,
      r.room,
      r.groups.join(" | "),
      r.status,
      r.cancellation_reason || "-"
    ]);

    const csvContent = "\ufeff" + [headers.join(","), ...rows.map(row => row.map(cell => `"${cell}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `istoric_admin_${format(new Date(), "dd-MM-yyyy")}.csv`);
    link.click();
    toast.success("Fișierul CSV a fost generat.");
  };

  return (
    <div className="space-y-6">
      {/* Filters Card */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 font-semibold text-xl">
            <Filter className="h-5 w-5 text-brand-blue" />
            Panou Control Istoric
          </CardTitle>
          <CardDescription className="text-gray-600 font-medium">
            Monitorizarea și filtrarea tuturor activităților din sistem
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="border-gray-200">
                  <SelectValue placeholder="Toate" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toate Statusurile</SelectItem>
                  <SelectItem value="reserved">Programate</SelectItem>
                  <SelectItem value="completed">Finalizate</SelectItem>
                  <SelectItem value="cancelled">Anulate</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Profesor</Label>
              <Select value={filterProfessor} onValueChange={setFilterProfessor}>
                <SelectTrigger className="border-gray-200">
                  <SelectValue placeholder="Toți profesorii" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toți Profesorii</SelectItem>
                  {professors.map((p) => (
                    <SelectItem key={p.id} value={`${p.lastName} ${p.firstName}`}>
                      {p.lastName} {p.firstName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Sală</Label>
              <Select value={filterRoom} onValueChange={setFilterRoom}>
                <SelectTrigger className="border-gray-200">
                  <SelectValue placeholder="Toate sălile" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toate Sălile</SelectItem>
                  {rooms.map((room) => (
                    <SelectItem key={room.id} value={room.name}>
                      Sala {room.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end gap-2">
              <Button onClick={handleReset} variant="outline" className="flex-1 border-gray-200">
                <RefreshCcw className="h-4 w-4 mr-2" /> Resetează
              </Button>
              <Button onClick={handleExportCSV} className="flex-1 bg-brand-blue hover:bg-brand-blue/90">
                <Download className="h-4 w-4 mr-2" /> Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <FileText className="h-5 w-5 text-brand-blue" />
            Rezultate Filtrare
          </h3>
          <Badge variant="secondary" className="bg-blue-50 text-brand-blue border-blue-100">
            {filteredRecords.length} înregistrări
          </Badge>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border">
            <div className="animate-spin rounded-full h-8 w-8 border-brand-blue border-b-2 mb-4"></div>
            <p className="text-slate-500">Se încarcă datele din server...</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-xl border-2 border-dashed">
            <Search className="h-12 w-12 mx-auto mb-4 text-slate-300" />
            <p className="text-slate-500 font-medium italic">Nu s-a găsit nicio înregistrare conform filtrelor.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredRecords.map((session) => {
              const isCanceled = session.status.toLowerCase() === "cancelled";
              const sessionDate = parseISO(session.date);

              return (
                <Card 
                  key={session.id} 
                  className={cn(
                    "border shadow-sm group transition-all duration-300 border-l-4",
                    isCanceled ? "border-l-brand-red opacity-85" : "border-l-brand-blue hover:border-brand-blue"
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
                                <Badge variant="outline" className={cn(getStatusStyle(session.status), "text-[10px] uppercase")}>
                                    {session.status === "reserved" ? "PROGRAMATĂ" : session.status === "completed" ? "FINALIZATĂ" : "ANULATĂ"}
                                </Badge>
                                <Badge variant="secondary" className="bg-gray-100 text-[10px] uppercase font-bold">
                                    {session.type}
                                </Badge>
                            </div>
                          </div>
                          <p className="text-sm font-semibold text-brand-blue">{session.professor}</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium text-gray-700">
                          <div className="flex items-center gap-1.5">
                            <CalendarIcon className="h-4 w-4 text-brand-blue" />
                            <span>{format(sessionDate, "dd MMM yyyy", { locale: ro })}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4 text-brand-blue" />
                            <span>{String(session.start_hour).padStart(2, '0')}:00 - {String(session.start_hour + session.duration).padStart(2, '0')}:00</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-4 w-4 text-brand-blue" />
                            <span>Sala {session.room}</span>
                          </div>
                          <div className="flex items-start gap-1.5">
                            <Users className="h-4 w-4 text-brand-blue shrink-0 mt-0.5" />
                            <span className="leading-tight truncate max-w-[300px]">{session.groups.join(", ")}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {isCanceled && session.cancellation_reason && (
                      <div className="text-xs p-3 rounded-lg bg-red-50/50 border border-red-100 flex items-start gap-2">
                        <AlertCircle className="h-3.5 w-3.5 text-brand-red shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-brand-red mr-2">Motiv anulare:</span>
                          <span className="text-gray-700 italic">"{session.cancellation_reason}"</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}