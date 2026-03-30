"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { TreeSelect } from "@/components/ui/tree-select"; // Presupunem un component de TreeSelect pentru ierarhie
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, RotateCcw, Loader2, CalendarIcon, Users } from "lucide-react";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import api from "@/services/api";

export function AdminEventForm() {
  const [rooms, setRooms] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [groupsHierarchical, setGroupsHierarchical] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [eventName, setEventName] = useState("");
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [selectedProfessors, setSelectedProfessors] = useState([]);
  const [date, setDate] = useState<Date>();
  const [duration, setDuration] = useState("");
  const [studentCount, setStudentCount] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomsResp, profsResp, groupsResp] = await Promise.all([
          api.get("/data/rooms"),
          api.get("/data/professors"),
          api.get("/data/groups-hierarchical")
        ]);
        
        setRooms(roomsResp.data.map(r => ({ label: r.name, value: r.id.toString() })));
        setProfessors(profsResp.data.map(p => ({ 
          label: `${p.lastName} ${p.firstName}`, 
          value: p.id.toString() 
        })));
        setGroupsHierarchical(groupsResp.data);
      } catch (error) {
        toast.error("Eroare la încărcarea datelor");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCreateEvent = async () => {
    if (!eventName || !date || selectedRooms.length === 0 || !duration) {
      toast.error("Vă rugăm să completați câmpurile obligatorii (*)");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        subject: eventName,
        room_ids: selectedRooms.map(Number),
        group_ids: selectedGroups.map(Number),
        professor_ids: selectedProfessors.map(Number),
        reservation_date: format(date, "yyyy-MM-dd"),
        duration: parseInt(duration),
        number_of_people: studentCount ? parseInt(studentCount) : 0,
        activity_type: "events"
      };

      await api.post("/admin/reservations/events", payload);
      toast.success("Eveniment creat cu succes!");
      handleReset();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Eroare la crearea evenimentului");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setEventName(""); setSelectedRooms([]); setSelectedGroups([]);
    setSelectedProfessors([]); setDate(undefined); setDuration("");
    setStudentCount("");
  };

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-brand-blue" /></div>;

  return (
    <Card className="border-gray-200 shadow-sm max-w-5xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900 font-semibold text-xl">
          <Users className="h-5 w-5 text-brand-blue" />
          Creare Eveniment Administrativ
        </CardTitle>
        <CardDescription>
          Planificați evenimente, ședințe sau activități administrative în sălile facultății
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Nume Eveniment */}
          <div className="space-y-2 md:col-span-2">
            <Label className="text-sm font-semibold">Nume eveniment <span className="text-brand-red">*</span></Label>
            <Input 
              placeholder="Ex: Conferință Cybersecurity / Ședință Departament" 
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className="shadow-xs"
            />
          </div>

          {/* Săli MultiSelect */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Săli <span className="text-brand-red">*</span></Label>
            <MultiSelect
              options={rooms}
              selected={selectedRooms}
              onChange={setSelectedRooms}
              placeholder="Selectați sălile"
            />
          </div>

          {/* Profesori MultiSelect */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Profesori participanți</Label>
            <MultiSelect
              options={professors}
              selected={selectedProfessors}
              onChange={setSelectedProfessors}
              placeholder="Selectați profesorii"
            />
          </div>

          {/* Grupe TreeSelect (Hierarchical) */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Grupe vizate</Label>
            <TreeSelect
              data={groupsHierarchical}
              selected={selectedGroups}
              onChange={setSelectedGroups}
              placeholder="Selectați specializări/ani/grupe"
            />
          </div>

          {/* Data Picker */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Data <span className="text-brand-red">*</span></Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn("w-full justify-start text-left font-normal shadow-xs", !date && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: ro }) : <span>Selectați data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus locale={ro} />
              </PopoverContent>
            </Popover>
          </div>

          {/* Durata */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Durata <span className="text-brand-red">*</span></Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger className="shadow-xs">
                <SelectValue placeholder="Selectează durata" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((h) => (
                  <SelectItem key={h} value={h.toString()}>{h} {h === 1 ? 'oră' : 'ore'}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Nr Persoane */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Număr estimat persoane</Label>
            <Input 
              type="number" 
              placeholder="Ex: 50" 
              value={studentCount}
              onChange={(e) => setStudentCount(e.target.value)}
              className="shadow-xs"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
          <Button 
            onClick={handleCreateEvent} 
            disabled={isSubmitting}
            className="bg-brand-blue hover:bg-brand-blue-dark text-white font-medium px-8"
          >
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
            Creează Eveniment
          </Button>
          <Button onClick={handleReset} variant="outline" className="px-8">
            <RotateCcw className="mr-2 h-4 w-4" /> Resetează
          </Button>
        </div>
      </CardHeader>
    </Card>
  );
}