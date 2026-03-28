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

export interface AlternativeOption {
  group: string;
  day: string;
  start_time: string;  
  end_time: string;    
  professor: string;
  room: string;
  weeks_list: number[]; 
  weeks_grouped: string;
}

export interface Group {
  id: number;
  name: string;
  subgroupIndex: string;
  studyYear: number;
  specializationShortName: string;
}

export function StudentSearch() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<AlternativeOption[]>([]);
  
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [attendsCourse, setAttendsCourse] = useState(false);
  
  const [openGroups, setOpenGroups] = useState(false);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [allWeeks, setAllWeeks] = useState<number[]>([]);
  const hasShownStatusToast = useRef(false);

  const types = ["Seminar", "Laborator", "Proiect"];

  // Fetch groups and available weeks on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoadingGroups(true);
      try {
        // Fetch groups and weeks in parallel
        const [groupsResp, weeksResp] = await Promise.all([
          api.get("/data/groups"),
          api.get("/data/weeks")
        ]);

      setGroups(groupsResp.data);
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
        setIsLoadingGroups(false);
      }
    };
    fetchInitialData();
  }, []);

  // Fetch subjects when the selected group changes
  useEffect(() => {
    const fetchSubjects = async () => {
      if (!selectedGroupId) {
        setSubjects([]);
        return;
      }
      setIsLoadingSubjects(true);
      try {
        const response = await api.get(`/subgroups/subjects?subgroup_id=${selectedGroupId}`);
        setSubjects(response.data.subjects);
        setSelectedSubject(""); 
      } catch {
        toast.error("Nu s-au putut încărca materiile pentru această grupă.");
      } finally {
        setIsLoadingSubjects(false);
      }
    };
    fetchSubjects();
  }, [selectedGroupId]);

  // Search Handler (POST to backend)
  const handleSearch = async () => {
    if (!selectedGroupId || !selectedSubject || !selectedType) {
      toast.error("Vă rugăm să completați toate câmpurile obligatorii");
      return;
    }

    // DISMISS ALL PREVIOUS TOASTS
    toast.dismiss();

    // CLEAR RESULTS AREA BEFORE SEARCHING
    setSearchResults([]);
    setHasSearched(false);
    
    setIsSearching(true);

    try {
      const response = await api.post("/subgroups/search-alternatives", {
        selectedGroupId: parseInt(selectedGroupId),
        selectedSubject,
        selectedType,
        attendsCourse
      });
      
      setSearchResults(response.data.options);

      const { info_message } = response.data;

      if (info_message) {
        toast.info(info_message, { duration: Infinity });
      } else {
        // Show results area only after a successful 200 OK
        setHasSearched(true);
        toast.success(`Am găsit ${response.data.total_options} opțiuni disponibile`);
      }
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      // If error is 400 (or any other), hasSearched remains false
      // Results area won't render and searchResults will be an empty list
      const msg = error.response?.data?.detail || "Eroare la căutare";
      toast.error(msg, { duration: 7000});
      
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
            
            {/* Group Select with SEARCH (Combobox) */}
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
                    disabled={isLoadingGroups}
                    className={cn(
                      "w-full justify-between font-normal border-gray-200 hover:bg-transparent active:scale-100",
                      !selectedGroupId && "text-muted-foreground hover:text-muted-foreground"
                    )}
                  >
                    <span className="truncate">
                      {selectedGroupId
                        ? (() => {
                            const g = groups.find((g) => g.id.toString() === selectedGroupId);
                            return g 
                              ? `${g.specializationShortName} • an ${g.studyYear} • ${g.name}${g.subgroupIndex}` 
                              : "Selectează grupa";
                          })()
                        : isLoadingGroups ? "Se încarcă..." : "Selectează grupa"}
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
                        {groups.map((g) => (
                          <CommandItem
                            key={g.id}
                            value={`${g.specializationShortName} ${g.studyYear} ${g.name}${g.subgroupIndex}`}
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
                            {g.specializationShortName} • an {g.studyYear} • {g.name}{g.subgroupIndex}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Subject Select (Dependent on Group) */}
            <div className="space-y-2">
              <Label htmlFor="search-subject" className="text-sm font-semibold text-gray-900">
                Materia <span className="text-brand-red">*</span>
              </Label>
              <Select 
                value={selectedSubject} 
                onValueChange={setSelectedSubject} 
                disabled={!selectedGroupId || isLoadingSubjects}
              >
                <SelectTrigger 
                  id="search-subject" 
                  className={cn(
                    "w-full border-gray-200 focus:ring-brand-blue/30 transition-all",
                    (!selectedGroupId || isLoadingSubjects) && "opacity-50 cursor-not-allowed bg-gray-50"
                  )}
                >
                  {isLoadingSubjects ? (
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
                  {subjects.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Activity Type Select */}
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

            {/* Course Attendance Checkbox */}
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

          {/* Warning Message */}
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

      {/* Results Section */}
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