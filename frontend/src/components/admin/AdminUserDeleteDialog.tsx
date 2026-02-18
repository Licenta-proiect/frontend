"use client";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface AdminUserDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function AdminUserDeleteDialog({ open, onOpenChange, onConfirm }: AdminUserDeleteDialogProps) {
  return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent className="rounded-xl border-gray-200 shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-semibold text-xl text-gray-900">Confirmare ștergere</AlertDialogTitle>
            <AlertDialogDescription>
              Sunteți sigur că doriți să ștergeți acest utilizator? Această acțiune nu poate fi anulată.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button 
                variant="ghost" 
                className="font-semibold rounded-lg border-gray-200 text-gray-600 hover:bg-gray-100"
              >
                Anulează
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button 
                onClick={onConfirm} 
                className="bg-brand-red hover:bg-red-700 text-white font-semibold rounded-lg shadow-md transition-all active:scale-95"
              >
                Șterge utilizator
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
  );
}