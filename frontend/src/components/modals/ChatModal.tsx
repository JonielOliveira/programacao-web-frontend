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
import { handleAxiosError } from "@/lib/handleAxiosError";
import ProfilePhoto from "@/components/user/ProfilePhoto";
import MessageItem from "@/components/message/MessageItem";
import EditMessageModal from "@/components/message/EditMessageModal";
import ConfirmDialog from "@/components/modals/ConfirmDialog";
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

  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<string>("");
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);

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
      handleAxiosError(err, "Erro ao carregar mensagens.");
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
      handleAxiosError(err, "Erro ao enviar mensagem.");
    }
  };

  const handleEditMessage = (id: string) => {
    const message = messages.find((msg) => msg.id === id);
    if (message && message.content) {
      setEditingMessageId(id);
      setEditingContent(message.content);
    }
  };

  const confirmEditMessage = async (newContent: string) => {
    if (!editingMessageId) return;

    try {
      const res = await api.put(`/conversations/${conversationId}/messages/${editingMessageId}`, {
        content: newContent,
      });

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === editingMessageId ? { ...msg, ...res.data } : msg
        )
      );
    } catch (err) {
      logError(err, "editar mensagem");
      handleAxiosError(err, "Erro ao editar mensagem.");
    } finally {
      setEditingMessageId(null);
    }
  };

  const handleDeleteMessage = (id: string) => {
    setDeletingMessageId(id);
  };

  const confirmDeleteMessage = async () => {
    if (!deletingMessageId) return;

    try {
      await api.delete(`/conversations/${conversationId}/messages/${deletingMessageId}`);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === deletingMessageId ? { ...msg, isDeleted: true, content: null } : msg
        )
      );
    } catch (err) {
      logError(err, "excluir mensagem");
      handleAxiosError(err, "Erro ao excluir mensagem.");
    } finally {
      setDeletingMessageId(null);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const startPolling = async () => {
      await fetchMessages();
      interval = setInterval(() => {
        fetchMessages();
      }, 5000);
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
    <>
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

          <form onSubmit={(e) => e.preventDefault()} className="mt-4 flex gap-2">
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

            <Button className="cursor-pointer" type="button" onClick={handleSend}>
              <Send className="w-4 h-4 mr-1" /> Enviar
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de edição de mensagem */}
      {editingMessageId && (
        <EditMessageModal
          open={!!editingMessageId}
          originalContent={editingContent}
          onClose={() => setEditingMessageId(null)}
          onConfirm={confirmEditMessage}
        />
      )}

      {/* Modal de confirmação de exclusão */}
      {deletingMessageId && (
        <ConfirmDialog
          open={!!deletingMessageId}
          title="Excluir mensagem"
          description="Deseja realmente excluir esta mensagem?"
          onClose={() => setDeletingMessageId(null)}
          onConfirm={confirmDeleteMessage}
        />
      )}
    </>
  );
}
