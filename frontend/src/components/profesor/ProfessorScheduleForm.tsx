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

interface BackendSlot {
  sala_id: number;
  sala_nume: string;
  ora_start_int: number;
  ora_start_afisare: string;
  ora_final_int: number;
  ora_final_afisare: string;
}

interface BackendDay {
  zi_index: number;
  zi_nume: string;
  data: string;
  optiuni: BackendSlot[];
}

type BackendResponseSlots = Record<string, BackendDay[]>;

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
  const [allWeeks, setAllWeeks] = useState<{ label: string; value: string }[]>([]);
  const [selectedWeeks, setSelectedWeeks] = useState<string[]>([]);

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
  const hasShownStatusToast = useRef(false);

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
  const types = ["Curs", "Seminar", "Laborator", "Proiect"];

  // date inițiale
  useEffect(() => {
    const fetchInitialData = async () => {
      const email = localStorage.getItem("userEmail");
      if (!email) return;
      try {
        const [subResp, roomsResp, weeksResp] = await Promise.all([
          api.get(`/profesor/materii?email=${email}`),
          api.get("/data/sali"),
          api.get("/data/weeks") 
        ]);

        setSubjects(subResp.data.materii);
        setAllRooms(roomsResp.data.map((s: ApiRoom) => ({ label: s.nume, value: s.id.toString() })));
      
        const activeWeeks = weeksResp.data.active_weeks || [];
        
        // Dacă nu sunt săptămâni active, afișăm statusul actual
        if (activeWeeks.length === 0 && !hasShownStatusToast.current) {
          const statusMessage = weeksResp.data.current_status || "Sesiune/Vacanță";
          
          toast.info(statusMessage, { 
            duration: Infinity,
            description: "Nu mai există săptămâni de curs disponibile în acest semestru." 
          });
          
          // Marcăm că am afișat deja mesajul
          hasShownStatusToast.current = true;
        } else {
          const weekOptions = activeWeeks.map((w: number) => ({
              label: `Săptămâna ${w}`,
              value: w.toString()
          }));
          setAllWeeks(weekOptions);
        }
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

        const grupeData = gResp.data.grupe || gResp.data; 
        const saliData = sResp.data.sali || sResp.data;

        const groupsOptions = grupeData.map((g: ApiGroup) => ({
            label: `${g.specializationShortName} • an ${g.studyYear} • ${g.nume}${g.subgroupIndex ? `${g.subgroupIndex}` : ""}`,
            value: g.id.toString(),
        }));

        setAllGroups(groupsOptions);
        setSelectedGroups(grupeData.map((g: ApiGroup) => g.id.toString()));
        setSelectedRooms(saliData.map((s: ApiRoom) => s.id.toString()));
        
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

  const handleSearch = async () => {
    if (!selectedSubject || selectedGroups.length === 0 || selectedRooms.length === 0 || !duration || !selectedType || selectedWeeks.length === 0) {
      toast.error("Vă rugăm să completați toate câmpurile obligatorii");
      return;
    }

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
      setIsLoading(true); // Folosim starea de loading existentă sau una locală pentru buton
      const response = await api.post("/rezervari/cauta-libere", searchPayload);
      
      // Verificăm dacă există proprietatea 'info' (mesaj de la serviciu)
      if (response.data.info) {
        toast.info(response.data.info);
        onSearch({ selectedSubject }, []);
        return;
      }

      const slots = response.data.slots || [];
      
      if (Object.keys(slots).length === 0 || (Array.isArray(slots) && slots.length === 0)) {
        toast.info("Nu s-au găsit sloturi disponibile", {
          description: "Încercați să selectați alte săli sau să reduceți numărul de grupe."
        });
        onSearch({ selectedSubject }, []);
      } else {
        const flattenedSlots = transformBackendSlots(slots);
        onSearch({ selectedSubject }, flattenedSlots);
        toast.success(`Am găsit ${flattenedSlots.length} sloturi disponibile`);
      }
    } catch (error: any) {
      console.error("Search error:", error);
      toast.error(error.response?.data?.detail || "Eroare la căutarea sloturilor");
    } finally {
      setIsLoading(false);
    }
  };

  // Funcție utilitară pentru a converti formatul backend în AvailableSlot[]
  const transformBackendSlots = (backendData: BackendResponseSlots): AvailableSlot[] => {
    // Dacă backend-ul trimite deja un array plan:
    if (Array.isArray(backendData)) return backendData;

    // Dacă backend-ul trimite grupate pe săptămâni/zile (conform group_slots_for_ui):
    const results: AvailableSlot[] = [];
    
    Object.entries(backendData).forEach(([week, days]) => {
      days.forEach((dayData) => {
        // 'dayData' conține 'data' (string) și 'optiuni' (sloturi)
        dayData.optiuni.forEach((slot) => {
          results.push({
            id: `${slot.sala_id}-${slot.ora_start_int}-${week}-${dayData.zi_index}`,
            week: parseInt(week),
            date: new Date(dayData.data.split('.').reverse().join('-')), // Convertim DD.MM.YYYY în format acceptat de Date
            startTime: slot.ora_start_afisare,
            endTime: slot.ora_final_afisare,
            room: slot.sala_nume,
            capacity: parseInt(studentCount) || 0,
            availableGroups: selectedGroups.map(id => allGroups.find(g => g.value === id)?.label || id)
          });
        });
      });
    });
    return results;
  };

  const handleReset = () => {
    toast.dismiss();
    setSelectedSubject(""); setSelectedGroups([]); setSelectedRooms([]); setDuration("");
    setStudentCount(""); setSelectedDay(""); setSelectedWeeks([]);
    lastSyncedSubject.current = ""; setSelectedType("");
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

          {/* Select Tip Activitate */}
            <div className="space-y-2">
              <Label htmlFor="search-type" className="text-sm font-semibold text-gray-900">
                Tip activitate <span className="text-brand-red">*</span>
              </Label>
              <Select value={selectedType} onValueChange={setSelectedType}> 
                <SelectTrigger id="search-type" className="w-full focus-visible:ring-1 focus:ring-brand-blue/30 border-gray-200">
                  <SelectValue placeholder="Selectează tipul" />
                </SelectTrigger>
                <SelectContent>
                  {types.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Săptămâni */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-900">Săptămâni <span className="text-brand-red">*</span></Label>
            <MultiSelect 
              options={allWeeks} 
              selected={selectedWeeks} 
              onChange={setSelectedWeeks} 
              placeholder="Selectează săptămânile" 
              className={inputClasses} 
            />
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