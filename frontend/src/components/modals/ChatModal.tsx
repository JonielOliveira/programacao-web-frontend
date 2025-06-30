"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";
import api from "@/lib/api";
import { logError } from "@/lib/logger";
import { showErrorToast } from "@/lib/showErrorToast";
import ProfilePhoto from "@/components/user/ProfilePhoto";
import MessageItem from "@/components/message/MessageItem";
import { ConnectionUser } from "@/types/connection";

interface ChatModalProps {
  conversationId: string;
  user: ConnectionUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Message {
  id: string;
  content: null | string;
  sentAt: Date;
  isUpdated: boolean;
  isDeleted: boolean;
  isOwnMessage: boolean;
}

export default function ChatModal({
  conversationId,
  user,
  open,
  onOpenChange,
}: ChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await api.get(`/conversations/${conversationId}/messages`);
      setMessages((prev) => {
        const serializedPrev = JSON.stringify(prev);
        const serializedNew = JSON.stringify(res.data);
        return serializedPrev !== serializedNew ? res.data : prev;
      });
    } catch (err) {
      logError(err, "carregar mensagens");
      showErrorToast("Erro ao carregar mensagens.");
    }
  }, [conversationId]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    try {
      const res = await api.post(`/conversations/${conversationId}/messages`, {
        content: newMessage,
      });
      setMessages((prev) => [...prev, res.data]);
      setNewMessage("");
    } catch (err) {
      logError(err, "enviar mensagem");
      showErrorToast("Erro ao enviar mensagem.");
    }
  };

  const handleEditMessage = async (id: string) => {
    const newContent = prompt("Editar mensagem:");
    if (!newContent || !newContent.trim()) return;

    try {
      const res = await api.put(`/conversations/${conversationId}/messages/${id}`, {
        content: newContent.trim(),
      });

      setMessages((prev) =>
        prev.map((msg) => (msg.id === id ? { ...msg, ...res.data } : msg))
      );
    } catch (err) {
      logError(err, "editar mensagem");
      showErrorToast("Erro ao editar mensagem.");
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm("Deseja realmente excluir esta mensagem?")) return;

    try {
      await api.delete(`/conversations/${conversationId}/messages/${id}`);

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === id ? { ...msg, isDeleted: true, content: null } : msg
        )
      );
    } catch (err) {
      logError(err, "excluir mensagem");
      showErrorToast("Erro ao excluir mensagem.");
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const startPolling = async () => {
      await fetchMessages();
      interval = setInterval(() => {
        fetchMessages();
      }, 5000); // a cada 5 segundos
    };

    if (open) {
      setLoading(true);
      startPolling().finally(() => setLoading(false));
    }

    return () => {
      clearInterval(interval);
    };
  }, [open, conversationId, fetchMessages]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-lg h-[70vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <ProfilePhoto userId={user.id} size={48} />
            <div>
              <DialogTitle className="text-base leading-tight">{user.fullName}</DialogTitle>
              <p className="text-sm text-gray-500">@{user.username}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {loading ? (
            <p className="text-center text-gray-500 mt-4">Carregando...</p>
          ) : (
            <ScrollArea className="h-full pr-2">
              <div className="flex flex-col gap-3">
                {messages.map((msg) => (
                  <MessageItem
                    key={msg.id}
                    id={msg.id}
                    content={msg.content}
                    sentAt={new Date(msg.sentAt)}
                    isOwnMessage={msg.isOwnMessage}
                    isDeleted={msg.isDeleted}
                    isUpdated={msg.isUpdated}
                    onEdit={handleEditMessage}
                    onDelete={handleDeleteMessage}
                  />
                ))}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>
          )}
        </div>

        <form
          onSubmit={(e) => e.preventDefault()}
          className="mt-4 flex gap-2"
        >
          <Textarea
            placeholder="Digite sua mensagem..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleSend();
              }
            }}
            rows={2}
            className="max-h-40 overflow-y-auto resize-none"
          />

          <Button type="button" onClick={handleSend}>
            <Send className="w-4 h-4 mr-1" /> Enviar
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
