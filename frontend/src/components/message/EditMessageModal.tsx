"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface EditMessageModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (newContent: string) => void;
  originalContent: string;
}

export default function EditMessageModal({
  open,
  onClose,
  onConfirm,
  originalContent,
}: EditMessageModalProps) {
  const [content, setContent] = useState(originalContent);

  useEffect(() => {
    setContent(originalContent);
  }, [originalContent]);

  const trimmedContent = content.trim();
  const trimmedOriginal = originalContent.trim();
  const isUnchanged = trimmedContent === trimmedOriginal;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Mensagem</DialogTitle>
        </DialogHeader>
        <Textarea
          placeholder="Edite sua mensagem..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={2}
          className="max-h-40 overflow-y-auto resize-none"
        />
        <div className="flex justify-end gap-2 mt-4">
          <Button className="cursor-pointer" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            className="cursor-pointer"
            onClick={() => {
              onConfirm(trimmedContent);
              onClose();
            }}
            disabled={!trimmedContent || isUnchanged}
          >
            Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
