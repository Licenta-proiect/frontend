"use client";

import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import api from "@/services/api";

interface AdminCancelEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservationId: number | null;
  onSuccess: () => void;
}

export function AdminCancelEventDialog({ open, onOpenChange, reservationId, onSuccess }: AdminCancelEventDialogProps) {
  const [cancelReason, setCancelReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!reservationId) return;
    setIsSubmitting(true);
    try {
      await api.post("/reservations/cancel-admin-event", {
        reservationId: reservationId, 
        reason: cancelReason || "Anulat de administrator"
      });

      toast.success("Evenimentul/Rezervarea a fost anulată cu succes.");
      setCancelReason("");
      onOpenChange(false);
      onSuccess();
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      toast.error(error.response?.data?.detail || "Eroare la anularea activității.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-xl border-gray-200 shadow-xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-semibold text-xl text-gray-900">Anulare eveniment</AlertDialogTitle>
          <AlertDialogDescription>
            Sunteți sigur că doriți să anulați această rezervare? Această acțiune este ireversibilă și va elibera intervalul orar.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-2 space-y-2">
          <Label className="text-sm font-semibold text-gray-700 ml-1">
            Motivul anulării
          </Label>
          <textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Introduceți motivul pentru care anulați activitatea..."
            className="w-full p-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-sm transition-all resize-none h-24"
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="ghost" disabled={isSubmitting} className="font-semibold rounded-lg">
              Înapoi
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button 
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="bg-brand-red hover:bg-red-700 text-white font-semibold rounded-lg shadow-md transition-all active:scale-95"
            >
              {isSubmitting ? "Se anulează..." : "Confirmă anularea"}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}