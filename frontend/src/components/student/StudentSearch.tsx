"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Search, RotateCcw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/services/api";

interface Grupa {
  id: number;
  nume: string;
  subgroupIndex: string;
  studyYear: number;
  specializationShortName: string;
}

export function StudentSearch() {
  const [grupe, setGrupe] = useState<Grupa[]>([]);
  const [materii, setMaterii] = useState<string[]>([]);
  
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [attendsCourse, setAttendsCourse] = useState(false);
  
  const [isLoadingGrupe, setIsLoadingGrupe] = useState(false);
  const [isLoadingMaterii, setIsLoadingMaterii] = useState(false);

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

  const handleSearch = () => {
    if (!selectedGroupId || !selectedSubject || !selectedType) {
      toast.error("Vă rugăm să completați toate câmpurile obligatorii");
      return;
    }
    console.log({ selectedGroupId, selectedSubject, selectedType, attendsCourse });
  };

  const handleReset = () => {
    setSelectedGroupId("");
    setSelectedSubject("");
    setSelectedType("");
    setAttendsCourse(false);
  };

  return (
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
          
          {/* Select Grupă */}
          <div className="space-y-2">
            <Label htmlFor="search-group" className="text-sm font-semibold text-gray-900">
              Grupa <span className="text-brand-red">*</span>
            </Label>
            <Select value={selectedGroupId} onValueChange={setSelectedGroupId} disabled={isLoadingGrupe}>
              <SelectTrigger id="search-group" className="w-full focus:ring-brand-blue/30 border-gray-200">
                <SelectValue placeholder={isLoadingGrupe ? "Se încarcă..." : "Selectează grupa"} />
              </SelectTrigger>
              <SelectContent>
                {grupe.map((g) => (
                <SelectItem key={g.id} value={g.id.toString()}>
                    {g.specializationShortName} • an {g.studyYear} • {g.nume}{g.subgroupIndex ? `${g.subgroupIndex}` : ""}
                </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              <SelectTrigger id="search-subject" className="w-full focus:ring-brand-blue/30 border-gray-200">
                {isLoadingMaterii ? (
                  <div className="flex items-center gap-2"><Loader2 className="h-3 w-3 animate-spin"/> Se încarcă...</div>
                ) : (
                  <SelectValue placeholder={!selectedGroupId ? "Alegeți mai întâi grupa" : "Selectează materia"} />
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
          <div className="flex items-end pb-2">
            <div className="flex items-center space-x-3 bg-gray-50 p-2.5 rounded-lg border border-gray-100 w-full h-10">
              <Checkbox
                id="attends-course"
                checked={attendsCourse}
                onCheckedChange={(checked: boolean | "indeterminate") => setAttendsCourse(checked === true)}
                className="data-[state=checked]:bg-brand-blue data-[state=checked]:border-brand-blue"
              />
              <Label
                htmlFor="attends-course"
                className="text-sm font-medium text-gray-700 cursor-pointer select-none"
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
  );
}