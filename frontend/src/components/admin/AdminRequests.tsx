import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, CheckCircle2, XCircle, Clock, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function AdminRequests({ requests }: { requests: any[] }) {
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

  return (
    <div className="space-y-6">
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-100 bg-linear-to-r from-white to-blue-50/30">
          <CardTitle className="flex items-center gap-2 text-gray-900 font-bold text-xl">
            <Mail className="h-5 w-5 text-brand-blue" /> Cereri în Așteptare
          </CardTitle>
          <CardDescription className="font-medium text-gray-600">Procesați solicitările de acces pentru cadrele didactice</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          {pending.length === 0 ? (
            <div className="text-center py-12 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="font-bold text-gray-500">Nu există cereri în așteptare</p>
            </div>
          ) : (
            pending.map((request) => (
              <Card key={request.id} className="border-l-4 border-l-amber-500 shadow-xs">
                <CardContent className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1 w-full">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-900">{request.email}</span>
                      <Badge className={getStatusBadge(request.status)}>ÎN AȘTEPTARE</Badge>
                    </div>
                    <p className="text-sm text-gray-500 font-medium flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-brand-blue" /> Trimisă: {request.requestDate.toLocaleString("ro-RO")}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0 w-full sm:w-auto">
                    <Button onClick={() => toast.success("Aprobat!")} className="bg-green-600 hover:bg-green-700 text-white font-bold flex-1 sm:flex-none active:scale-95 shadow-sm">
                      <CheckCircle2 className="h-4 w-4 mr-2" /> Aprobă
                    </Button>
                    <Button variant="outline" onClick={() => toast.error("Respins!")} className="text-brand-red border-red-100 hover:bg-red-50 font-bold flex-1 sm:flex-none active:scale-95 shadow-sm">
                      <XCircle className="h-4 w-4 mr-2" /> Respinge
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="border-gray-200 shadow-sm">
        <CardHeader><CardTitle className="flex items-center gap-2 text-gray-900 font-bold text-xl"><History className="h-5 w-5 text-brand-blue" /> Istoric Cereri</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {processed.length === 0 ? <p className="text-center py-6 text-gray-500 font-medium text-sm italic">Nicio cerere procesată</p> : 
            processed.map((request: any) => (
              <Card key={request.id} className="opacity-85 border-gray-100 shadow-none hover:opacity-100 transition-opacity">
                <CardContent className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-900 text-sm">{request.email}</span>
                      <Badge className={cn(getStatusBadge(request.status), "text-[10px]")}>
                        {request.status === "approved" ? "APROBATĂ" : "RESPINSĂ"}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 font-medium">Procesată la: {request.requestDate.toLocaleDateString("ro-RO")}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}