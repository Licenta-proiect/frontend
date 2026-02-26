"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/ui/multi-select"; 
import { Search, RotateCcw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import api from "@/services/api";
import { Grupa  as ApiGroup } from "@/components/student/StudentSearch";

// Interfețe pentru tipizare
interface ApiRoom { id: number; nume: string; }

// Definirea tipurilor pentru rezultate și filtre pentru a evita "any"
export interface AvailableSlot {
  id: string;
  week: number;
  date: Date;
  startTime: string;
  endTime: string;
  room: string;
  capacity: number;
  availableGroups: string[];
}

export interface SearchFilters {
  selectedSubject: string;
  [key: string]: unknown; 
}

interface ProfessorScheduleFormProps {
  onSearch: (filters: SearchFilters | null, results: AvailableSlot[]) => void;
}

export function ProfessorScheduleForm({ onSearch }: ProfessorScheduleFormProps) {
  const [subjects, setSubjects] = useState<string[]>([]);
  const [allGroups, setAllGroups] = useState<{ label: string; value: string }[]>([]);
  const [allRooms, setAllRooms] = useState<{ label: string; value: string }[]>([]);
  
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [duration, setDuration] = useState<string>("");
  const [studentCount, setStudentCount] = useState<string>("");
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false); 
  const lastSyncedSubject = useRef<string>("");

  const durations = ["1 oră", "2 ore", "3 ore", "4 ore"];
  const days = ["Luni", "Marți", "Miercuri", "Joi", "Vineri", "Sâmbătă", "Duminică"];
  const timeSlots = Array.from({ length: 13 }, (_, i) => `${(i + 8).toString().padStart(2, "0")}:00`);

  // date inițiale
  useEffect(() => {
    const fetchInitialData = async () => {
      const email = localStorage.getItem("userEmail");
      if (!email) return;
      try {
        const [subResp, groupsResp, roomsResp] = await Promise.all([
          api.get(`/profesor/materii?email=${email}`),
          api.get("/data/grupe"),
          api.get("/data/sali")
        ]);

        setSubjects(subResp.data.materii);
        setAllGroups(
          groupsResp.data.map((g: ApiGroup) => ({
            label: `${g.specializationShortName} • an ${g.studyYear} • ${g.nume}${g.subgroupIndex ? `${g.subgroupIndex}` : ""}`,
            value: g.id.toString(),
          }))
        );
        setAllRooms(roomsResp.data.map((s: ApiRoom) => ({ label: s.nume, value: s.id.toString() })));
      } catch {
        toast.error("Eroare la încărcarea datelor inițiale");
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Sincronizare Grupe și Săli
  useEffect(() => {
    const syncOptions = async () => {
      // Nu sincronizăm dacă nu avem materie sau dacă este aceeași materie ca ultima dată
      if (!selectedSubject || selectedSubject === lastSyncedSubject.current) return;

      const email = localStorage.getItem("userEmail");
      setIsSyncing(true); // Activăm starea de încărcare locală

      try {
        const [gResp, sResp] = await Promise.all([
          api.get(`/profesor/grupe-materie?email=${email}&materie=${selectedSubject}`),
          api.get(`/profesor/sali-materie?email=${email}&materie=${selectedSubject}`)
        ]);

        setSelectedGroups(gResp.data.grupe.map((g: ApiGroup) => g.id.toString()));
        setSelectedRooms(sResp.data.sali.map((s: ApiRoom) => s.id.toString()));
        
        lastSyncedSubject.current = selectedSubject; // Memorăm ultima materie sincronizată
      } catch {
        console.error("Eroare la sincronizarea opțiunilor");
        toast.error("Nu s-au putut prelua grupele specifice materiei");
      } finally {
        setIsSyncing(false); // Dezactivăm starea de încărcare
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
      if (startHour + durationHours > 22) {
        toast.error(`Ora de sfârșit depășește limita sistemului (22:00).`);
        return;
      }
    }

    // Mock results (care vor fi trimise parintelui)
    const mockResults = [{ 
      id: "1", week: 3, date: new Date(2026, 1, 17, 14, 0), 
      startTime: startTime || "08:00", 
      endTime: startTime ? `${parseInt(startTime.split(":")[0]) + parseInt(duration.split(" ")[0])}:00` : "10:00",
      room: allRooms.find(r => r.value === selectedRooms[0])?.label || "Sala nespecificata", 
      capacity: parseInt(studentCount) || 20, 
      availableGroups: selectedGroups.map(val => allGroups.find(g => g.value === val)?.label || val)
    }];

    onSearch({ selectedSubject }, mockResults);
    toast.success(`Am găsit ${mockResults.length} sloturi disponibile`);
  };

  const handleReset = () => {
    setSelectedSubject(""); setSelectedGroups([]); setSelectedRooms([]); setDuration("");
    setStudentCount(""); setSelectedDay(""); setStartTime("");
    lastSyncedSubject.current = "";
    onSearch(null, []);
  };

  const inputClasses = "min-h-10 w-full border-gray-200 text-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-brand-blue/30 focus-visible:border-brand-blue/50 transition-all duration-200 shadow-xs";
  const placeholderClasses = "text-muted-foreground font-normal";

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-brand-blue" /></div>;

  return (
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
            {/*Materia*/}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-900">Materia <span className="text-brand-red">*</span></Label>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className={cn(inputClasses, !selectedSubject && placeholderClasses)}>
                <SelectValue placeholder="Selectează materia" />
              </SelectTrigger>
              <SelectContent position="popper" className="max-h-64 text-sm">
                {subjects.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

            {/* Grupe - Blocat până la selectarea materiei */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-900">Grupe <span className="text-brand-red">*</span></Label>
            <div className="relative">
                <MultiSelect 
                options={allGroups} 
                selected={selectedGroups} 
                onChange={setSelectedGroups} 
                // Dezactivat dacă nu e selectată materia SAU dacă se sincronizează
                disabled={!selectedSubject || isSyncing}
                placeholder={
                    !selectedSubject 
                    ? "Selectează materia mai întâi" 
                    : isSyncing 
                        ? "Se încarcă grupele..." 
                        : "Selectează grupele"
                } 
                className={cn(
                    inputClasses, 
                    (!selectedSubject || isSyncing) && "opacity-50 cursor-not-allowed bg-gray-50"
                )} 
                />
                {isSyncing && <Loader2 className="absolute right-8 top-3 h-4 w-4 animate-spin text-brand-blue" />}
            </div>
          </div>

            {/* Săli - Blocat până la selectarea materiei */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-900">Săli <span className="text-brand-red">*</span></Label>
            <div className="relative">
                <MultiSelect 
                options={allRooms} 
                selected={selectedRooms} 
                onChange={setSelectedRooms} 
                // Dezactivat dacă nu e selectată materia SAU dacă se sincronizează
                disabled={!selectedSubject || isSyncing}
                placeholder={
                    !selectedSubject 
                    ? "Selectează materia mai întâi" 
                    : isSyncing 
                        ? "Se încarcă sălile..." 
                        : "Selectează sălile"
                } 
                className={cn(
                    inputClasses, 
                    (!selectedSubject || isSyncing) && "opacity-50 cursor-not-allowed bg-gray-50"
                )} 
                />
                {isSyncing && <Loader2 className="absolute right-8 top-3 h-4 w-4 animate-spin text-brand-blue" />}
            </div>
          </div>

            {/*Durata*/}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-900">Durata <span className="text-brand-red">*</span></Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger className={cn(inputClasses, !duration && placeholderClasses)}>
                <SelectValue placeholder="Selectează durata" />
              </SelectTrigger>
              <SelectContent position="popper" className="max-h-64 text-sm">
                {durations.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

            {/*Număr persoane*/}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-900">Număr persoane</Label>
            <Input type="number" step="1" onKeyDown={(e) => ["e", "E", ".", ",", "-"].includes(e.key) && e.preventDefault()} placeholder="Exemplu: 15" value={studentCount} onChange={(e) => (e.target.value === "" || /^\d+$/.test(e.target.value)) && setStudentCount(e.target.value)} className={cn(inputClasses, "px-3")} />
          </div>

            {/*Ziua*/}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-900">Ziua</Label>
            <Select value={selectedDay} onValueChange={setSelectedDay}>
              <SelectTrigger className={cn(inputClasses, !selectedDay && placeholderClasses)}>
                <SelectValue placeholder="Selectează ziua" />
              </SelectTrigger>
              <SelectContent position="popper" className="max-h-64 text-sm">
                {days.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

            {/*Ora de start*/}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-900">Ora de start</Label>
            <Select value={startTime} onValueChange={setStartTime}>
              <SelectTrigger className={cn(inputClasses, !startTime && placeholderClasses)}>
                <SelectValue placeholder="Selectează ora" />
              </SelectTrigger>
              <SelectContent position="popper" className="max-h-64 text-sm">
                {timeSlots.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button onClick={handleSearch} className="bg-brand-blue hover:bg-brand-blue-dark text-white font-medium shadow-md transition-all active:scale-95 flex-1 sm:flex-none">
            <Search className="h-4 w-4 mr-2" /> Caută
          </Button>
          <Button onClick={handleReset} variant="outline" className="border-gray-200 text-gray-700 font-medium hover:bg-gray-50 flex-1 sm:flex-none">
            <RotateCcw className="h-4 w-4 mr-2" /> Resetează
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}