"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, CheckCircle2, XCircle, Clock, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import api from "@/services/api";
import { AxiosError } from "axios";
import { useState } from "react";

// Definim interfața aici pentru a evita importurile circulare și eroarea de tip "any"
export interface ProfessorRequest {
  id: number;
  lastName: string;
  firstName: string;
  email: string;
  status: string;
  data_cerere: string;
  data_solutionare?: string;
}

interface AdminRequestsProps {
  requests: ProfessorRequest[];
  onUpdate: () => void;
}

export function AdminRequests({ requests, onUpdate }: AdminRequestsProps) {
  const [processingId, setProcessingId] = useState<number | null>(null);

  const pending = requests.filter(r => r.status === "pending");
  const processed = requests.filter(r => r.status !== "pending");

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
      // Executăm onUpdate() indiferent dacă a reușit sau a dat eroare
      // pentru a reflecta noul status (rejected) în listă
      setProcessingId(null); // Finalizează procesarea
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
          <CardTitle className="flex items-center gap-2 text-gray-900 font-semibold text-xl">
            <Mail className="h-5 w-5 text-brand-blue" /> Cereri în așteptare
          </CardTitle>
          <CardDescription className="text-gray-600 font-medium">
            Procesați solicitările de acces pentru cadrele didactice
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {pending.length === 0 ? (
            <div className="text-center py-12 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="font-medium text-gray-500">Nu există cereri în așteptare</p>
            </div>
          ) : (
            pending.map((request) => (
              <Card key={request.id} className="border-l-4 border-l-amber-700 shadow-xs hover:bg-gray-50/30 transition-colors">
                <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-2 w-full">
                    {/* 1. Numele cu eticheta */}
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-gray-900 text-lg">
                        {request.lastName} {request.firstName}
                      </span>
                      <Badge className={getStatusBadge(request.status)}>ÎN AȘTEPTARE</Badge>
                    </div>

                    {/* 2. Emailul cu icon */}
                    <div className="flex items-center gap-2 text-brand-blue font-semibold">
                      <Mail className="h-4 w-4" />
                      <span className="text-sm">{request.email}</span>
                    </div>

                    {/* 3. Restul (Data) */}
                    <p className="text-sm text-gray-500 font-medium flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5" /> Trimisă la: {formatDate(request.data_cerere)}
                    </p>
                  </div>

                  <div className="flex gap-2 shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                    <Button 
                      disabled={processingId === request.id}
                      onClick={() => handleAction(request.id, 'approve')} 
                      className="bg-green-600 hover:bg-green-700 text-white font-semibold flex-1 sm:flex-none active:scale-95 shadow-md"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" /> {processingId === request.id ? "Se procesează..." : "Aprobă"}
                    </Button>
                    <Button 
                      variant="outline" 
                      disabled={processingId === request.id}
                      onClick={() => handleAction(request.id, 'reject')} 
                      className="text-brand-red hover:text-brand-red border-red-100 hover:bg-red-50 font-semibold flex-1 sm:flex-none active:scale-95 shadow-md"
                    >
                      <XCircle className="h-4 w-4 mr-2" /> {processingId === request.id ? "Se procesează..." : "Respinge"} 
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="bg-transparent border-none pb-2">
          <CardTitle className="flex items-center gap-2 text-gray-900 font-semibold text-xl">
            <History className="h-5 w-5 text-brand-blue" /> Istoric cereri
          </CardTitle>
          <CardDescription className="text-gray-600 font-medium">Cereri procesate recent</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {processed.length === 0 ? (
            <p className="text-center py-6 text-gray-500 font-medium text-sm italic">Nicio cerere procesată</p>
          ) : (
            processed.map((request) => (
              <Card key={request.id} className="opacity-85 border-gray-100 shadow-none hover:opacity-100 transition-opacity">
                <CardContent className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-900 text-sm">{request.lastName} {request.firstName}</span>
                      <Badge className={cn(getStatusBadge(request.status), "text-[10px]")}>
                        {request.status === "approved" ? "APROBATĂ" : "RESPINSĂ"}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 font-semibold">
                      Solicitat la: {formatDate(request.data_cerere)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}