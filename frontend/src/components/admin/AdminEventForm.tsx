"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, RotateCcw, Loader2, CalendarIcon, InfoIcon } from "lucide-react";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import api from "@/services/api";
import { ApiRoom } from "@/components/professor/ProfessorScheduleForm";
import { DateRange } from "react-day-picker";

interface SpecializationOption {
  label: string;
  ids: number[];
}

interface SelectOption { label: string; value: string; }

interface ProfessorData {
  id: number;
  lastName: string;
  firstName: string;
  emailAddress: string;
}

export interface AdminFilters {
  eventName: string;
  selectedRooms: string[];
  selectedProfessors: string[];
  allSubgroupIds: number[];
  duration: number;
  studentCount: string;
}

export interface BackendDayResponse {
  date: string;
  options: {
    room_id: number;
    room_name: string;
    start_time: number;
    end_time: number;
  }[];
}

interface AdminEventFormProps {
  onSearch: (filters: AdminFilters | null, results: BackendDayResponse[]) => void;
}

export function AdminEventForm({ onSearch }: AdminEventFormProps) {
  const [rooms, setRooms] = useState<SelectOption[]>([]);
  const [professors, setProfessors] = useState<SelectOption[]>([]);
  const [specializationOptions, setSpecializations] = useState<SelectOption[]>([]);
  const [selectedSpecsJson, setSelectedSpecsJson] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  // Form State
  const [eventName, setEventName] = useState<string>("");
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [selectedProfessors, setSelectedProfessors] = useState<string[]>([]);
  
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  
  const [duration, setDuration] = useState<string>("");
  const [studentCount, setStudentCount] = useState<string>("");

  const durations = ["1 oră", "2 ore", "3 ore", "4 ore", "5 ore"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomsResp, profsResp, specsResp] = await Promise.all([
          api.get("/data/rooms"),
          api.get("/data/professors"),
          api.get("/data/groups-specialization")
        ]);
        
        setRooms(roomsResp.data.map((r: ApiRoom) => ({ label: r.name, value: r.id.toString() })));
        setProfessors(profsResp.data.map((p: ProfessorData) => ({ 
          label: `${p.lastName} ${p.firstName}`, 
          value: p.id.toString() 
        })));

        const specsMapped = specsResp.data.map((s: SpecializationOption) => ({
          label: s.label,
          value: JSON.stringify(s.ids) 
        }));
        setSpecializations(specsMapped);
      } catch {
        toast.error("Eroare la încărcarea datelor");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = async () => {
    if (!eventName || !dateRange?.from || !dateRange?.to || selectedRooms.length === 0 || !duration) {
      toast.error("Vă rugăm să completați toate câmpurile obligatorii, inclusiv intervalul de date.");
      return;
    }

    setIsSearching(true);
    onSearch(null, []);
    try {
      const allSubgroupIds = Array.from(
        new Set(selectedSpecsJson.flatMap(json => JSON.parse(json) as number[]))
      );

      const payload = {
        subject: eventName,
        room_ids: selectedRooms.map(Number),
        subgroup_ids: allSubgroupIds,
        professor_ids: selectedProfessors.map(Number),
        start_date: format(dateRange.from, "yyyy-MM-dd"),
        end_date: format(dateRange.to, "yyyy-MM-dd"),
        duration: parseInt(duration.split(" ")[0]),
        number_of_people: studentCount ? parseInt(studentCount) : 0,
        activity_type: "event"
      };

      const response = await api.post("/reservations/search-admin-event", payload);
      
      const days: BackendDayResponse[] = response.data.days || [];
      
      if (response.data.info && (!response.data.days || response.data.days.length === 0)) {
        toast.info(response.data.info);
        onSearch(null, []);
      } else {
        onSearch({
          eventName,
          selectedRooms,
          selectedProfessors,
          allSubgroupIds,
          duration: parseInt(duration.split(" ")[0]),
          studentCount: studentCount || "0"
        }, days);
      }
    } catch (error: unknown) { 
        // 1. We convert the error to a type that allows us to access the Axios properties
        const axiosError = error as { 
          response?: { 
            data?: { 
              detail?: string | { msg: string }[] 
            } 
          } 
        };

        const detail = axiosError.response?.data?.detail;
        let errorMessage = "Eroare la căutarea sloturilor";

        // 2. We extract the message according to the format sent by FastAPI (string or list of Pydantic errors)
        if (typeof detail === "string") {
          errorMessage = detail;
        } else if (Array.isArray(detail) && detail.length > 0) {
          errorMessage = detail[0].msg || "Eroare de validare date";
        }
        
        toast.error(errorMessage);
        onSearch(null, []);
      } finally {
        setIsSearching(false);
      }
    };

  const handleReset = () => {
    setEventName(""); 
    setSelectedRooms([]); 
    setSelectedSpecsJson([]);
    setSelectedProfessors([]); 
    setDateRange({ from: undefined, to: undefined });
    setDuration("");
    setStudentCount("");
  };

  const inputClasses = "min-h-10 w-full border-gray-200 text-sm placeholder:text-muted-foreground focus-visible:border-brand-blue/50 transition-all duration-200 shadow-xs";

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-brand-blue" /></div>;

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900 font-semibold text-xl">
          <Search className="h-5 w-5 text-brand-blue" />
          Programare eveniment
        </CardTitle>
        <CardDescription className="text-gray-600 font-medium text-sm">
          Planificați activități academice, administrative, conferințe sau ședințe
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Event Name */}
          <div className="space-y-2 lg:col-span-2">
            <Label className="text-sm font-semibold text-gray-900">Nume eveniment <span className="text-brand-red">*</span></Label>
            <Input 
              placeholder="Ex: Conferință / Ședință Consiliu" 
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className={inputClasses}
            />
          </div>

          {/* Rooms MultiSelect */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-900">Săli <span className="text-brand-red">*</span></Label>
            <MultiSelect
              options={rooms}
              selected={selectedRooms}
              onChange={setSelectedRooms}
              placeholder="Selectați sălile"
              className={inputClasses}
            />
          </div>

          {/* Professors MultiSelect */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-900">Profesori participanți</Label>
            <MultiSelect
              options={professors}
              selected={selectedProfessors}
              onChange={setSelectedProfessors}
              placeholder="Selectați profesorii"
              className={inputClasses}
            />
          </div>

          {/* Specializations */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-900">Specializări pe ani</Label>
            <MultiSelect
              options={specializationOptions} 
              selected={selectedSpecsJson}
              onChange={setSelectedSpecsJson}
              placeholder="Selectați specializările"
              className={inputClasses}
            />
          </div>

          {/* Date Picker */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-900">Data <span className="text-brand-red">*</span></Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal shadow-xs h-10",
                    !dateRange?.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-brand-blue" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "dd MMM", { locale: ro })} -{" "}
                        {format(dateRange.to, "dd MMM yyyy", { locale: ro })}
                      </>
                    ) : (
                      format(dateRange.from, "dd MMM yyyy", { locale: ro })
                    )
                  ) : (
                    <span>Selectați perioada</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar 
                autoFocus
                mode="range" 
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                locale={ro}
                /*disabled={(date) => date < startOfToday()}*/
                 />
              </PopoverContent>
            </Popover>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-900">Durata <span className="text-brand-red">*</span></Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger className={inputClasses}>
                <SelectValue placeholder="Selectați durata" />
              </SelectTrigger>
              <SelectContent>
                {durations.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

           {/*Number of people*/}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-900">Număr persoane</Label>
            <Input type="number" step="1" onKeyDown={(e) => ["e", "E", ".", ",", "-"].includes(e.key) && e.preventDefault()} placeholder="Exemplu: 15" value={studentCount} onChange={(e) => (e.target.value === "" || /^\d+$/.test(e.target.value)) && setStudentCount(e.target.value)} className={cn(inputClasses, "px-3")} />
          </div>
        </div>

        {/* Warning message */}
        <div className="relative w-full rounded-lg border border-amber-200 bg-amber-50 p-4 [&>svg~*]:pl-7 [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-amber-600">
          <InfoIcon className="h-4 w-4" />
          <div className="text-xs sm:text-sm font-medium text-amber-800 leading-relaxed">
            Rezultatele sunt generate pe baza orarului general.
            <span className="block">
              Notă: Puteți planifica evenimente în orice perioadă a anului, pentru organizatori din cadrul facultății sau din exterior.
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-gray-100">
          <Button 
            onClick={handleSearch} 
            disabled={isSearching}
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
          <Button onClick={handleReset}  
            disabled={isSearching} 
            variant="outline" 
            className="border-gray-200 text-gray-700 font-medium hover:bg-gray-50 flex-1 sm:flex-none">
            <RotateCcw className="h-4 w-4 mr-2" /> Resetează
          </Button>
        </div>

      </CardContent>
    </Card>
  );
}