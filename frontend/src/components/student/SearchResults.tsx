"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Users, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const availableDays = Array.from(
    new Set(results.map((r) => r.zi))
  ).sort(); // Poți adăuga o logică de sortare custom dacă vrei ordinea Luni-Vineri

  // Extragem săptămânile unice disponibile în rezultate pentru filtru
  const availableWeeks = Array.from(
    new Set(results.flatMap((r) => r.saptamani_lista))
  ).sort((a, b) => a - b);

  const getTypeColor = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes("lab")) return "bg-blue-100 text-blue-700 border-blue-200";
    if (t.includes("sem")) return "bg-green-100 text-green-700 border-green-200";
    if (t.includes("pro")) return "bg-purple-100 text-purple-700 border-purple-200";
    return "bg-gray-100 text-gray-700";
  };

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader>
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg">Opțiuni de recuperare găsite</CardTitle>
              <CardDescription>
                {filteredAndSortedResults.length} sloturi găsite
              </CardDescription>
            </div>
            
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
          </div>

          {/* Secțiune Filtre Dinamice */}
          <div className="flex flex-wrap gap-3 p-3 bg-white rounded-md border border-gray-100 shadow-sm">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase ml-1">Filtru Zi</span>
              <Select value={filterDay} onValueChange={setFilterDay}>
                <SelectTrigger className="w-32 h-9 text-sm">
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

            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase ml-1">Filtru Săptămână</span>
              <Select value={filterWeek} onValueChange={setFilterWeek}>
                <SelectTrigger className="w-32 h-9 text-sm">
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

            {(filterDay !== "all" || filterWeek !== "all") && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-6 h-9 text-xs text-gray-500 hover:text-brand-red"
                onClick={() => { setFilterDay("all"); setFilterWeek("all"); }}
              >
                Resetează filtrele
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {filteredAndSortedResults.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p className="font-medium">Nu există rezultate pentru filtrele selectate.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredAndSortedResults.map((result, idx) => (
              <Card key={idx} className="group hover:border-brand-blue/50 transition-all duration-300">
                <CardContent className="p-5">
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

                    <div className="pt-1 text-center md:text-left">
                      <span className="text-gray-400 text-[11px] font-medium italic">
                        * Verifică cu profesorul înainte de a merge la altă grupă.
                      </span>
                    </div>
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