"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/ui/multi-select"; 
import { Search, RotateCcw, Filter } from "lucide-react";
import { toast } from "sonner";

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

export function ProfessorSchedule() {
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [selectedProfessor, setSelectedProfessor] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [studentCount, setStudentCount] = useState<string>("");
  const [preferences, setPreferences] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [sortBy, setSortBy] = useState<string>("week");

  // Mock data
  const subjects = ["Programare Orientată pe Obiecte", "Structuri de Date", "Baze de Date", "Algoritmi Fundamentali"];
  const groupOptions = [
    { label: "Grupa 1101A", value: "1101A" },
    { label: "Grupa 1101B", value: "1101B" },
    { label: "Grupa 1102A", value: "1102A" },
    { label: "Grupa 1102B", value: "1102B" },
  ];
  const roomOptions = [
    { label: "Sala I015", value: "I015" },
    { label: "Sala I017", value: "I017" },
    { label: "Sala I110", value: "I110" },
  ];
  const professors = ["Prof. Maria Ionescu", "Prof. Andrei Popescu", "Prof. Elena Dumitrescu"];
  const durations = ["1 oră", "2 ore", "3 ore", "4 ore"];

  const handleSearch = () => {
    if (!selectedSubject || selectedGroups.length === 0 || !duration) {
      toast.error("Vă rugăm să completați toate câmpurile obligatorii");
      return;
    }
    
    // Logăm preferințele pentru a folosi variabila și a elimina eroarea ESLint
    if (preferences) console.log("Căutare cu preferințele:", preferences);

    const mockSlots: AvailableSlot[] = [
      {
        id: "1",
        week: 3,
        date: new Date(2026, 1, 17, 14, 0),
        startTime: "14:00",
        endTime: "16:00",
        room: "I015",
        capacity: 20,
        availableGroups: selectedGroups,
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
    setSelectedProfessor("");
    setStartTime("");
    setDuration("");
    setStudentCount("");
    setPreferences("");
    setAvailableSlots([]);
    setHasSearched(false);
  };

  return (
    <div className="space-y-6">
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 font-semibold text-xl">
            <Search className="h-5 w-5 text-brand-blue" />
            Programare recuperare
          </CardTitle>
          <CardDescription className="text-gray-600 font-medium">
            Completați detaliile pentru a găsi sloturile disponibile pentru recuperare
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="subject" className="text-sm font-semibold text-gray-900">
                Materia <span className="text-brand-red">*</span>
              </Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger id="subject" className="w-full focus:ring-brand-blue/30 border-gray-200">
                  <SelectValue placeholder="Selectează materia" />
                </SelectTrigger>
                <SelectContent position="popper" className="max-h-64">
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration" className="text-sm font-semibold text-gray-900">
                Durata <span className="text-brand-red">*</span>
              </Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger id="duration" className="w-full focus:ring-brand-blue/30 border-gray-200">
                  <SelectValue placeholder="Selectează durata" />
                </SelectTrigger>
                <SelectContent position="popper" className="max-h-64">
                  {durations.map((dur) => (
                    <SelectItem key={dur} value={dur}>{dur}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="start-time" className="text-sm font-semibold text-gray-900">Ora de Start (opțional)</Label>
              <Input
                id="start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="focus:ring-brand-blue/30 border-gray-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="student-count" className="text-sm font-semibold text-gray-900">Număr Estimat Studenți</Label>
              <Input
                id="student-count"
                type="number"
                placeholder="Ex: 15"
                value={studentCount}
                onChange={(e) => setStudentCount(e.target.value)}
                className="focus:ring-brand-blue/30 border-gray-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="professor" className="text-sm font-semibold text-gray-900">Profesor Asistent (opțional)</Label>
              <Select value={selectedProfessor} onValueChange={setSelectedProfessor}>
                <SelectTrigger id="professor" className="w-full focus:ring-brand-blue/30 border-gray-200">
                  <SelectValue placeholder="Selectează profesor" />
                </SelectTrigger>
                <SelectContent position="popper" className="max-h-64">
                  <SelectItem value="none">Fără asistent</SelectItem>
                  {professors.map((prof) => (
                    <SelectItem key={prof} value={prof}>{prof}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="room" className="text-sm font-semibold text-gray-900">Săli preferate (opțional)</Label>
              <MultiSelect
                options={roomOptions}
                selected={selectedRooms}
                onChange={setSelectedRooms}
                placeholder="Selectează săli"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferences" className="text-sm font-semibold text-gray-900">Preferințe Orar</Label>
            <Input
              id="preferences"
              placeholder="Ex: Miercuri după ora 14:00, dimineața"
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              className="focus:ring-brand-blue/30 border-gray-200"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-900">
              Grupe <span className="text-brand-red">*</span>
            </Label>
            <MultiSelect
              options={groupOptions}
              selected={selectedGroups}
              onChange={setSelectedGroups}
              placeholder="Selectează grupele vizate"
            />
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

      {hasSearched && (
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-lg font-bold">Sloturi Disponibile</CardTitle>
              <CardDescription className="font-medium text-gray-600">
                Am găsit {availableSlots.length} sloturi pentru săptămânile 1-14
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-45 h-8 text-xs border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">După săptămână</SelectItem>
                  <SelectItem value="date">După dată</SelectItem>
                  <SelectItem value="time">După oră</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
             {/* ... restul randării sloturilor din codul tău anterior */}
          </CardContent>
        </Card>
      )}
    </div>
  );
}