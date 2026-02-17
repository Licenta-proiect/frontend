"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MultiSelect } from "@/components/ui/multi-select"; 
import { Search, RotateCcw, Calendar, Clock, MapPin, Users, CheckCircle2, Filter } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
  const [duration, setDuration] = useState<string>("");
  const [studentCount, setStudentCount] = useState<string>("");
  const [selectedProfessors, setSelectedProfessors] = useState<string[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [sortBy, setSortBy] = useState<string>("week");

  const subjects = ["Programare Orientată pe Obiecte", "Structuri de Date", "Baze de Date", "Algoritmi Fundamentali"];
  const groupOptions = [
    { label: "1101A", value: "1101A" },
    { label: "1101B", value: "1101B" },
    { label: "1102A", value: "1102A" },
    { label: "1102B", value: "1102B" },
  ];
  const roomOptions = [
    { label: "Sala I015", value: "I015" },
    { label: "Sala I017", value: "I017" },
    { label: "Sala I110", value: "I110" },
  ];
  const professorOptions = [
    { label: "Prof. Maria Ionescu", value: "maria_ionescu" },
    { label: "Prof. Andrei Popescu", value: "andrei_popescu" },
    { label: "Prof. Elena Dumitrescu", value: "elena_dumitrescu" },
  ];
  const durations = ["1 oră", "2 ore", "3 ore", "4 ore"];
  const days = ["Luni", "Marți", "Miercuri", "Joi", "Vineri", "Sâmbătă", "Duminică"];

  const handleSearch = () => {
    if (!selectedSubject || selectedGroups.length === 0 || selectedRooms.length === 0 || !duration) {
      toast.error("Vă rugăm să completați toate câmpurile obligatorii");
      return;
    }
    const mockSlots: AvailableSlot[] = [
      { id: "1", week: 3, date: new Date(2026, 1, 17, 14, 0), startTime: "14:00", endTime: "16:00", room: "I015", capacity: 20, availableGroups: selectedGroups }
    ];
    setAvailableSlots(mockSlots);
    setHasSearched(true);
    toast.success(`Am găsit ${mockSlots.length} sloturi disponibile`);
  };

  const handleReset = () => {
    setSelectedSubject(""); setSelectedGroups([]); setSelectedRooms([]); setDuration("");
    setStudentCount(""); setSelectedProfessors([]); setSelectedDay(""); setStartTime("");
    setAvailableSlots([]); setHasSearched(false);
  };

  const inputClasses = "h-10 w-full border-gray-200 text-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-brand-blue/30 focus-visible:border-brand-blue/50 transition-all duration-200 shadow-xs";
  const placeholderClasses = "text-muted-foreground font-normal";

  return (
    <div className="space-y-6">
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
            
            {/* 1. Materie */}
            <div className="space-y-2">
              <Label htmlFor="subject" className="text-sm font-semibold text-gray-900">
                Materia <span className="text-brand-red">*</span>
              </Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger id="subject" className={cn(inputClasses, !selectedSubject && placeholderClasses)}>
                  <SelectValue placeholder="Selectează materia" />
                </SelectTrigger>
                <SelectContent position="popper" className="max-h-64 text-sm">
                  {subjects.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* 2. Grupe */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-900">
                Grupe <span className="text-brand-red">*</span>
              </Label>
              <MultiSelect 
                options={groupOptions}
                selected={selectedGroups}
                onChange={setSelectedGroups}
                placeholder="Caută și selectează grupele"
                className={inputClasses}              
              />
            </div>

            {/* 3. Săli */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-900">
                Săli <span className="text-brand-red">*</span>
              </Label>
              <MultiSelect 
                options={roomOptions}
                selected={selectedRooms}
                onChange={setSelectedRooms}
                placeholder="Caută și selectează sălile"
                className={inputClasses}
              />
            </div>

            {/* 4. Durata */}
            <div className="space-y-2">
              <Label htmlFor="duration" className="text-sm font-semibold text-gray-900">
                Durata <span className="text-brand-red">*</span>
              </Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger id="duration" className={cn(inputClasses, !duration && placeholderClasses)}>
                  <SelectValue placeholder="Selectează durata" />
                </SelectTrigger>
                <SelectContent position="popper" className="max-h-64 text-sm">
                  {durations.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* 5. Număr persoane */}
            <div className="space-y-2">
              <Label htmlFor="student-count" className="text-sm font-semibold text-gray-900">Număr persoane</Label>
              <Input
                id="student-count"
                type="number"
                placeholder="Exemplu: 15"
                value={studentCount}
                onChange={(e) => setStudentCount(e.target.value)}
                className={cn(inputClasses, "px-3")}
              />
            </div>

            {/* 6. Profesor asistent */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-900">Profesor asistent</Label>
              <MultiSelect 
                options={professorOptions}
                selected={selectedProfessors}
                onChange={setSelectedProfessors}
                placeholder="Caută asistenți"
                className={inputClasses}
              />
            </div>

            {/* 7. Ziua */}
            <div className="space-y-2">
              <Label htmlFor="day" className="text-sm font-semibold text-gray-900">Ziua</Label>
              <Select value={selectedDay} onValueChange={setSelectedDay}>
                <SelectTrigger id="day" className={cn(inputClasses, !selectedDay && placeholderClasses)}>
                  <SelectValue placeholder="Selectează ziua" />
                </SelectTrigger>
                <SelectContent position="popper" className="max-h-64 text-sm">
                  {days.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* 8. Ora de start */}
            <div className="space-y-2">
              <Label htmlFor="start-time" className="text-sm font-semibold text-gray-900">Ora de start</Label>
              <Input
                id="start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className={cn(inputClasses, "px-3")}
              />
            </div>
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

      {/* Rezultate ... */}
      {hasSearched && (
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-lg font-bold">Sloturi Disponibile</CardTitle>
              <CardDescription className="font-medium text-gray-600 text-sm">
                Am găsit {availableSlots.length} sloturi pentru săptămânile 1-14
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-45 h-8 text-xs border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="text-xs">
                  <SelectItem value="week">După săptămână</SelectItem>
                  <SelectItem value="date">După dată</SelectItem>
                  <SelectItem value="time">După oră</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {availableSlots.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Search className="h-10 w-10 mx-auto mb-4 opacity-20" />
                <p className="font-medium">Nu s-au găsit sloturi disponibile</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {availableSlots.map((slot) => (
                  <Card key={slot.id} className="border-l-4 border-l-brand-blue shadow-sm hover:bg-gray-50/50 transition-colors">
                    <CardContent className="pt-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-blue-50 text-brand-blue border-blue-100 font-bold">
                              Săptămâna {slot.week}
                            </Badge>
                            <Badge variant="outline" className="gap-1 border-green-200 text-green-700 bg-green-50 font-bold text-[10px] uppercase tracking-wider">
                              <CheckCircle2 className="h-3 w-3" />
                              Disponibil
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm font-medium">
                            <div className="flex items-center gap-2 text-gray-700">
                              <Calendar className="h-4 w-4 text-brand-blue" />
                              <span>{slot.date.toLocaleDateString("ro-RO", { weekday: "long", day: "numeric", month: "long" })}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-700">
                              <Clock className="h-4 w-4 text-brand-blue" />
                              <span>{slot.startTime} - {slot.endTime}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-700">
                              <MapPin className="h-4 w-4 text-brand-blue" />
                              <span>Sala {slot.room}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-700">
                              <Users className="h-4 w-4 text-brand-blue" />
                              <span>Max: {slot.capacity}</span>
                            </div>
                          </div>
                        </div>
                        <Button className="bg-brand-blue hover:bg-brand-blue-dark text-white font-bold shadow-sm active:scale-95">
                          Rezervă Slot
                        </Button>
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