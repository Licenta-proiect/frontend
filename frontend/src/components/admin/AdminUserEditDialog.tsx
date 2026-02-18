"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AdminUserEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userToEdit: { firstName: string; lastName: string } | null;
  newEmail: string;
  setNewEmail: (email: string) => void;
  emailError: string;
  isUpdating: boolean;
  onConfirm: () => void;
  isSameEmail: boolean;
}

export function AdminUserEditDialog({
  open,
  onOpenChange,
  userToEdit,
  newEmail,
  setNewEmail,
  emailError,
  isUpdating,
  onConfirm,
  isSameEmail
}: AdminUserEditDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[95vw] sm:max-w-md rounded-lg">
            <DialogHeader>
            <DialogTitle className="text-gray-900 font-semibold text-xl">Modificare email utilizator</DialogTitle>
            <DialogDescription>
                Utilizator: {userToEdit?.lastName} {userToEdit?.firstName}
            </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
            <div className="space-y-4">
                <Input
                type="email"
                placeholder="Noua adresă de email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className={cn(
                    "focus-visible:ring-1 border-gray-200 transition-colors",
                    emailError ? "border-brand-red focus-visible:ring-brand-red" : "focus-visible:ring-brand-blue/30"
                )}
                />
                <p className="text-xs text-gray-500 italic">
                * Schimbarea emailului va duce la deconectarea utilizatorului dacă acesta este online.
                </p>
            </div>
            </div>
            <DialogFooter>
            <Button 
                variant="outline"
                className="font-semibold rounded-lg border-gray-200 text-gray-600 hover:bg-gray-100"
                onClick={() => onOpenChange(false)}
            >
                Anulează
            </Button>
            <Button 
                onClick={onConfirm}
                disabled={isUpdating || !newEmail || isSameEmail}
                className="bg-brand-blue hover:bg-brand-blue-dark active:bg-brand-blue-dark active:scale-95 text-white transition-all shadow-md" 
            >
                {isUpdating ? "Se salvează..." : "Salvează"}
            </Button>
            </DialogFooter>
        </DialogContent>
        </Dialog>
);
}