"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Database, RefreshCw, Clock, Calendar, BookOpen, Download, Save, Power } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Interfața pentru log-uri (Audit Trail)
interface SyncLog {
  id: string;
  timestamp: Date;
  type: "manual" | "automatic";
  syncType: "orar" | "calendar";
  status: "success" | "failed" | "in_progress";
  recordsProcessed: number;
  duration: number;
}

export function AdminSync() {
  // --- STATE ---
  const [syncInterval, setSyncInterval] = useState<string>("daily");
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [syncTime, setSyncTime] = useState("00:00");
  const [isSyncingBazaOrar, setIsSyncingBazaOrar] = useState(false);
  const [isSyncingCalendar, setIsSyncingCalendar] = useState(false);
  
  // Date simulate pentru ultima sincronizare
  const [lastSyncBazaOrar, setLastSyncBazaOrar] = useState<Date>(new Date(2026, 1, 15, 10, 30));
  const [lastSyncCalendar, setLastSyncCalendar] = useState<Date>(new Date(2026, 1, 15, 9, 15));

  // Mock data - în producție acestea vor veni din API
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([
    {
      id: "1",
      timestamp: new Date(2026, 1, 15, 10, 30),
      type: "automatic",
      syncType: "orar",
      status: "success",
      recordsProcessed: 1247,
      duration: 45,
    },
    {
      id: "2",
      timestamp: new Date(2026, 1, 15, 9, 15),
      type: "manual",
      syncType: "calendar",
      status: "success",
      recordsProcessed: 52,
      duration: 12,
    },
    {
      id: "3",
      timestamp: new Date(2026, 1, 14, 10, 30),
      type: "automatic",
      syncType: "orar",
      status: "success",
      recordsProcessed: 1198,
      duration: 42,
    },
  ]);

  // --- HANDLERS ---
  const handleManualSync = (syncType: "orar" | "calendar") => {
    const isBaza = syncType === "orar";
    isBaza ? setIsSyncingBazaOrar(true) : setIsSyncingCalendar(true);

    // Simulăm apelul către backend
    setTimeout(() => {
      const newLog: SyncLog = {
        id: Date.now().toString(),
        timestamp: new Date(),
        type: "manual",
        syncType,
        status: "success",
        recordsProcessed: Math.floor(Math.random() * 300) + (isBaza ? 1000 : 30),
        duration: Math.floor(Math.random() * 20) + (isBaza ? 30 : 10),
      };

      setSyncLogs([newLog, ...syncLogs]);
      isBaza ? setLastSyncBazaOrar(new Date()) : setLastSyncCalendar(new Date());
      isBaza ? setIsSyncingBazaOrar(false) : setIsSyncingCalendar(false);
      
      toast.success(`Sincronizare ${isBaza ? "Orar" : "Calendar Academic"} completă!`);
    }, 2000);
  };

  const handleToggleAutoSync = () => {
    const newState = !autoSyncEnabled;
    setAutoSyncEnabled(newState);
    toast.success(newState ? "Sincronizare automată activată" : "Sincronizare automată dezactivată");
  };

  const handleExportCSV = () => {
    const csvContent = [
      ["Data/Ora", "Tip Sincronizare", "Tip", "Status", "Inregistrari", "Durata (sec)"],
      ...syncLogs.map((log) => [
        log.timestamp.toLocaleString("ro-RO"),
        log.syncType === "orar" ? "Orar" : "Calendar Academic",
        log.type === "manual" ? "Manuala" : "Automata",
        log.status,
        log.recordsProcessed,
        log.duration,
      ]),
    ].map((row) => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `sync-history-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    toast.success("Istoric exportat cu succes!");
  };

  // --- HELPERS STILIZARE ---
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success": return "bg-green-50 text-green-700 border-green-100 font-bold";
      case "failed": return "bg-red-50 text-brand-red border-red-100 font-bold";
      case "in_progress": return "bg-blue-50 text-brand-blue border-blue-100 font-bold";
      default: return "bg-gray-50 text-gray-700 border-gray-100 font-bold";
    }
  };

  const getSyncTypeBadge = (type: string) => {
    return type === "orar" 
      ? "bg-blue-50 text-brand-blue border-blue-100 font-bold" 
      : "bg-orange-50 text-orange-700 border-orange-100 font-bold";
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans">
      
      {/* 1. Control Sincronizare Manuală */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Card Calendar */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 font-semibold text-xl">
              <BookOpen className="h-5 w-5 text-orange-700" /> Calendar academic
            </CardTitle>
            <CardDescription className="text-gray-600 font-medium">
              Sincronizați datele calendarului universitar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-orange-50/50 rounded-xl border border-orange-100 shadow-xs">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-orange-700" />
                <p className="text-sm font-semibold text-gray-900">Ultima sincronizare</p>
              </div>
              <p className="text-sm font-medium text-gray-700">{lastSyncCalendar.toLocaleString("ro-RO")}</p>
            </div>
            <Button
              onClick={() => handleManualSync("calendar")}
              disabled={isSyncingCalendar}
              className="w-full bg-orange-700 hover:bg-orange-800 text-white font-medium active:scale-95 transition-all shadow-md"
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", isSyncingCalendar && "animate-spin")} />
              {isSyncingCalendar ? "Se procesează..." : "Sincronizează calendar"}
            </Button>
          </CardContent>
        </Card>

        {/* Card Bază + Orar */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 font-semibold text-xl">
              <Database className="h-5 w-5 text-brand-blue" /> Orar 
            </CardTitle>
            <CardDescription className="text-gray-600 font-medium">
              Sincronizați baza de date centrală și orarul
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 shadow-xs">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-brand-blue" />
                <p className="text-sm font-semibold text-gray-900">Ultima sincronizare</p>
              </div>
              <p className="text-sm font-medium text-gray-700">{lastSyncBazaOrar.toLocaleString("ro-RO")}</p>
            </div>
            <Button
              onClick={() => handleManualSync("orar")}
              disabled={isSyncingBazaOrar}
              className="w-full bg-brand-blue hover:bg-brand-blue-dark text-white font-medium active:scale-95 transition-all shadow-md"
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", isSyncingBazaOrar && "animate-spin")} />
              {isSyncingBazaOrar ? "Se procesează..." : "Sincronizează orar"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 2. Setări Sincronizare Automată */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-gray-900 font-semibold text-xl">
              <RefreshCw className="h-5 w-5 text-brand-blue" /> Sincronizare automată orar
            </CardTitle>
            <CardDescription className="text-gray-600 font-medium pt-1">
              Configurați planificarea execuțiilor automate
            </CardDescription>
          </div>
          <Button
            variant={autoSyncEnabled ? "default" : "outline"}
            onClick={handleToggleAutoSync}
            className={cn("text-white font-medium active:scale-95 shadow-sm", autoSyncEnabled ? "bg-green-600 hover:bg-green-700" : "text-brand-red hover:text-brand-red border-red-100 hover:bg-red-50")}
          >
            <Power className="h-4 w-4 mr-2" />
            {autoSyncEnabled ? "Activată" : "Dezactivată"}
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="font-semibold text-gray-900 text-sm">Interval sincronizare</Label>
              <Select value={syncInterval} onValueChange={setSyncInterval} disabled={!autoSyncEnabled}>
                <SelectTrigger className="h-10 text-sm border-gray-200 shadow-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Zilnic (Noaptea)</SelectItem>
                  <SelectItem value="weekly">Săptămânal (Duminică)</SelectItem>
                  <SelectItem value="monthly">Lunar (Prima zi a lunii)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="font-semibold text-gray-900 text-sm">Ora sincronizare</Label>
              <Input 
                type="time" 
                value={syncTime} 
                onChange={(e) => setSyncTime(e.target.value)} 
                disabled={!autoSyncEnabled || syncInterval === "hourly"}
                className="h-10 border-gray-200 shadow-xs text-md focus-visible:ring-1 transition-colors"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => toast.success("Setări salvate!")} 
              className="flex-1 bg-brand-blue hover:bg-brand-blue-dark font-medium active:scale-95" 
              disabled={!autoSyncEnabled}
            >
              <Save className="h-4 w-4 mr-2" /> Salvează setările
            </Button>
            <Button 
              variant="outline" 
              className="text-gray-900 shadow-xs border-gray-200 hover:bg-gray-100 font-medium"
              onClick={() => { setSyncInterval("daily"); setSyncTime("00:00"); }}
              disabled={!autoSyncEnabled}
            >
              Resetează
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 3. Istoric Sincronizări */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-gray-900 font-semibold text-xl">
              <Calendar className="h-5 w-5 text-brand-blue" /> Istoric sincronizări
            </CardTitle>
            <CardDescription className="text-gray-600 font-medium">
              Monitorizarea ultimelor {syncLogs.length} activități
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            onClick={handleExportCSV} 
            className="text-brand-blue border-blue-100 hover:bg-blue-50 font-semibold shadow-xs"
          >
            <Download className="h-4 w-4 mr-2" /> Exportă CSV
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {syncLogs.map((log) => (
            <div 
              key={log.id} 
              className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl border shadow-xs transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap text-[10px]">
                  <Badge className={cn(getStatusBadge(log.status))}>
                    {log.status === "success" ? "SUCCES" : "ESUAT"}
                  </Badge>
                  <Badge className={cn(getSyncTypeBadge(log.syncType))}>
                    {log.syncType === "orar" ? "ORAR" : "CALENDAR ACADEMIC"}
                  </Badge>
                  <Badge variant="outline" className="font-bold border-gray-200 text-gray-500 bg-white">
                    {log.type.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5" /> {log.timestamp.toLocaleString("ro-RO")}
                </p>
              </div>
              <div className="text-right space-y-1">
                <p className="font-semibold text-gray-900 text-sm">{log.recordsProcessed} înregistrări</p>
                <p className="text-xs font-semibold text-gray-500 italic">{log.duration} sec</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}