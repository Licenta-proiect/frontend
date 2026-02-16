"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Search, RotateCcw } from "lucide-react";
import { toast } from "sonner";

export function StudentSearch() {
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [attendsCourse, setAttendsCourse] = useState(false);

  const groups = ["1101A", "1101B", "1102A", "1102B"];
  const subjects = ["Programare Orientată pe Obiecte", "Baze de Date", "Sisteme de Operare"];
  const types = ["Seminar", "Laborator", "Proiect"];

  const handleSearch = () => {
    if (!selectedGroup || !selectedSubject || !selectedType) {
      toast.error("Vă rugăm să completați toate câmpurile obligatorii");
      return;
    }
    console.log({ selectedGroup, selectedSubject, selectedType, attendsCourse });
  };

  const handleReset = () => {
    setSelectedGroup("");
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <Label htmlFor="search-group" className="text-sm font-semibold text-gray-900">
              Grupa <span className="text-brand-red">*</span>
            </Label>
            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger id="search-group" className="focus:ring-brand-blue/30 border-gray-200">
                <SelectValue placeholder="Selectează grupa" />
              </SelectTrigger>
              <SelectContent>
                {groups.map((group) => (
                  <SelectItem key={group} value={group}>Grupa {group}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="search-subject" className="text-sm font-semibold text-gray-900">
              Materia <span className="text-brand-red">*</span>
            </Label>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger id="search-subject" className="focus:ring-brand-blue/30 border-gray-200">
                <SelectValue placeholder="Selectează materia" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="search-type" className="text-sm font-semibold text-gray-900">
              Tip activitate <span className="text-brand-red">*</span>
            </Label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger id="search-type" className="focus:ring-brand-blue/30 border-gray-200">
                <SelectValue placeholder="Selectează tipul" />
              </SelectTrigger>
              <SelectContent>
                {types.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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