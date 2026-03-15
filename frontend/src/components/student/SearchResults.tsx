"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Filter, ArrowUpDown, Clock, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "../ui/label";

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

interface SearchResultsProps {
  results: AlternativeOption[];
  selectedSubject: string;
  selectedType: string;
}

const DAYS_ORDER: Record<string, number> = {
  "Luni": 1,
  "Marți": 2,
  "Miercuri": 3,
  "Joi": 4,
  "Vineri": 5,
  "Sâmbătă": 6,
  "Duminică": 7
};

export function SearchResults({ results, selectedSubject, selectedType }: SearchResultsProps) {
  const [sortBy, setSortBy] = useState<string>("time");
  const [filterDay, setFilterDay] = useState<string>("all");
  const [filterWeek, setFilterWeek] = useState<string>("all");

  // Logica de filtrare și sortare
  const filteredAndSortedResults = results
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

  // Extragem zilele unice disponibile în rezultate pentru filtru
  const availableDays = Array.from(new Set(results.map((r) => r.zi)))
  .sort((a, b) => (DAYS_ORDER[a] || 99) - (DAYS_ORDER[b] || 99));

  // Extragem săptămânile unice disponibile în rezultate pentru filtru
  const availableWeeks = Array.from(
    new Set(results.flatMap((r) => r.saptamani_lista))
  ).sort((a, b) => a - b);

  const getTypeColor = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes("lab")) return "font-bold bg-blue-50 text-brand-blue border-blue-100 ";
    if (t.includes("sem")) return "font-bold bg-green-50 text-green-700 border-green-100";
    if (t.includes("pro")) return "font-bold bg-purple-50 text-purple-700 border-purple-100";
    return "font-bold bg-gray-100 text-gray-700";
  };

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-lg">Opțiuni de recuperare găsite</CardTitle>
            <CardDescription>
              {filteredAndSortedResults.length} sloturi disponibile pentru selecția curentă
            </CardDescription>
          </div>
        </div>

        {/* --- ZONA UNIFICATĂ DE FILTRARE ȘI SORTARE --- */}
        <div className="flex flex-wrap items-end gap-4 p-4 w-fit">
          {/* Filtru Zi */}
          <div className="space-y-1.5 flex-1 min-w-35">
            <Label className="text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1.5 ml-0.5">
              <Calendar className="h-3.5 w-3.5" /> Ziua
            </Label>
            <Select value={filterDay} onValueChange={setFilterDay}>
              <SelectTrigger className="h-10 text-sm border-gray-200 focus:ring-brand-blue/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toate zilele</SelectItem>
                {availableDays.map((day) => (
                  <SelectItem key={day} value={day}>{day}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtru Săptămână */}
          <div className="space-y-1.5 flex-1 min-w-35">
            <Label className="text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1.5 ml-0.5">
              <Filter className="h-3.5 w-3.5" /> Săptămâna
            </Label>
            <Select value={filterWeek} onValueChange={setFilterWeek}>
              <SelectTrigger className="h-10 text-sm border-gray-200 focus:ring-brand-blue/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Oricare</SelectItem>
                {availableWeeks.map((w) => (
                  <SelectItem key={w} value={w.toString()}>Săptămâna {w}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sortare */}
          <div className="space-y-1.5 flex-1 min-w-35">
            <Label className="text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1.5 ml-0.5">
              <ArrowUpDown className="h-3.5 w-3.5" /> Sortează după
            </Label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-10 text-sm border-gray-200 focus:ring-brand-blue/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="time">Ora de start</SelectItem>
                <SelectItem value="group">Nume grupă</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-2">
        {filteredAndSortedResults.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-gray-50/50 rounded-lg border border-dashed">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="font-medium">Nu există rezultate pentru filtrele selectate.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredAndSortedResults.map((result, idx) => (
              <Card key={idx} className="border-l-4 border-l-brand-blue shadow-sm hover:bg-gray-50/50 transition-colors overflow-hidden">
                <CardContent className="p-0">
                  {/* Header Card: Nume Prof la stanga, Tip la dreapta */}
                  <div className="px-5 py-3 flex items-center justify-between">
                    <span className="font-bold text-gray-900 text-base">{result.profesor}</span>
                    <Badge variant="outline" className={cn("font-bold text-[10px] uppercase px-2 py-0.5", getTypeColor(selectedType))}>
                      {selectedType}
                    </Badge>
                  </div>

                  {/* Informatii principale - Grid layout */}
                  <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    
                    {/*Zi*/}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <Calendar className="h-4 w-4 text-brand-blue shrink-0" />
                        <span>{result.zi}</span>
                      </div>
                    </div>

                    {/*Interval*/}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <Clock className="h-4 w-4 text-brand-blue shrink-0" />
                        <span>{result.ora_start} - {result.ora_final}</span>
                      </div>
                    </div>

                    {/*Sala*/}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <MapPin className="h-4 w-4 text-brand-blue shrink-0" />
                        <span>Sala {result.sala}</span>
                      </div>
                    </div>

                    {/*Grupe*/}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <Users className="h-4 w-4 text-brand-blue shrink-0" />
                        <span>{result.grupa}</span>
                      </div>
                    </div>

                    {/*Saptamani*/}
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <span>Săptămânile {result.saptamani_grupate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Card: Indicatia pe toata lungimea */}
                  <div className="px-5 py-2.5 flex items-center gap-2">
                    <Info className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-gray-500 text-xs font-medium italic">
                      Verifică cu profesorul înainte de merge cu altă grupă.
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}