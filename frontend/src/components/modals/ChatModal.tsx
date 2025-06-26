"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";
import api from "@/lib/api";
import { logError } from "@/lib/logger";
import { showErrorToast } from "@/lib/showErrorToast";
import ProfilePhoto from "@/components/user/ProfilePhoto";
import MessageItem from "@/components/message/MessageItem";

interface ChatModalProps {
  conversationId: string;
  user: { id: string; username: string; fullName: string };
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

  const fetchMessages = async () => {
    try {
      const res = await api.get(`/conversations/${conversationId}/messages`);
      setMessages(res.data);
    } catch (err) {
      logError(err, "carregar mensagens");
      showErrorToast("Erro ao carregar mensagens.");
    }
  };

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
        prev.map((msg) => (msg.id === id ? { ...msg, isDeleted: true, content: null } : msg))
        );
    } catch (err) {
        logError(err, "excluir mensagem");
        showErrorToast("Erro ao excluir mensagem.");
    }
    };













  useEffect(() => {
    if (open) {
      setLoading(true);
      fetchMessages().finally(() => setLoading(false));
    }
  }, [open]);

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
                    onEdit={(id) => handleEditMessage(id)}
                    onDelete={(id) => handleDeleteMessage(id)}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="mt-4 flex gap-2"
        >
          <Input
            placeholder="Digite sua mensagem..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <Button type="submit">
            <Send className="w-4 h-4 mr-1" /> Enviar
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
