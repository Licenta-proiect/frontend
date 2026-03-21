"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Database, RefreshCw, Clock, Calendar, BookOpen, Download, Save, Power, Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import api from "@/services/api"; 

interface SyncLog {
  id: string;
  startDate: string;
  endDate: string | null;
  triggerType: "Manual" | "Automat";
  syncType: string; 
  status: "Succes" | "Eroare" | "În curs";
  errorMessage: string | null;
}

export function AdminSync() {
  const step = 5; // Step limit to display
  const [syncInterval, setSyncInterval] = useState<string>("daily");
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [syncTime, setSyncTime] = useState("00:00");
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [displayLimit, setDisplayLimit] = useState(step); 
  
  const prevSyncActive = useRef(false);

  const lastCalendarSyncDate = useMemo(() => {
    const lastSync = syncLogs.find(l => l.syncType === "Calendar" && l.status === "Succes");
    return lastSync?.endDate ? new Date(lastSync.endDate).toLocaleString("ro-RO") : "Nicio sincronizare reușită";
  }, [syncLogs]);

  const lastOrarSyncDate = useMemo(() => {
    const lastSync = syncLogs.find(l => l.syncType === "Base + Schedule" && l.status === "Succes");
    return lastSync?.endDate ? new Date(lastSync.endDate).toLocaleString("ro-RO") : "Nicio sincronizare reușită";
  }, [syncLogs]);

  const isAnySyncActive = useMemo(() => 
    syncLogs.some(log => log.status === "În curs"), 
  [syncLogs]);

  const formatDuration = (start: string, end: string | null) => {
    if (!end) return null;
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    const totalSeconds = Math.floor((e - s) / 1000);
    
    if (totalSeconds < 60) return `${totalSeconds} secunde`;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes} min și ${seconds} sec`;
  };

  const fetchLogs = useCallback(async () => {
    try {
      const response = await api.get("/admin/sync/history");
      const filteredLogs = response.data.filter((log: SyncLog) => 
        log.syncType === "Calendar" || log.syncType === "Base + Schedule"
      );
      
      if (prevSyncActive.current && !filteredLogs.some((l: SyncLog) => l.status === "În curs")) {
        const lastLog = filteredLogs[0];
        if (lastLog.status === "Succes") {
          toast.success(`Sincronizarea ${lastLog.syncType} s-a finalizat cu succes!`);
        } else if (lastLog.status === "Eroare") {
          toast.error(`Eroare la sincronizarea ${lastLog.syncType}!`);
        }
      }
      
      prevSyncActive.current = filteredLogs.some((l: SyncLog) => l.status === "În curs");
      setSyncLogs(filteredLogs);
    } catch (error) {
      console.error("Eroare la încărcarea istoricului:", error);
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      const response = await api.get("/admin/sync/settings");
      if (response.data) {
        setSyncInterval(response.data.sync_interval);
        setAutoSyncEnabled(response.data.auto_sync_enabled);
        setSyncTime(response.data.sync_time);
      }
    } catch (error) {
      console.error("Eroare setări:", error);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadInitialData = async () => {
      if (!isMounted) return;
      await Promise.all([fetchSettings(), fetchLogs()]);
    };
    loadInitialData();
    return () => { isMounted = false; };
  }, [fetchSettings, fetchLogs]);

  useEffect(() => {
    if (!isAnySyncActive) return;
    const interval = setInterval(() => {
      fetchLogs();
    }, 3000);
    return () => clearInterval(interval);
  }, [isAnySyncActive, fetchLogs]);

  const handleManualSync = async (type: "orar" | "calendar") => {
    const isBaza = type === "orar";
    const endpoint = isBaza ? "/admin/sync/base-schedule" : "/admin/sync/calendar";
    
    try {
      await api.post(endpoint);
      toast.info("Sincronizarea a început pe server...");
      fetchLogs();
    } catch {
      toast.error("Eroare: Nu s-a putut contacta serverul.");
    }
  };

  const handleSaveSettings = async () => {
    try {
      await api.post("/admin/sync/settings", {
        auto_sync_enabled: autoSyncEnabled,
        sync_interval: syncInterval,
        sync_time: syncTime
      });
      toast.success("Setări salvate cu succes!");
    } catch {
      toast.error("Eroare la salvarea setărilor");
    }
  };

  const handleToggleAutoSync = () => setAutoSyncEnabled(!autoSyncEnabled);

  const handleExportCSV = () => {
    const csvContent = [
      ["Data Start", "Tip Sincronizare", "Mod", "Status", "Durata"],
      ...syncLogs.map((log) => [
        new Date(log.startDate).toLocaleString("ro-RO"),
        log.syncType,
        log.triggerType,
        log.status,
        formatDuration(log.startDate, log.endDate) || "N/A"
      ]),
    ].map((row) => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `istoric-sync-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Succes": return "bg-green-50 text-green-700 border-green-100 font-bold";
      case "Eroare": return "bg-red-50 text-brand-red border-red-100 font-bold";
      case "În curs": return "bg-blue-50 text-brand-blue border-blue-100 font-bold";
      default: return "bg-gray-50 text-gray-700 border-gray-100 font-bold";
    }
  };

  const getSyncTypeBadge = (type: string) => {
    return type === "Base + Schedule" 
      ? "bg-blue-50 text-brand-blue border-blue-100 font-bold" 
      : "bg-orange-50 text-orange-700 border-orange-100 font-bold";
  };

  // The slice for visible history
  const visibleLogs = syncLogs.slice(0, displayLimit);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans">
      
      {/* 1. Manual Sync Control */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Card Calendar */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 font-semibold text-xl">
              <BookOpen className="h-5 w-5 text-orange-700" /> Calendar academic
            </CardTitle>
            <CardDescription className="text-gray-600 font-medium">Sincronizați datele calendarului universitar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-orange-50/50 rounded-xl border border-orange-100 shadow-xs">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-orange-700" />
                <p className="text-sm font-semibold text-gray-900">Ultima sincronizare</p>
              </div>
              <p className="text-sm font-medium text-gray-700">{lastCalendarSyncDate}</p>
            </div>
            <Button
              onClick={() => handleManualSync("calendar")}
              disabled={isAnySyncActive}
              className="w-full bg-orange-700 hover:bg-orange-800 text-white font-medium active:scale-95 transition-all shadow-md"
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", isAnySyncActive && "animate-spin")} />
              {isAnySyncActive ? "Sistem ocupat..." : "Sincronizează calendar"}
            </Button>
          </CardContent>
        </Card>

        {/* Base Card + Schedule */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 font-semibold text-xl">
              <Database className="h-5 w-5 text-brand-blue" /> Orar 
            </CardTitle>
            <CardDescription className="text-gray-600 font-medium">Sincronizați baza de date centrală și orarul</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 shadow-xs">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-brand-blue" />
                <p className="text-sm font-semibold text-gray-900">Ultima sincronizare</p>
              </div>
              <p className="text-sm font-medium text-gray-700">{lastOrarSyncDate}</p>
            </div>
            <Button
              onClick={() => handleManualSync("orar")}
              disabled={isAnySyncActive}
              className="w-full bg-brand-blue hover:bg-brand-blue-dark text-white font-medium active:scale-95 transition-all shadow-md"
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", isAnySyncActive && "animate-spin")} />
              {isAnySyncActive ? "Sistem ocupat..." : "Sincronizează orar"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 2. Automatic Sync Settings */}
      <Card className={cn("border-gray-200 shadow-sm transition-opacity", isAnySyncActive && "opacity-60 pointer-events-none")}>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-gray-900 font-semibold text-xl">
              <RefreshCw className="h-5 w-5 text-brand-blue" /> Sincronizare automată orar
            </CardTitle>
            <CardDescription className="text-gray-600 font-medium pt-1">Configurați planificarea execuțiilor automate</CardDescription>
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
                <SelectTrigger className="h-10 text-sm border-gray-200 shadow-xs focus-visible:ring-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Zilnic (noaptea)</SelectItem>
                  <SelectItem value="weekly">Săptămânal (duminică)</SelectItem>
                  <SelectItem value="monthly">Lunar (prima zi a lunii)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="font-semibold text-gray-900 text-sm">Ora sincronizare</Label>
              <Input 
                type="time" 
                value={syncTime} 
                onChange={(e) => setSyncTime(e.target.value)} 
                disabled={!autoSyncEnabled}
                className="h-10 border-gray-200 shadow-xs text-md focus-visible:ring-1 transition-colors"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleSaveSettings} className="flex-1 bg-brand-blue hover:bg-brand-blue-dark font-medium active:scale-95 text-white" disabled={!autoSyncEnabled}>
              <Save className="h-4 w-4 mr-2" /> Salvează setările
            </Button>
            <Button variant="outline" className="text-gray-900 shadow-xs border-gray-200 hover:bg-gray-100 font-medium" onClick={() => { setSyncInterval("daily"); setSyncTime("00:00"); }} disabled={!autoSyncEnabled}>
              Resetează
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 3. Synchronization History */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-gray-900 font-semibold text-xl">
              <Calendar className="h-5 w-5 text-brand-blue" /> Istoric sincronizări
            </CardTitle>
            <CardDescription className="text-gray-600 font-medium">Monitorizarea ultimelor activități</CardDescription>
          </div>
          <Button variant="outline" onClick={handleExportCSV} className="text-brand-blue border-blue-100 hover:bg-blue-50 font-semibold shadow-xs">
            <Download className="h-4 w-4 mr-2" /> Exportă CSV
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {syncLogs.length === 0 ? (
            <p className="text-center py-6 text-gray-500 italic">Nicio activitate înregistrată</p>
          ) : (
            <>
              {visibleLogs.map((log) => {
                const durationText = formatDuration(log.startDate, log.endDate);
                return (
                  <div key={log.id} className="flex items-center justify-between p-4 rounded-xl border shadow-xs group hover:border-brand-blue/50 transition-all duration-300">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap text-[10px]">
                        <Badge className={cn(getStatusBadge(log.status))}>{log.status.toUpperCase()}</Badge>
                        <Badge className={cn(getSyncTypeBadge(log.syncType))}>{log.syncType.toUpperCase()}</Badge>
                        <Badge variant="outline" className="font-bold border-gray-200 text-gray-500 bg-white">{log.triggerType.toUpperCase()}</Badge>
                      </div>
                      <p className="text-sm font-medium text-gray-600 flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5" /> {new Date(log.startDate).toLocaleString("ro-RO")}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="flex items-center justify-end gap-1.5 text-gray-900 font-semibold text-sm">
                        {log.status === "În curs" ? (
                          <RefreshCw className="h-3.5 w-3.5 animate-spin text-brand-blue" />
                        ) : (
                          <Timer className="h-3.5 w-3.5 text-gray-400" />
                        )}
                        <span>{log.status === "În curs" ? "Se procesează..." : durationText}</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Load more button */}
              {syncLogs.length > displayLimit && (
                <Button 
                  variant="ghost" 
                  className="w-full font-semibold border-gray-200 text-brand-blue hover:bg-blue-50 transition-all active:scale-95"
                  onClick={() => setDisplayLimit(prev => prev + step)}
                >
                  Încarcă mai multe înregistrări ({syncLogs.length - displayLimit} rămase)
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}