"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MultiSelect } from "@/components/ui/multi-select"; 
import { Search, RotateCcw, Calendar, Clock, MapPin, Users, CheckCircle2, Filter, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import api from "@/services/api";

interface AvailableSlot {
  id: string;
  week: number;
  date: Date;
  startTime: string;
  endTime: string;
  room: string;
  capacity: number;
  availableGroups: string[];
}

// Interfețe pentru datele din API pentru a evita 'any'
interface ApiGroup {
  id: number;
  nume: string;
  subgroupIndex?: string;
}

interface ApiRoom {
  id: number;
  nume: string;
}

interface ApiProfessor {
  id: number;
  lastName: string;
  firstName: string;
  emailAddress: string;
}

export function ProfessorSchedule() {
  // State pentru datele din API
  const [subjects, setSubjects] = useState<string[]>([]);
  const [allGroups, setAllGroups] = useState<{ label: string; value: string }[]>([]);
  const [allRooms, setAllRooms] = useState<{ label: string; value: string }[]>([]);
  const [allProfessors, setAllProfessors] = useState<{ label: string; value: string }[]>([]);
  
  // State pentru selecții
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [duration, setDuration] = useState<string>("");
  const [studentCount, setStudentCount] = useState<string>("");
  const [selectedProfessors, setSelectedProfessors] = useState<string[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  
  // State încărcare
  const [isLoading, setIsLoading] = useState(true);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [sortBy, setSortBy] = useState<string>("week");

  const durations = ["1 oră", "2 ore", "3 ore", "4 ore"];
  const days = ["Luni", "Marți", "Miercuri", "Joi", "Vineri", "Sâmbătă", "Duminică"];

  const timeSlots = Array.from({ length: 13 }, (_, i) => {
    const hour = i + 8;
    return `${hour.toString().padStart(2, "0")}:00`;
  });

  // 1. Încărcare inițială date de bază
  useEffect(() => {
    const fetchInitialData = async () => {
        const email = localStorage.getItem("userEmail");
        if (!email) return;

        try {
        const [subResp, groupsResp, roomsResp, profsResp] = await Promise.all([
            api.get(`/profesor/materii?email=${email}`),
            api.get("/data/grupe"),
            api.get("/data/sali"),
            api.get("/data/profesori")
        ]);

        setSubjects(subResp.data.materii);
        setAllGroups(groupsResp.data.map((g: ApiGroup) => ({ 
            label: `${g.nume}${g.subgroupIndex ? `/${g.subgroupIndex}` : ""}`, 
            value: g.id.toString() 
        })));
        setAllRooms(roomsResp.data.map((s: ApiRoom) => ({ label: s.nume, value: s.id.toString() })));
        
        setAllProfessors(
            profsResp.data
            .filter((p: ApiProfessor) => p.emailAddress !== email)
            .map((p: ApiProfessor) => ({ 
                label: `${p.lastName} ${p.firstName}`, 
                value: p.id.toString() 
            }))
        );
        } catch {
        toast.error("Eroare la încărcarea datelor inițiale");
        } finally {
        setIsLoading(false);
        }
    };
    fetchInitialData();
   }, []);

  // 2. Sincronizare Grupe și Săli când se alege materia
  useEffect(() => {
    const syncOptions = async () => {
      if (!selectedSubject) return;
      const email = localStorage.getItem("userEmail");
      
      try {
        const [gResp, sResp] = await Promise.all([
          api.get(`/profesor/grupe-materie?email=${email}&materie=${selectedSubject}`),
          api.get(`/profesor/sali-materie?email=${email}&materie=${selectedSubject}`)
        ]);

        setSelectedGroups(gResp.data.grupe.map((g: ApiGroup) => g.id.toString()));
        setSelectedRooms(sResp.data.sali.map((s: ApiRoom) => s.id.toString()));
      } catch {
        console.error("Eroare la sincronizarea opțiunilor specifice materiei");
      }
    };
    syncOptions();
  }, [selectedSubject]);

  const handleSearch = () => {
    if (!selectedSubject || selectedGroups.length === 0 || selectedRooms.length === 0 || !duration) {
        toast.error("Vă rugăm să completați toate câmpurile obligatorii");
        return;
    }

    if (startTime) {
        const startHour = parseInt(startTime.split(":")[0]);
        const durationHours = parseInt(duration.split(" ")[0]);
        const endHour = startHour + durationHours;

        if (endHour > 22) {
        toast.error(
            `Ora de sfârșit (${endHour}:00) depășește limita sistemului (22:00). 
            Vă rugăm să alegeți o oră de start mai timpurie.`
        );
        return;
        }
    }

    const mockSlots: AvailableSlot[] = [
        { 
        id: "1", 
        week: 3, 
        date: new Date(2026, 1, 17, 14, 0), 
        startTime: startTime || "08:00", 
        endTime: startTime ? `${parseInt(startTime.split(":")[0]) + parseInt(duration.split(" ")[0])}:00` : "10:00",
        room: allRooms.find(r => r.value === selectedRooms[0])?.label || "Sala nespecificata", 
        capacity: parseInt(studentCount) || 20, 
        availableGroups: selectedGroups.map(val => allGroups.find(g => g.value === val)?.label || val)
        }
    ];

    setAvailableSlots(mockSlots);
    setHasSearched(true);
    toast.success(`Am găsit ${mockSlots.length} sloturi disponibile`);
  };

  const handleReset = () => {
    setSelectedSubject(""); 
    setSelectedGroups([]); 
    setSelectedRooms([]); 
    setDuration("");
    setStudentCount(""); 
    setSelectedProfessors([]); 
    setSelectedDay(""); 
    setStartTime("");
    setAvailableSlots([]); 
    setHasSearched(false);
  };

  const inputClasses = "h-10 w-full border-gray-200 text-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-brand-blue/30 focus-visible:border-brand-blue/50 transition-all duration-200 shadow-xs";
  const placeholderClasses = "text-muted-foreground font-normal";

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-brand-blue" /></div>;

  return (
    <div className="space-y-6">
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 font-semibold text-xl">
            <Search className="h-5 w-5 text-brand-blue" />
            Programare recuperare
          </CardTitle>
          <CardDescription className="text-gray-600 font-medium text-sm">
            Completați detaliile pentru a găsi sloturile disponibile pentru recuperare
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* 1. Materie */}
            <div className="space-y-2">
              <Label htmlFor="subject" className="text-sm font-semibold text-gray-900">
                Materia <span className="text-brand-red">*</span>
              </Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger id="subject" className={cn(inputClasses, !selectedSubject && placeholderClasses)}>
                  <SelectValue placeholder="Selectează materia" />
                </SelectTrigger>
                <SelectContent position="popper" className="max-h-64 text-sm">
                  {subjects.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* 2. Grupe */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-900">
                Grupe <span className="text-brand-red">*</span>
              </Label>
              <MultiSelect 
                options={allGroups}
                selected={selectedGroups}
                onChange={setSelectedGroups}
                placeholder="Selectează grupele"
                className={inputClasses}               
              />
            </div>

            {/* 3. Săli */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-900">
                Săli <span className="text-brand-red">*</span>
              </Label>
              <MultiSelect 
                options={allRooms}
                selected={selectedRooms}
                onChange={setSelectedRooms}
                placeholder="Selectează sălile"
                className={inputClasses}
              />
            </div>

            {/* 4. Durata */}
            <div className="space-y-2">
              <Label htmlFor="duration" className="text-sm font-semibold text-gray-900">
                Durata <span className="text-brand-red">*</span>
              </Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger id="duration" className={cn(inputClasses, !duration && placeholderClasses)}>
                  <SelectValue placeholder="Selectează durata" />
                </SelectTrigger>
                <SelectContent position="popper" className="max-h-64 text-sm">
                  {durations.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* 5. Număr persoane */}
            <div className="space-y-2">
            <Label htmlFor="student-count" className="text-sm font-semibold text-gray-900">Număr persoane</Label>
            <Input
                id="student-count"
                type="number"
                step="1" // Sugerează browserului pas de număr întreg
                onKeyDown={(e) => {
                // Previne introducerea punctului, virgulei sau a semnului minus
                if (["e", "E", ".", ",", "-"].includes(e.key)) {
                    e.preventDefault();
                }
                }}
                placeholder="Exemplu: 15"
                value={studentCount}
                onChange={(e) => {
                const val = e.target.value;
                // Permite string gol (pentru ștergere) sau doar cifre pozitive
                if (val === "" || /^\d+$/.test(val)) {
                    setStudentCount(val);
                }
                }}
                className={cn(inputClasses, "px-3")}
            />
            </div>

            {/* 6. Profesor asistent */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-900">Profesor asistent</Label>
              <MultiSelect 
                options={allProfessors}
                selected={selectedProfessors}
                onChange={setSelectedProfessors}
                placeholder="Selectează asistenții"
                className={inputClasses}
              />
            </div>

            {/* 7. Ziua */}
            <div className="space-y-2">
              <Label htmlFor="day" className="text-sm font-semibold text-gray-900">Ziua</Label>
              <Select value={selectedDay} onValueChange={setSelectedDay}>
                <SelectTrigger id="day" className={cn(inputClasses, !selectedDay && placeholderClasses)}>
                  <SelectValue placeholder="Selectează ziua" />
                </SelectTrigger>
                <SelectContent position="popper" className="max-h-64 text-sm">
                  {days.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* 8. Ora de start */}
            <div className="space-y-2">
            <Label htmlFor="start-time" className="text-sm font-semibold text-gray-900">
                Ora de start
            </Label>
            <Select value={startTime} onValueChange={setStartTime}>
                <SelectTrigger 
                id="start-time" 
                className={cn(inputClasses, !startTime && placeholderClasses)}
                >
                <SelectValue placeholder="Selectează ora" />
                </SelectTrigger>
                <SelectContent position="popper" className="max-h-64 text-sm font-sans">
                {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                    {time}
                    </SelectItem>
                ))}
                </SelectContent>
            </Select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button 
              onClick={handleSearch} 
              className="bg-brand-blue hover:bg-brand-blue-dark text-white font-medium shadow-md transition-all active:scale-95 flex-1 sm:flex-none"
            >
              <Search className="h-4 w-4 mr-2" />
              Caută
            </Button>
            <Button 
              onClick={handleReset} 
              variant="outline" 
              className="border-gray-200 text-gray-700 font-medium hover:bg-gray-50 flex-1 sm:flex-none"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Resetează
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Rezultate */}
      {hasSearched && (
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-lg font-bold">Sloturi Disponibile</CardTitle>
              <CardDescription className="font-medium text-gray-600 text-sm">
                Am găsit {availableSlots.length} sloturi pentru săptămânile 1-14
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-45 h-8 text-xs border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="text-xs">
                  <SelectItem value="week">După săptămână</SelectItem>
                  <SelectItem value="date">După dată</SelectItem>
                  <SelectItem value="time">După oră</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {availableSlots.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Search className="h-10 w-10 mx-auto mb-4 opacity-20" />
                <p className="font-medium">Nu s-au găsit sloturi disponibile</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {availableSlots.map((slot) => (
                  <Card key={slot.id} className="border-l-4 border-l-brand-blue shadow-sm hover:bg-gray-50/50 transition-colors">
                    <CardContent className="pt-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-blue-50 text-brand-blue border-blue-100 font-bold">
                              Săptămâna {slot.week}
                            </Badge>
                            <Badge variant="outline" className="gap-1 border-green-200 text-green-700 bg-green-50 font-bold text-[10px] uppercase tracking-wider">
                              <CheckCircle2 className="h-3 w-3" />
                              Disponibil
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm font-medium">
                            <div className="flex items-center gap-2 text-gray-700">
                              <Calendar className="h-4 w-4 text-brand-blue" />
                              <span>{slot.date.toLocaleDateString("ro-RO", { weekday: "long", day: "numeric", month: "long" })}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-700">
                              <Clock className="h-4 w-4 text-brand-blue" />
                              <span>{slot.startTime} - {slot.endTime}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-700">
                              <MapPin className="h-4 w-4 text-brand-blue" />
                              <span>Sala {slot.room}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-700">
                              <Users className="h-4 w-4 text-brand-blue" />
                              <span>Max: {slot.capacity}</span>
                            </div>
                          </div>
                        </div>
                        <Button className="bg-brand-blue hover:bg-brand-blue-dark text-white font-bold shadow-sm active:scale-95">
                          Rezervă Slot
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}