"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/ui/multi-select"; 
import { Search, RotateCcw, Loader2, InfoIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import api from "@/services/api";
import { Grupa  as ApiGroup } from "@/components/student/StudentSearch";
import { RawSlotsResponse } from "./ProfessorSchedule";

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

export interface SelectOption {
  label: string;
  value: string;
}

export interface SearchFilters {
  selectedSubject: string;
  selectedGroups: string[];
  selectedType: string; 
  duration: string;
  allRooms: SelectOption[];
  allGroups: SelectOption[];
  studentCount: string;
}

interface ProfessorScheduleFormProps {
  onSearch: (filters: SearchFilters | null, results: RawSlotsResponse) => void;
}

export function ProfessorScheduleForm({ onSearch }: ProfessorScheduleFormProps) {
  const [subjects, setSubjects] = useState<string[]>([]);
  const [activityTypes, setActivityTypes] = useState<string[]>([]);
  const [allGroups, setAllGroups] = useState<{ label: string; value: string }[]>([]);
  const [allRooms, setAllRooms] = useState<{ label: string; value: string }[]>([]);
  const [allWeeks, setAllWeeks] = useState<{ label: string; value: string }[]>([]);
  const [selectedWeeks, setSelectedWeeks] = useState<string[]>([]);
  const [isValidatingWeeks, setIsValidatingWeeks] = useState(false);

  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [duration, setDuration] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [studentCount, setStudentCount] = useState<string>("");
  const [selectedDay, setSelectedDay] = useState<string>("");
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false); 
  const lastSyncedSubject = useRef<string>("");

  const durations = ["1 oră", "2 ore", "3 ore", "4 ore"];
  const DAYS_MAP: Record<string, number> = {
    "Luni": 1,
    "Marți": 2,
    "Miercuri": 3,
    "Joi": 4,
    "Vineri": 5,
    "Sâmbătă": 6,
    "Duminică": 7
  };

  // date inițiale
  useEffect(() => {
    const fetchInitialData = async () => {
      const email = localStorage.getItem("userEmail");
      if (!email) return;
      try {
        const [subResp, roomsResp] = await Promise.all([
          api.get(`/profesor/materii?email=${email}`),
          api.get("/data/sali"),
        ]);
        setSubjects(subResp.data.materii);
        setAllRooms(roomsResp.data.map((s: ApiRoom) => ({ label: s.nume, value: s.id.toString() })));
      } catch {
        toast.error("Eroare la încărcarea datelor inițiale");
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const fetchValidWeeks = async (groupIds: string[]) => {
    if (groupIds.length === 0) {
      setAllWeeks([]);
      return;
    }
    setIsValidatingWeeks(true);
    try {
      const response = await api.post("/data/weeks-valide", { 
        grupe_ids: groupIds.map(id => parseInt(id)) 
      });
      const weeks = response.data.active_weeks || [];
      
      const options = weeks.map((w: number) => ({
        label: `Săptămâna ${w}`,
        value: w.toString()
      }));
      
      setAllWeeks(options);

      setSelectedWeeks(prev => prev.filter(w => weeks.includes(parseInt(w))));
    } catch (error) {
      console.error("Eroare la validarea săptămânilor:", error);
    } finally {
      setIsValidatingWeeks(false);
    }
  };

  // Sincronizare Grupe și Săli
  useEffect(() => {
    const syncOptions = async () => {
      // Nu sincronizăm dacă nu avem materie sau dacă este aceeași materie ca ultima dată
      if (!selectedSubject || selectedSubject === lastSyncedSubject.current) return;
      
      const email = localStorage.getItem("userEmail");
      setIsSyncing(true);
      setSelectedGroups([]); // Resetăm grupele vechi
      setSelectedRooms([]);  // Resetăm sălile vechi
      setSelectedWeeks([]);  // Resetăm săptămânile vechi

      try {
        const [gResp, sResp, tResp] = await Promise.all([
          api.get(`/profesor/grupe-materie?email=${email}&materie=${selectedSubject}`),
          api.get(`/profesor/sali-materie?email=${email}&materie=${selectedSubject}`),
          api.get(`/data/tipuri-activitate-profesor?email=${email}&materie=${selectedSubject}`)
        ]);

        const grupeData = gResp.data.grupe || gResp.data; 
        const saliData = sResp.data.sali || sResp.data;
        const tipuriData = tResp.data; 

        const groupsOptions = grupeData.map((g: ApiGroup) => ({
            label: `${g.specializationShortName} • an ${g.studyYear} • ${g.nume}${g.subgroupIndex ? `${g.subgroupIndex}` : ""}`,
            value: g.id.toString(),
        }));

        setAllGroups(groupsOptions);
        setActivityTypes(tipuriData); // Actualizăm state-ul pentru select-ul de activități
        
        // Auto-selectăm primul tip de activitate dacă există doar unul
        if (tipuriData.length >= 1) {
          setSelectedType(tipuriData[0]);
        } else {
          setSelectedType(""); // Resetăm selecția dacă se schimbă materia
        }

        setSelectedGroups(grupeData.map((g: ApiGroup) => g.id.toString()));
        setSelectedRooms(saliData.map((s: ApiRoom) => s.id.toString()));
        
        const ids = grupeData.map((g: ApiGroup) => g.id.toString());
        await fetchValidWeeks(ids);
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

  useEffect(() => {
    // Adăugăm isSyncing în check pentru a nu apela de două ori la rând când se schimbă materia
    if (selectedSubject && !isSyncing) {
        fetchValidWeeks(selectedGroups);
    }
    // Adăugăm dependențele cerute de ESLint pentru a asigura consistența datelor
  }, [selectedGroups, selectedSubject, isSyncing]);

  const handleSearch = async () => {
    toast.dismiss();
    if (!selectedSubject || selectedGroups.length === 0 || selectedRooms.length === 0 || !duration || !selectedType || selectedWeeks.length === 0) {
      toast.error("Completați toate câmpurile obligatorii");
      return;
    }

    onSearch(null, {});

    const searchPayload = {
      email: localStorage.getItem("userEmail"),
      materie: selectedSubject,
      grupe_ids: selectedGroups.map(id => parseInt(id)),
      sali_ids: selectedRooms.map(id => parseInt(id)),
      durata: duration ? parseInt(duration.split(" ")[0]) : null,
      tip_activitate: selectedType,
      numar_persoane: studentCount ? parseInt(studentCount) : null,
      zi: selectedDay ? DAYS_MAP[selectedDay] : null,
      saptamani: selectedWeeks.map(w => parseInt(w))
    };

    try {
      setIsLoading(true);
      const response = await api.post("/rezervari/cauta-libere", searchPayload);
      
      if (response.data.info) {
        toast.info(response.data.info, { duration: 7000});
        onSearch(null, {}); // Ascundem rezultatele
        return;
      }

      onSearch({ 
        selectedSubject, 
        selectedGroups, 
        selectedType,
        duration,
        allRooms, 
        allGroups, 
        studentCount 
      }, response.data.slots);

    } catch (error: unknown) {
      let errorMessage = "Eroare la căutare";
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { data?: { detail?: string } } };
        errorMessage = axiosError.response.data?.detail || errorMessage;
      }
      
      onSearch(null, {});
  
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    toast.dismiss();
    setSelectedSubject(""); setSelectedGroups([]); setSelectedRooms([]); setDuration("");
    setStudentCount(""); setSelectedDay(""); setSelectedWeeks([]);
    lastSyncedSubject.current = ""; setSelectedType("");
    onSearch(null, {});
    setActivityTypes([]);
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

            {/* Select Tip Activitate */}
          <div className="space-y-2">
            <Label htmlFor="search-type" className="text-sm font-semibold text-gray-900">
              Tip activitate <span className="text-brand-red">*</span>
            </Label>
            <Select 
              value={selectedType} 
              onValueChange={setSelectedType}
              disabled={!selectedSubject || isSyncing} // Blocat până avem materie
            > 
              <SelectTrigger id="search-type" className={cn(inputClasses, !selectedType && placeholderClasses)}>
                <SelectValue placeholder={isSyncing ? "Se încarcă..." : "Selectează tipul"} />
              </SelectTrigger>
              <SelectContent>
                {activityTypes.length > 0 ? (
                  activityTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-xs text-muted-foreground text-center">
                    Niciun tip de activitate găsit
                  </div>
                )}
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

            {/* Săptămâni - Acum depinde de selecția de mai sus */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-900">Săptămâni <span className="text-brand-red">*</span></Label>
            <div className="relative">
                <MultiSelect 
                  options={allWeeks} 
                  selected={selectedWeeks} 
                  onChange={setSelectedWeeks} 
                  disabled={!selectedSubject || isValidatingWeeks}
                  placeholder={
                    !selectedSubject 
                    ? "Selectează materia mai întâi" 
                    : isValidatingWeeks ? "Se verifică calendarul..." : "Selectează săptămânile"
                  } 
                  className={cn(inputClasses, (!selectedSubject || isValidatingWeeks) && "opacity-50 bg-gray-50")} 
                />
                {isValidatingWeeks && <Loader2 className="absolute right-8 top-3 h-4 w-4 animate-spin text-brand-blue" />}
            </div>
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
                {Object.keys(DAYS_MAP).map((dayName) => (
                  <SelectItem key={dayName} value={dayName}>
                    {dayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Mesaj Atenționare*/}
        <div className="relative w-full rounded-lg border border-amber-200 bg-amber-50 p-4 [&>svg~*]:pl-7 [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-amber-600">
          <InfoIcon className="h-4 w-4" />
          <div className="text-xs sm:text-sm font-medium text-amber-800 leading-relaxed">
            Rezultatele sunt generate pe baza disponibilității orarului general, însă este esențial să le verificați. 
            <span className="block">
              Notă: Puteți planifica recuperări exclusiv pentru grupele la care sunteți titularul activității respective.
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button onClick={handleSearch} disabled={allWeeks.length === 0} className="bg-brand-blue hover:bg-brand-blue-dark text-white font-medium shadow-md transition-all active:scale-95 flex-1 sm:flex-none">
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