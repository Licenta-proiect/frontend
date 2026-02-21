"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { 
  Search, Calendar, Clock, MapPin, Users, 
  RotateCcw, Loader2, Check, ChevronsUpDown, Filter 
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
  const [sortBy, setSortBy] = useState<string>("time");

  // Filtrare
  const [filterDay, setFilterDay] = useState<string>("all");
  const [filterWeek, setFilterWeek] = useState<string>("all");

  const types = ["Seminar", "Laborator", "Proiect"];

  // Încărcăm grupele la montarea componentei
  useEffect(() => {
    const fetchGrupe = async () => {
      setIsLoadingGrupe(true);
      try {
        const response = await api.get("/data/grupe");
        setGrupe(response.data);
      } catch {
        toast.error("Nu s-au putut încărca grupele.");
      } finally {
        setIsLoadingGrupe(false);
      }
    };
    fetchGrupe();
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

  // 3. Search Handler (POST către backend)
  const handleSearch = async () => {
    if (!selectedGroupId || !selectedSubject || !selectedType) {
      toast.error("Vă rugăm să completați toate câmpurile obligatorii");
      return;
    }

    setIsSearching(true);
    try {
      const response = await api.post("/subgrupe/cauta-alternative", {
        selectedGroupId: parseInt(selectedGroupId),
        selectedSubject,
        selectedType,
        attendsCourse
      });
      
      setSearchResults(response.data.optiuni);
      setHasSearched(true);
      toast.success(`Am găsit ${response.data.total_optiuni} opțiuni disponibile`);
    } catch (error: any) {
      const msg = error.response?.data?.detail || "Eroare la căutare";
      toast.error(msg);
    } finally {
      setIsSearching(false);
    }
  };

  const handleReset = () => {
    setSelectedGroupId("");
    setSelectedSubject("");
    setSelectedType("");
    setAttendsCourse(false);
    setSearchResults([]);
    setHasSearched(false);
    setFilterDay("all");
    setFilterWeek("all");
  };

  // Sortare și filtrare rezultate
  const filteredAndSortedResults = searchResults
    .filter((result) => {
      const matchDay = filterDay === "all" || result.zi === filterDay;
      const matchWeek = filterWeek === "all" || result.saptamani_lista.includes(parseInt(filterWeek));
      return matchDay && matchWeek;
    })
    .sort((a, b) => {
      if (sortBy === "time") return a.ora_start.localeCompare(b.ora_start);
      if (sortBy === "group") return a.grupa.localeCompare(b.grupa);
      return 0;
    });

  const availableWeeks = Array.from(
    new Set(searchResults.flatMap((r) => r.saptamani_lista))
  ).sort((a, b) => a - b);

  const getTypeColor = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes("lab")) return "bg-blue-100 text-blue-700 border-blue-200";
    if (t.includes("sem")) return "bg-green-100 text-green-700 border-green-200";
    if (t.includes("pro")) return "bg-purple-100 text-purple-700 border-purple-200";
    return "bg-gray-100 text-gray-700";
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
              <Label htmlFor="search-group" className="text- font-semibold text-gray-900">
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
                      "w-full justify-between font-normal border-gray-200 hover:bg-transparent active:scale-100",
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
                    "w-full border-gray-200 focus:ring-brand-blue/30 transition-all",
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
                <SelectTrigger id="search-type" className="w-full focus:ring-brand-blue/30 border-gray-200">
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
                  id="attends-course"
                  checked={attendsCourse}
                  onCheckedChange={(checked: boolean | "indeterminate") => setAttendsCourse(checked === true)}
                  className="data-[state=checked]:bg-brand-blue data-[state=checked]:border-brand-blue"
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

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button 
              onClick={handleSearch} 
              disabled={isLoadingMaterii}
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
        <Card className="border-gray-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardHeader className="border-b border-gray-50 bg-gray-50/50">
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg">Opțiuni de recuperare găsite</CardTitle>
                  <CardDescription>
                    {filteredAndSortedResults.length} sloturi filtrate dintr-un total de {searchResults.length}
                  </CardDescription>
                </div>
                
                {/* SORTARE EXISTENTĂ */}
                {searchResults.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-400" />
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-40 h-8 text-xs bg-white">
                        <SelectValue placeholder="Sortează" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="time">După oră</SelectItem>
                        <SelectItem value="group">După grupă</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* FILTRE NOI: ZI ȘI SĂPTĂMÂNĂ */}
              {searchResults.length > 0 && (
                <div className="flex flex-wrap gap-3 p-3 bg-white rounded-md border border-gray-100 shadow-sm">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase ml-1">Filtru Zi</span>
                    <Select value={filterDay} onValueChange={setFilterDay}>
                      <SelectTrigger className="w-32 h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toate zilele</SelectItem>
                        <SelectItem value="Luni">Luni</SelectItem>
                        <SelectItem value="Marți">Marți</SelectItem>
                        <SelectItem value="Miercuri">Miercuri</SelectItem>
                        <SelectItem value="Joi">Joi</SelectItem>
                        <SelectItem value="Vineri">Vineri</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase ml-1">Filtru Săptămână</span>
                    <Select value={filterWeek} onValueChange={setFilterWeek}>
                      <SelectTrigger className="w-32 h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Oricare</SelectItem>
                        {availableWeeks.map((w) => (
                          <SelectItem key={w} value={w.toString()}>
                            Săptămâna {w}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-6 h-9 text-xs text-gray-500 hover:text-brand-red"
                    onClick={() => { setFilterDay("all"); setFilterWeek("all"); }}
                  >
                    Resetează filtrele
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {filteredAndSortedResults.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p className="font-medium">Nu există rezultate pentru filtrele selectate.</p>
                <p className="text-sm mt-1">Încearcă să schimbi ziua sau săptămâna selectată.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredAndSortedResults.map((result, idx) => (
                  <Card key={idx} className="group hover:border-brand-blue/50 transition-all duration-300">
                    <CardContent className="p-5">
                      {/* ... conținutul cardului rămâne identic cu cel din codul tău original ... */}
                      <div className="flex flex-col gap-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h4 className="font-bold text-gray-900 leading-tight">{selectedSubject}</h4>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Users className="h-3.5 w-3.5" />
                              <span>{result.profesor}</span>
                            </div>
                          </div>
                          <Badge variant="outline" className={cn("font-semibold uppercase tracking-wider text-[10px]", getTypeColor(selectedType))}>
                            {selectedType}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-2 py-3 border-y border-gray-50">
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold text-gray-400 block">Zi & Oră</span>
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                              <Calendar className="h-4 w-4 text-brand-blue" />
                              {result.zi}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500 ml-6">
                              <Clock className="h-3 w-3" />
                              {result.ora_start} - {result.ora_final}
                            </div>
                          </div>
                          {/* ... restul grid-ului tău ... */}
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold text-gray-400 block">Locație</span>
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                              <MapPin className="h-4 w-4 text-brand-red" />
                              Sala {result.sala}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold text-gray-400 block">Grupă Disponibilă</span>
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                              <Users className="h-4 w-4 text-gray-400" />
                              {result.grupa}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold text-gray-400 block">Săptămâni</span>
                            <Badge className="bg-gray-100 text-gray-700 border-none hover:bg-gray-100">
                              Sapt: {result.saptamani_grupate}
                            </Badge>
                          </div>
                        </div>
                        {/* ... footer card ... */}
                        <div className="flex items-center justify-between text-xs pt-1">
                          <span className="text-gray-400 font-medium">
                            * Verifică cu profesorul înainte de a merge la altă grupă.
                          </span>
                          <Button variant="ghost" size="sm" className="h-7 text-brand-blue hover:text-brand-blue hover:bg-brand-blue/5 font-bold">
                            Vezi detalii
                          </Button>
                        </div>
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