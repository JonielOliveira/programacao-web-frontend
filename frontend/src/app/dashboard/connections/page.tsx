"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useCallback, useEffect, useState } from "react";
import api from "@/lib/api";
import { logError } from "@/lib/logger";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Search, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { showSuccessToast } from "@/lib/showSuccessToast";
import { showErrorToast } from "@/lib/showErrorToast";
import ConfirmDialog from "@/components/modals/ConfirmDialog";
import ProfilePhoto from "@/components/user/ProfilePhoto";
import ChatModal from "@/components/modals/ChatModal";
import { ConnectionUser, Connection } from "@/types/connection";

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [openChatId, setOpenChatId] = useState<string | null>(null);
  const [chatUser, setChatUser] = useState<ConnectionUser | null>(null);
  const limit = 8;

  const fetchConnections = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (search) params.append("search", search);

      const res = await api.get(`/connections?${params.toString()}`);
      setConnections(res.data.data);
      setTotalPages(res.data.totalPages);
      setPage(res.data.page);
    } catch (err) {
      logError(err, "carregar conexões");
      showErrorToast("Erro ao carregar conexões.");
    } finally {
      setLoading(false);
    }
  }, [page, limit, search]);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchConnections();
  };

  const handleRemove = async (id: string) => {
    try {
      await api.delete(`/connections/${id}`);
      showSuccessToast("Conexão removida com sucesso.");
      fetchConnections();
    } catch (err) {
      logError(err, "remover conexão");
      showErrorToast("Erro ao remover conexão.");
    }
  };

  const handleOpenChat = async (connectionId: string, user: ConnectionUser) => {
    try {
      const res = await api.get(`/conversations/connection/${connectionId}`);
      setOpenChatId(res.data.id);
      setChatUser(user);
    } catch (err) {
      logError(err, "abrir chat");
      showErrorToast("Erro ao abrir conversa.");
    }
  };

  return (
    <ProtectedRoute>
      <div>
        <h2 className="text-xl font-bold mb-4">Minhas Conexões</h2>

        <form onSubmit={handleSearch} className="mb-6 flex gap-2">
          <Input
            type="text"
            placeholder="Buscar por nome ou username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-80"
          />
          <Button className="cursor-pointer" type="submit" size="icon" title="Buscar">
            <Search className="w-4 h-4" />
          </Button>
        </form>

        {loading ? (
          <p>Carregando...</p>
        ) : connections.length === 0 ? (
          <p className="text-gray-500">Nenhuma conexão encontrada.</p>
        ) : (
          <ul className="space-y-2 mb-6">
            {connections.map((conn) => (
              <li
                key={conn.id}
                className="p-4 bg-white rounded shadow flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <ProfilePhoto userId={conn.user.id} size={48} />
                  <div>
                    <p className="font-semibold">{conn.user.fullName}</p>
                    <p className="text-sm text-gray-500">@{conn.user.username}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    className="cursor-pointer"
                    size="icon"
                    variant="ghost"
                    title="Abrir conversa"
                    onClick={() => handleOpenChat(conn.id, conn.user)}
                  >
                    <MessageCircle className="w-4 h-4 text-blue-600" />
                  </Button>

                  <ConfirmDialog
                    title="Remover conexão"
                    description={`Deseja remover a conexão com ${conn.user.username}?`}
                    confirmLabel="Confirmar"
                    onConfirm={() => handleRemove(conn.id)}
                    trigger={
                      <Button className="cursor-pointer" size="icon" variant="ghost" title="Remover conexão">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    }
                  />
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="flex justify-center items-center gap-4">
          <Button
            className="cursor-pointer" 
            onClick={() => setPage((p) => Math.max(p - 1, 1))} 
            disabled={page <= 1}
            title="Página anterior"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </Button>
          <span className="text-sm text-gray-700">
            Página {page} de {totalPages}
          </span>
          <Button
            className="cursor-pointer"
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === 0 || page === totalPages}
            title="Próxima página"
          >
            Próxima
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {openChatId && chatUser && (
          <ChatModal
            open={true}
            onOpenChange={(open) => {
              if (!open) {
                setOpenChatId(null);
                setChatUser(null);
              }
            }}
            conversationId={openChatId}
            user={chatUser}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
