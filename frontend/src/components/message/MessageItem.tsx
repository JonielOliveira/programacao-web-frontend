"use client";

import { format } from "date-fns";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from "@/components/ui/context-menu";

interface MessageItemProps {
  id: string;
  content: string | null;
  sentAt: Date;
  isOwnMessage: boolean;
  isDeleted: boolean;
  isUpdated: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function MessageItem({
  id,
  content,
  sentAt,
  isOwnMessage,
  isDeleted,
  isUpdated,
  onEdit,
  onDelete,
}: MessageItemProps) {
  const baseClasses = "p-2 rounded text-sm max-w-[80%] break-words whitespace-pre-wrap";
  let bubbleClasses = "";
  if (isOwnMessage) {
    if (isDeleted) {
        bubbleClasses = "bg-blue-100 text-blue-700 italic";
    } else if (isUpdated) {
        bubbleClasses = "bg-blue-400 text-white";
    } else {
        bubbleClasses = "bg-blue-500 text-white";
    }
    } else {
    if (isDeleted) {
        bubbleClasses = "bg-green-100 text-green-700 italic";
    } else if (isUpdated) {
        bubbleClasses = "bg-green-400 text-white";
    } else {
        bubbleClasses = "bg-green-500 text-white";
    }
  }  
  return (
    <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div className={`${baseClasses} ${bubbleClasses}`}>
            <p>{isDeleted ? "..." : content}</p>
            <span className="block text-xs mt-1 text-right opacity-70">
              {format(new Date(sentAt), "dd/MM/yyyy HH:mm")}
              {isUpdated && !isDeleted && (
                <span className="ml-1 italic">(editada)</span>
              )}
              {isDeleted && (
                <span className="ml-1 italic">(deletada)</span>
              )}
            </span>
          </div>
        </ContextMenuTrigger>

        {!isDeleted && isOwnMessage && (
          <ContextMenuContent className="w-36">
            {onEdit && (
              <ContextMenuItem className="cursor-pointer" onClick={() => onEdit(id)}>
                Editar
              </ContextMenuItem>
            )}
            {onDelete && (
              <ContextMenuItem className="cursor-pointer" onClick={() => onDelete(id)}>
                Excluir
              </ContextMenuItem>
            )}
          </ContextMenuContent>
        )}
      </ContextMenu>
    </div>
  );
}
