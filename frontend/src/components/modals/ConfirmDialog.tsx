"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

type Props = {
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onClose?: () => void;
  open?: boolean;
  trigger?: React.ReactNode;
};

export default function ConfirmDialog({
  title = "Tem certeza?",
  description = "Essa ação não pode ser desfeita.",
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  onConfirm,
  onClose,
  open: controlledOpen,
  trigger,
}: Props) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const handleCancel = () => {
    if (!isControlled) setInternalOpen(false);
    onClose?.();
  };

  const handleConfirm = () => {
    onConfirm();
    handleCancel();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (isControlled) {
          if (!v) onClose?.();
        } else {
          setInternalOpen(v);
        }
      }}
    >
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <p>{description}</p>
        <DialogFooter className="mt-4">
          <Button className="cursor-pointer" variant="ghost" onClick={handleCancel}>
            {cancelLabel}
          </Button>
          <Button className="cursor-pointer" variant="destructive" onClick={handleConfirm}>
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
