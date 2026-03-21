"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, CheckCircle2, XCircle, Clock, History, RefreshCw } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import api from "@/services/api";
import { AxiosError } from "axios";
import { useMemo, useState } from "react";

export interface ProfessorRequest {
  id: number;
  lastName: string;
  firstName: string;
  email: string;
  status: string;
  request_date: string;
  resolution_date?: string;
}

interface AdminRequestsProps {
  requests: ProfessorRequest[];
  onUpdate: () => void;
  isLoading: boolean;
}

export function AdminRequests({ requests, onUpdate, isLoading }: AdminRequestsProps) {
  const step = 5;
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [displayLimit, setDisplayLimit] = useState(step);
  const [pendingLimit, setPendingLimit] = useState(step);

  const allPending = useMemo(() => {
    return requests
      .filter(r => r.status === "pending")
      .sort((a, b) => new Date(b.request_date).getTime() - new Date(a.request_date).getTime());
  }, [requests]);
  const visiblePending = allPending.slice(0, pendingLimit);

  // Filter history based on local status statusFilter
  const allProcessed = useMemo(() => {
    const history = requests.filter(r => r.status !== "pending");
    const filtered = statusFilter === "all" 
      ? history 
      : history.filter(r => r.status === statusFilter);
      
    // Always sort the most recent first
    return filtered.sort((a, b) => new Date(b.request_date).getTime() - new Date(a.request_date).getTime());
  }, [requests, statusFilter]);
  const visibleProcessed = allProcessed.slice(0, displayLimit);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending": return "bg-amber-50 text-amber-700 border-amber-100 font-bold";
      case "approved": return "bg-green-50 text-green-700 border-green-100 font-bold";
      case "rejected": return "bg-red-50 text-brand-red border-red-100 font-bold";
      default: return "bg-gray-50 text-gray-700 border-gray-100 font-bold";
    }
  };

  const handleAction = async (requestId: number, action: 'approve' | 'reject') => {
    setProcessingId(requestId);

    try {
      await api.post(`/admin/requests/${action}/${requestId}`);
      toast.success(action === 'approve' ? "Cerere aprobată!" : "Cerere respinsă!");
    } catch (error) {
      const axiosError = error as AxiosError<{ detail: string }>;
      const errorMessage = axiosError.response?.data?.detail || "Eroare la procesare";
      toast.error(errorMessage);
    } finally {
      // We execute onUpdate() whether it succeeded or failed
      // to reflect the new status (rejected) in the list
      setProcessingId(null);
      onUpdate();
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? "Dată invalidă" : date.toLocaleString("ro-RO");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="bg-transparent border-none pb-2">
          {/* Header with title and refresh button */}
          <div className="flex items-center gap-3">
            <CardTitle className="flex items-center gap-2 text-gray-900 font-semibold text-xl">
              <Mail className="h-5 w-5 text-brand-blue" /> Cereri în așteptare
            </CardTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onUpdate}
              disabled={isLoading} 
              className="h-8 w-8 text-brand-blue hover:bg-blue-50 rounded-full transition-all"
            >
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            </Button>
          </div>
          <CardDescription className="text-gray-600 font-medium">
            Procesați solicitările de acces pentru cadrele didactice
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {allPending.length === 0 ? (
            <div className="text-center py-12 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="font-medium text-gray-600 italic">Nu există cereri în așteptare</p>
            </div> 
          ) : (
            <>
              {visiblePending.map((request) => (
                <Card key={request.id} className="shadow-xs group hover:border-brand-blue/50 transition-all duration-300">
                  <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5">
                    <div className="space-y-2 w-full">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-gray-900 text-md">
                          {request.lastName} {request.firstName}
                        </span>
                        <Badge className={getStatusBadge(request.status)}>ÎN AȘTEPTARE</Badge>
                      </div>

                      <div className="flex items-center gap-2 text-brand-blue font-semibold">
                        <Mail className="h-4 w-4" />
                        <span className="text-sm">{request.email}</span>
                      </div>

                      <p className="text-sm text-gray-500 font-medium flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5" /> Trimisă la: {formatDate(request.request_date)}
                      </p>
                    </div>

                    <div className="flex gap-2 shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                      <Button 
                        disabled={processingId === request.id}
                        onClick={() => handleAction(request.id, 'approve')} 
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold flex-1 sm:flex-none active:scale-95 shadow-sm"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" /> {processingId === request.id ? "Se procesează..." : "Aprobă"}
                      </Button>
                      <Button 
                        variant="outline" 
                        disabled={processingId === request.id}
                        onClick={() => handleAction(request.id, 'reject')} 
                        className="text-brand-red hover:text-brand-red border-red-100 hover:bg-red-50 font-semibold flex-1 sm:flex-none active:scale-95 shadow-sm"
                      >
                        <XCircle className="h-4 w-4 mr-2" /> {processingId === request.id ? "Se procesează..." : "Respinge"} 
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* "See more" button for Pending */}
              {allPending.length > pendingLimit && (
                <Button 
                  variant="ghost" 
                  className="w-full font-semibold border-gray-200 text-brand-blue hover:bg-blue-50 transition-all active:scale-95"
                  onClick={() => setPendingLimit(prev => prev + step)}
                >
                  Încarcă mai multe cereri ({allPending.length - pendingLimit} rămase)
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="bg-transparent border-none pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-gray-900 font-semibold text-xl">
              <History className="h-5 w-5 text-brand-blue" /> Istoric cereri
            </CardTitle>
            <CardDescription className="text-gray-600 font-medium pt-1">Cereri procesate recent</CardDescription>
          </div>
          
          {/* History Filter */}
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-10 text-sm border-gray-200 shadow-xs min-w-35">
                <SelectValue placeholder="Filtrează" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toate</SelectItem>
                <SelectItem value="approved">Aprobate</SelectItem>
                <SelectItem value="rejected">Respinse</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {allProcessed.length === 0 ? (
            <p className="text-center py-12 bg-gray-50/50 rounded-lg border border-dashed font-medium text-gray-600 italic">Nicio cerere găsită</p>
          ) : (
            <>
            {visibleProcessed.map((request) => (
              <Card key={request.id} className="shadow-xs group hover:border-brand-blue/50 transition-all duration-300">
                <CardContent className="p-4 flex flex-col sm:flex-row items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-900 text-md">
                        {request.lastName} {request.firstName}
                      </span>
                      <Badge className={cn(getStatusBadge(request.status))}>
                        {request.status === "approved" ? "APROBATĂ" : "RESPINSĂ"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-brand-blue font-semibold">
                      <Mail className="h-4 w-4" />
                      <span className="text-sm">{request.email}</span>
                    </div>
                    <p className="text-xs text-gray-500 font-semibold">
                      Solicitat la: {formatDate(request.request_date)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* "See more" button */}
            {allProcessed.length > displayLimit && (
              <Button 
                variant="ghost" 
                className="w-full font-semibold border-gray-200 text-brand-blue hover:bg-blue-50 transition-all active:scale-95"
                onClick={() => setDisplayLimit(prev => prev + step)}
              >
                Încarcă mai multe cereri ({allProcessed.length - displayLimit} rămase)
              </Button>
            )}

            {/* "See less" button */}
            {displayLimit > step && (
              <Button 
                variant="link" 
                onClick={() => {
                  setDisplayLimit(step);
                  //window.scrollTo({ top: 0, behavior: 'smooth' }); // Opțional, pentru a reveni sus
                }}
              >
                Arată mai puține
              </Button>
            )}
          </>
        )}
      </CardContent>
      </Card>
    </div>
  );
}