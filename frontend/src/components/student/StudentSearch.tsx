"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { SearchResults } from "./SearchResults";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { 
  Search, RotateCcw, Loader2, Check, ChevronsUpDown, InfoIcon 
} from "lucide-react";
import { toast } from "sonner";
import api from "@/services/api";
import { cn } from "@/lib/utils";

// Interfața pentru obiectul primit de la /cauta-alternative
interface AlternativeOption {
  grupa: string;
  zi: string;
  ora_start: string;
  ora_final: string;
  profesor: string;
  sala: string;
  saptamani_lista: number[];
  saptamani_grupate: string;
}

export interface Grupa {
  id: number;
  nume: string;
  subgroupIndex: string;
  studyYear: number;
  specializationShortName: string;
}

export function StudentSearch() {
  // State pentru datele din API
  const [grupe, setGrupe] = useState<Grupa[]>([]);
  const [materii, setMaterii] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<AlternativeOption[]>([]);
  
  // State pentru selecții
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [attendsCourse, setAttendsCourse] = useState(false);
  
  // State pentru UI
  const [openGroups, setOpenGroups] = useState(false);
  const [isLoadingGrupe, setIsLoadingGrupe] = useState(false);
  const [isLoadingMaterii, setIsLoadingMaterii] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [allWeeks, setAllWeeks] = useState<number[]>([]);
  const hasShownStatusToast = useRef(false);

  const types = ["Seminar", "Laborator", "Proiect"];

  // Încărcăm grupele la montarea componentei
  useEffect(() => {
    const fetchInitialData = async () => {
    setIsLoadingGrupe(true);
    try {
      // Preluăm grupele și săptămânile în paralel
      const [grupeResp, weeksResp] = await Promise.all([
        api.get("/data/grupe"),
        api.get("/data/weeks")
      ]);

      setGrupe(grupeResp.data);
      
      const activeWeeks = weeksResp.data.active_weeks || [];
      setAllWeeks(activeWeeks);

      if (activeWeeks.length === 0 && !hasShownStatusToast.current) {
        const statusMessage = weeksResp.data.current_status || "Sesiune/Vacanță";
        toast.info(statusMessage, { 
          duration: Infinity,
          description: "Nu mai există săptămâni de curs disponibile în acest semestru." 
        });
        hasShownStatusToast.current = true;
      }
      } catch {
        toast.error("Nu s-au putut încărca grupele.");
      } finally {
        setIsLoadingGrupe(false);
      }
    };
    fetchInitialData();
  }, []);

  // Încărcăm materiile când se schimbă grupa selectată
  useEffect(() => {
    const fetchMaterii = async () => {
      if (!selectedGroupId) {
        setMaterii([]);
        return;
      }
      setIsLoadingMaterii(true);
      try {
        const response = await api.get(`/subgrupe/materii?id_subgrupa=${selectedGroupId}`);
        setMaterii(response.data.materii);
        setSelectedSubject(""); // Resetăm materia aleasă anterior
      } catch {
        toast.error("Nu s-au putut încărca materiile pentru această grupă.");
      } finally {
        setIsLoadingMaterii(false);
      }
    };
    fetchMaterii();
  }, [selectedGroupId]);

  // Search Handler (POST către backend)
  const handleSearch = async () => {
    if (!selectedGroupId || !selectedSubject || !selectedType) {
      toast.error("Vă rugăm să completați toate câmpurile obligatorii");
      return;
    }

    // ȘTERGEM TOATE TOAST-URILE VECHI
    toast.dismiss();

    // GOLIM ZONA DE REZULTATE ÎNAINTE DE CĂUTARE
    setSearchResults([]);
    setHasSearched(false);
    
    setIsSearching(true);

    try {
      const response = await api.post("/subgrupe/cauta-alternative", {
        selectedGroupId: parseInt(selectedGroupId),
        selectedSubject,
        selectedType,
        attendsCourse
      });
      
      setSearchResults(response.data.optiuni);

      const { info_message } = response.data;

      if (info_message) {
        toast.info(info_message, { duration: Infinity });
      } else {
        // Afișăm zona de rezultate doar după un succes (200 OK)
        setHasSearched(true);
        toast.success(`Am găsit ${response.data.total_optiuni} opțiuni disponibile`);
      }
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      // Dacă eroarea este 400 (sau orice altă eroare), hasSearched rămâne false 
      // zona de rezultate nu va fi randată, iar searchResults va fi listă goală.
      const msg = error.response?.data?.detail || "Eroare la căutare";
      toast.error(msg, { duration: 7000});
      
      // Opțional: ne asigurăm explicit că hasSearched este false în caz de eroare 400
      setHasSearched(false);
    } finally {
      setIsSearching(false);
    }
  };

  const handleReset = () => {
    toast.dismiss(); 
    setSelectedGroupId("");
    setSelectedSubject("");
    setSelectedType("");
    setAttendsCourse(false);
    setSearchResults([]);
    setHasSearched(false);
  };

  return (
    <div className="space-y-6">
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 font-semibold text-xl">
            <Search className="h-5 w-5 text-brand-blue" />
            Căutare sloturi alternative
          </CardTitle>
          <CardDescription className="text-gray-600 font-medium">
            Selectați criteriile pentru a găsi o grupă alternativă de recuperare
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Select Grupă cu SEARCH (Combobox) */}
            <div className="space-y-2 flex flex-col w-full">
              <Label htmlFor="search-group" className="font-semibold text-gray-900">
                Grupa <span className="text-brand-red">*</span>
              </Label>
              <Popover open={openGroups} onOpenChange={setOpenGroups}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openGroups}
                    disabled={isLoadingGrupe}
                    className={cn(
                      "w-full justify-between font-normal focus-visible:ring-1 border-gray-200 hover:bg-transparent active:scale-100",
                      !selectedGroupId && "text-muted-foreground hover:text-muted-foreground"
                    )}
                  >
                    <span className="truncate">
                      {selectedGroupId
                        ? (() => {
                            const g = grupe.find((g) => g.id.toString() === selectedGroupId);
                            return g 
                              ? `${g.specializationShortName} • an ${g.studyYear} • ${g.nume}${g.subgroupIndex}` 
                              : "Selectează grupa";
                          })()
                        : isLoadingGrupe ? "Se încarcă..." : "Selectează grupa"}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Caută" />
                    <CommandList className="max-h-64">
                      <CommandEmpty>Nu am găsit nicio grupă.</CommandEmpty>
                      <CommandGroup>
                        {grupe.map((g) => (
                          <CommandItem
                            key={g.id}
                            value={`${g.specializationShortName} ${g.studyYear} ${g.nume}${g.subgroupIndex}`}
                            onSelect={() => {
                              setSelectedGroupId(g.id.toString());
                              setOpenGroups(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedGroupId === g.id.toString() ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {g.specializationShortName} • an {g.studyYear} • {g.nume}{g.subgroupIndex}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Select Materie (Dependent de Grupă) */}
            <div className="space-y-2">
              <Label htmlFor="search-subject" className="text-sm font-semibold text-gray-900">
                Materia <span className="text-brand-red">*</span>
              </Label>
              <Select 
                value={selectedSubject} 
                onValueChange={setSelectedSubject} 
                disabled={!selectedGroupId || isLoadingMaterii}
              >
                <SelectTrigger 
                  id="search-subject" 
                  className={cn(
                    "w-full border-gray-200 focus-visible:ring-1 focus:ring-brand-blue/30 transition-all",
                    (!selectedGroupId || isLoadingMaterii) && "opacity-50 cursor-not-allowed bg-gray-50"
                  )}
                >
                  {isLoadingMaterii ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-3 w-3 animate-spin text-brand-blue"/> 
                      <span className="text-muted-foreground">Se încarcă...</span>
                    </div>
                  ) : (
                    <SelectValue 
                      placeholder={!selectedGroupId ? "Alegeți mai întâi grupa" : "Selectează materia"} 
                    />
                  )}
                </SelectTrigger>
                <SelectContent>
                  {materii.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
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

            {/* Checkbox Participare Curs */}
            <div className="flex items-end">
              <div className="flex items-center space-x-3 bg-gray-50 p-2.5 rounded-lg border border-gray-100 w-full h-10">
                <Checkbox
                  className="data-[state=checked]:bg-brand-blue data-[state=checked]:border-brand-blue"
                  id="attends-course"
                  checked={attendsCourse}
                  onCheckedChange={(checked) => setAttendsCourse(checked === true)}
                />
                <Label
                  htmlFor="attends-course"
                  className="text-sm font-medium text-gray-900 cursor-pointer select-none"
                >
                  Particip la cursuri
                </Label>
              </div>
            </div>
          </div>

          {/* Mesaj Atenționare*/}
          <div className="relative w-full rounded-lg border border-amber-200 bg-amber-50 p-4 [&>svg~*]:pl-7 [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-amber-600">
            <InfoIcon className="h-4 w-4" />
            <div className="text-xs sm:text-sm font-medium text-amber-800 leading-relaxed">
              Rezultatele sunt bazate pe orarul general și includ opțiuni din Modulul Psihopedagogic.
              <span className="block">
                Notă: Modificările punctuale sau recuperările programate separat nu sunt reflectate aici.
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button 
              onClick={handleSearch} 
              disabled={isSearching || allWeeks.length === 0}
              className="bg-brand-blue hover:bg-brand-blue-dark text-white font-medium shadow-md transition-all active:scale-95 flex-1 sm:flex-none"
            >
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
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
        <SearchResults 
          results={searchResults} 
          selectedSubject={selectedSubject} 
          selectedType={selectedType} 
        />
      )}
    </div>
  );
}