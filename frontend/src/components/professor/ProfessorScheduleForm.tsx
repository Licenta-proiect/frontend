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
import { Group  as ApiGroup } from "@/components/student/StudentSearch";
import { RawSlotsResponse } from "./ProfessorSchedule";

// Type definitions
export interface ApiRoom { id: number; name: string; }

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
  const [allGroups, setAllGroups] = useState<SelectOption[]>([]);
  const [allRooms, setAllRooms] = useState<SelectOption[]>([]);
  const [allWeeks, setAllWeeks] = useState<SelectOption[]>([]);
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
  const [isSearching, setIsSearching] = useState(false);
  const [isSyncingTypes, setIsSyncingTypes] = useState(false);
  const [isSyncingGroups, setIsSyncingGroups] = useState(false);

  const hasShownStatusToast = useRef(false); 

  const durations = ["1 oră", "2 ore", "3 ore", "4 ore"];
  const DAYS_MAP: Record<string, number> = {
    "Luni": 1,
    "Marți": 2,
    "Miercuri": 3,
    "Joi": 4,
    "Vineri": 5,
    "Sâmbătă": 6,
  };

  // Initial data fetching
  useEffect(() => {
    const fetchInitialData = async () => {
      const email = localStorage.getItem("userEmail");
      if (!email) return;
      try {
        const [subResp, roomsResp, weeksResp] = await Promise.all([
          api.get(`/professor/subjects?email=${email}`),
          api.get("/data/rooms"),
          api.get("/data/weeks") // Endpoint returning semester status
        ]);
        setSubjects(subResp.data.subjects);
        setAllRooms(roomsResp.data.map((r: ApiRoom) => ({ label: r.name, value: r.id.toString() })));
      
        const activeWeeks = weeksResp.data.active_weeks || [];
        if (activeWeeks.length === 0 && !hasShownStatusToast.current) {
          const statusMessage = weeksResp.data.current_status || "Sesiune/Vacanță";
          toast.info(statusMessage, { 
            duration: Infinity, // Persistent message
            description: "Nu mai există săptămâni de curs disponibile în acest semestru." 
          });
          hasShownStatusToast.current = true;
        }
      } catch {
        toast.error("Eroare la încărcarea datelor inițiale");
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // When SUBJECT changes: Reset lower selections and fetch activity TYPES
  useEffect(() => {
    const fetchTypes = async () => {
      if (!selectedSubject) {
        setActivityTypes([]);
        setSelectedType("");
        return;
      }
      const email = localStorage.getItem("userEmail");
      setIsSyncingTypes(true);
      
      // Reset dependencies
      setSelectedType("");
      setAllGroups([]);
      setSelectedGroups([]);
      setSelectedWeeks([]);

      try {
        const tResp = await api.get(`/data/professor-activity-types?email=${email}&subject=${selectedSubject}`);
        setActivityTypes(tResp.data);
        if (tResp.data.length >= 1) setSelectedType(tResp.data[0]);
      } catch {
        toast.error("Eroare la preluarea tipurilor de activitate");
      } finally {
        setIsSyncingTypes(false);
      }
    };
    fetchTypes();
  }, [selectedSubject]);

  // When SUBJECT changes: Fetch ROOMS (only once per subject change)
  useEffect(() => {
    const fetchRooms = async () => {
      if (!selectedSubject) {
        setSelectedRooms([]);
        return;
      }
      const email = localStorage.getItem("userEmail");
      try {
        const sResp = await api.get(`/professor/rooms-by-subject?email=${email}&subject=${selectedSubject}&activity_type=${selectedType}`);
        const roomsData = sResp.data.rooms || [];
        setSelectedRooms(roomsData.map((s: ApiRoom) => s.id.toString()));
      } catch {
        toast.error("Eroare la încărcarea sălilor");
      }
    };
    fetchRooms();
  }, [selectedSubject, selectedType]);

  // When SUBJECT or TYPE changes: Sync GROUPS
  useEffect(() => {
    const syncGroups = async () => {
      if (!selectedSubject || !selectedType) {
        setAllGroups([]);
        setSelectedGroups([]);
        return;
      }

      const email = localStorage.getItem("userEmail");
      setIsSyncingGroups(true);

      try {
        const gResp = await api.get(`/professor/groups-by-subject?email=${email}&subject=${selectedSubject}&activity_type=${selectedType}`);

        const groupsData = gResp.data.groups || [];
        const groupsOptions = groupsData.map((g: ApiGroup) => ({
          label: `${g.specializationShortName} • an ${g.studyYear} • ${g.name}${g.subgroupIndex ? `${g.subgroupIndex}` : ""}`,
          value: g.id.toString(),
        }));

        setAllGroups(groupsOptions);
        setSelectedGroups(groupsData.map((g: ApiGroup) => g.id.toString()));
        
      } catch {
        toast.error("Eroare la sincronizarea grupelor");
      } finally {
        setIsSyncingGroups(false);
      }
    };

    syncGroups();
  }, [selectedSubject, selectedType]);

  const fetchValidWeeks = async (groupIds: string[]) => {
    if (groupIds.length === 0) {
      setAllWeeks([]);
      return;
    }
    setIsValidatingWeeks(true);
    try {
      const response = await api.post("/data/valid-weeks", { 
        group_ids: groupIds.map(id => parseInt(id)) 
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

  useEffect(() => {
    if (selectedGroups.length > 0) {
      fetchValidWeeks(selectedGroups);
    } else {
      setAllWeeks([]);
    }
  }, [selectedGroups]);

  const handleSearch = async () => {
    toast.dismiss();
    if (!selectedSubject || selectedGroups.length === 0 || selectedRooms.length === 0 || !duration || !selectedType || selectedWeeks.length === 0) {
      toast.error("Completați toate câmpurile obligatorii");
      return;
    }

    onSearch(null, {});

    const searchPayload = {
      email: localStorage.getItem("userEmail"),
      subject: selectedSubject,
      group_ids: selectedGroups.map(id => parseInt(id)),
      room_ids: selectedRooms.map(id => parseInt(id)),
      duration: duration ? parseInt(duration.split(" ")[0]) : null,
      activity_type: selectedType,
      number_of_people: studentCount ? parseInt(studentCount) : null,
      day: selectedDay ? DAYS_MAP[selectedDay] : null,
      weeks: selectedWeeks.map(w => parseInt(w))
    };

    try {
      setIsSearching(true);
      const response = await api.post("/reservations/search-free", searchPayload);
      
      if (response.data.info) {
        toast.info(response.data.info, { duration: 7000});
        onSearch(null, {}); 
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
      setIsSearching(false);
    }
  };

  const handleReset = () => {
    toast.dismiss();
    setSelectedSubject(""); setSelectedGroups([]); setSelectedRooms([]); setDuration("");
    setStudentCount(""); setSelectedDay(""); setSelectedWeeks([]);
    setSelectedType(""); setActivityTypes([]); onSearch(null, {});
  };

  const inputClasses = "min-h-10 w-full border-gray-200 text-sm placeholder:text-muted-foreground focus-visible:border-brand-blue/50 transition-all duration-200 shadow-xs";
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
            {/*Subject*/}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-900">Materia <span className="text-brand-red">*</span></Label>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className={cn(inputClasses, !selectedSubject && placeholderClasses)}>
                <SelectValue placeholder="Selectează materia" />
              </SelectTrigger>
              <SelectContent position="popper" className="max-h-64 text-sm">
                {subjects && subjects.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

            {/* Activity type */}
          <div className="space-y-2">
            <Label htmlFor="search-type" className="text-sm font-semibold text-gray-900">
              Tip activitate <span className="text-brand-red">*</span>
            </Label>
            <div className="relative">
              <Select 
                value={selectedType} 
                onValueChange={setSelectedType}
                disabled={!selectedSubject || isSyncingTypes || activityTypes.length === 0}
              > 
                <SelectTrigger id="search-type" className={cn(inputClasses, !selectedType && placeholderClasses)}>
                  <SelectValue 
                    placeholder={
                      !selectedSubject 
                        ? "Selectează materia mai întâi" 
                        : isSyncingTypes 
                          ? "Se încarcă..." 
                          : activityTypes.length === 0 
                            ? "Niciun tip de activitate disponibil" 
                            : "Selectează tipul"
                    } 
                  />
                </SelectTrigger>
                <SelectContent>
                  {activityTypes.length > 0 ? (
                    activityTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-xs text-muted-foreground text-center italic">
                      Nu s-au găsit activități pentru această materie
                    </div>
                  )}
                </SelectContent>
              </Select>
              {isSyncingTypes && (
                <Loader2 className="absolute right-8 top-3 h-4 w-4 animate-spin text-brand-blue" />
              )}
            </div>
          </div>

            {/* Groups */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-900">Grupe <span className="text-brand-red">*</span></Label>
            <div className="relative">
                <MultiSelect 
                options={allGroups} 
                selected={selectedGroups} 
                onChange={setSelectedGroups} 
                disabled={!selectedSubject || isSyncingGroups}
                placeholder={
                    !selectedSubject 
                    ? "Selectează materia mai întâi" 
                    : isSyncingGroups 
                        ? "Se încarcă grupele..." 
                        : "Selectează grupele"
                } 
                className={cn(
                    inputClasses, 
                    (!selectedSubject || isSyncingGroups) && "opacity-50 cursor-not-allowed bg-gray-50"
                )} 
                />
                {isSyncingGroups && <Loader2 className="absolute right-8 top-3 h-4 w-4 animate-spin text-brand-blue" />}
            </div>
          </div>

            {/* Rooms */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-900">Săli <span className="text-brand-red">*</span></Label>
            <div className="relative">
                <MultiSelect 
                options={allRooms} 
                selected={selectedRooms} 
                onChange={setSelectedRooms} 
                disabled={!selectedSubject || isSyncingGroups}
                placeholder={
                    !selectedSubject 
                    ? "Selectează materia mai întâi" 
                    : isSyncingGroups 
                        ? "Se încarcă sălile..." 
                        : "Selectează sălile"
                } 
                className={cn(
                    inputClasses, 
                    (!selectedSubject || isSyncingGroups) && "opacity-50 cursor-not-allowed bg-gray-50"
                )} 
                />
                {isSyncingGroups && <Loader2 className="absolute right-8 top-3 h-4 w-4 animate-spin text-brand-blue" />}
            </div>
          </div>

            {/*Duration*/}
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

            {/* Weeks */}
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

            {/*Number of people*/}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-900">Număr persoane</Label>
            <Input type="number" step="1" onKeyDown={(e) => ["e", "E", ".", ",", "-"].includes(e.key) && e.preventDefault()} placeholder="Exemplu: 15" value={studentCount} onChange={(e) => (e.target.value === "" || /^\d+$/.test(e.target.value)) && setStudentCount(e.target.value)} className={cn(inputClasses, "px-3")} />
          </div>

            {/*Day*/}
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

        {/* Warning message */}
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
          <Button 
            onClick={handleSearch} 
            disabled={allWeeks.length === 0 || isSearching}
            className="bg-brand-blue hover:bg-brand-blue-dark text-white font-medium shadow-md transition-all active:scale-95 flex-1 sm:flex-none"
          >
            {isSearching ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Se caută...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" /> 
                Caută
              </>
            )}
          </Button>
          <Button onClick={handleReset} variant="outline" className="border-gray-200 text-gray-700 font-medium hover:bg-gray-50 flex-1 sm:flex-none">
            <RotateCcw className="h-4 w-4 mr-2" /> Resetează
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}