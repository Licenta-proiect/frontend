"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Filter, ArrowUpDown, Clock, Info, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { AlternativeOption } from "@/components/student/StudentSearch";

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
};

export function SearchResults({ results, selectedSubject, selectedType }: SearchResultsProps) {
  const step = 3;
  const [sortBy, setSortBy] = useState<string>("time");
  const [filterDay, setFilterDay] = useState<string>("all");
  const [filterWeek, setFilterWeek] = useState<string>("all");
  const [displayLimit, setDisplayLimit] = useState(step);

  const resetLocalFilters = () => {
    setFilterDay("all");
    setFilterWeek("all");
    setSortBy("time");
    setDisplayLimit(step);
  };

  // Filtering and sorting logic
  const allFilteredAndSorted = useMemo(() => {
    return results
      .filter((result) => {
        const matchDay = filterDay === "all" || result.day === filterDay;
        const matchWeek = filterWeek === "all" || result.weeks_list.includes(parseInt(filterWeek));
        return matchDay && matchWeek;
      })
      .sort((a, b) => {
        if (sortBy === "time") return a.start_time.localeCompare(b.start_time);
        if (sortBy === "group") return a.group.localeCompare(b.group);
        return 0;
      });
  }, [results, filterDay, filterWeek, sortBy]);

  const visibleResults = useMemo(() => {
    return allFilteredAndSorted.slice(0, displayLimit);
  }, [allFilteredAndSorted, displayLimit]);

  // Extract available days
  const availableDays = useMemo(() => 
    Array.from(new Set(results.map((r) => r.day)))
      .sort((a, b) => (DAYS_ORDER[a] || 99) - (DAYS_ORDER[b] || 99))
  , [results]);

  // Extract available weeks
  const availableWeeks = useMemo(() => 
    Array.from(new Set(results.flatMap((r) => r.weeks_list)))
      .sort((a, b) => a - b)
  , [results]);

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
              {allFilteredAndSorted.length} sloturi disponibile pentru selecția curentă
            </CardDescription>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-end gap-4 p-4 w-fit">
          {/* Day */}
          <div className="space-y-1.5 flex-1 min-w-35">
            <Label className="text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1.5 ml-0.5">
              <Calendar className="h-3.5 w-3.5" /> Ziua
            </Label>
            <Select value={filterDay} onValueChange={(val) => { setFilterDay(val); setDisplayLimit(step); }}>
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

          {/* Week */}
          <div className="space-y-1.5 flex-1 min-w-35">
            <Label className="text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1.5 ml-0.5">
              <Filter className="h-3.5 w-3.5" /> Săptămâna
            </Label>
            <Select value={filterWeek} onValueChange={(val) => { setFilterWeek(val); setDisplayLimit(step); }}>
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

          {/* Sort */}
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

          {/* Reset filters */}
          {(filterDay !== "all" || filterWeek !== "all" ) && (
            <div className="h-9 flex items-center">
              <Button 
                variant="outline" 
                onClick={resetLocalFilters}
                className="h-9 text-sm px-4 gap-2 border-gray-200 text-gray-700  hover:bg-gray-50"
              >
                <RotateCcw className="h-4 w-4" />
                Resetează filtrele
              </Button>
            </div>
          )}

        </div>
      </CardHeader>
      
      <CardContent className="pt-2">
        {allFilteredAndSorted.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-gray-50/50 rounded-lg border border-dashed">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="font-medium text-gray-600 italic">Nu există rezultate pentru filtrele selectate.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4">
              {visibleResults.map((result, idx) => (
                <Card key={idx} className="border-l-4 border-l-brand-blue shadow-sm hover:bg-gray-50/50 transition-colors overflow-hidden">
                  <CardContent className="p-0">
                    {/* Header */}
                    <div className="px-5 py-3 flex items-center justify-between">
                      <span className="font-bold text-gray-900 text-base">{result.professor}</span>
                      <Badge variant="outline" className={cn("font-bold text-[10px] uppercase px-2 py-0.5", getTypeColor(selectedType))}>
                        {selectedType}
                      </Badge>
                    </div>

                    <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {/*Day*/}
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <Calendar className="h-4 w-4 text-brand-blue shrink-0" />
                        <span>{result.day}</span>
                      </div>

                      {/*Duration*/}
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <Clock className="h-4 w-4 text-brand-blue shrink-0" />
                        <span>{result.start_time} - {result.end_time}</span>
                      </div>

                      {/*Room*/}
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <MapPin className="h-4 w-4 text-brand-blue shrink-0" />
                        <span>Sala {result.room}</span>
                      </div>

                      {/*Groups*/}
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <Users className="h-4 w-4 text-brand-blue shrink-0" />
                        <span>{result.group}</span>
                      </div>

                      {/*Weeks*/}
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        {result.weeks_list.length === 1 ? "Săptămâna" : "Săptămânile"}{" "}
                        {result.weeks_grouped}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="px-5 py-2.5 flex items-center gap-2">
                      <Info className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-gray-500 text-xs font-medium italic">
                        Verifică cu profesorul înainte de a merge cu altă grupă.
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* SHOW MORE / LESS */}
            <div className="flex flex-col items-center gap-2 pt-2">
              {allFilteredAndSorted.length > displayLimit && (
                <Button 
                  variant="ghost" 
                  className="w-full font-semibold border-gray-200 text-brand-blue hover:bg-blue-50 transition-all active:scale-95"
                  onClick={() => setDisplayLimit(prev => prev + step)}
                >
                  Încarcă mai multe opțiuni ({allFilteredAndSorted.length - displayLimit} rămase)
                </Button>
              )}

              {displayLimit > step && (
                <Button 
                  variant="link" 
                  className="text-gray-500"
                  onClick={() => {
                    setDisplayLimit(step);
                  }}
                >
                  Arată mai puține
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}