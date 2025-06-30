"use client";

import { useCallback, useEffect, useState } from "react";
import api from "@/lib/api";
import { logError } from "@/lib/logger";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MailPlus, Check, X, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { showSuccessToast } from "@/lib/showSuccessToast";
import { showErrorToast } from "@/lib/showErrorToast";
import ConfirmDialog from "@/components/modals/ConfirmDialog";
import ProfilePhoto from "@/components/user/ProfilePhoto";
import { InviteUser, SentInvite, ReceivedInvite } from "@/types/invite";

function getInviteUser(invite: SentInvite | ReceivedInvite, tab: string): InviteUser {
  return tab === "received"
    ? (invite as ReceivedInvite).sender
    : (invite as SentInvite).receiver;
}

export default function InvitesPage() {
  const [tab, setTab] = useState("received");

  const [sentInvites, setSentInvites] = useState<SentInvite[]>([]);
  const [receivedInvites, setReceivedInvites] = useState<ReceivedInvite[]>([]);
  const [loading, setLoading] = useState(false);

  const [username, setUsername] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 8;

  const fetchInvites = useCallback(async () => {
    setLoading(true);
    try {
      const route = tab === "received" ? "/invites/received" : "/invites/sent";
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const res = await api.get(`${route}?${params.toString()}`);
      if (tab === "received") {
        setReceivedInvites(res.data.data);
      } else {
        setSentInvites(res.data.data);
      }
      setTotalPages(res.data.totalPages);
      setPage(res.data.page);
    } catch (err) {
      logError(err, "carregar convites");
      showErrorToast("Erro ao carregar convites.");
    } finally {
      setLoading(false);
    }
  }, [tab, page, limit]);

  useEffect(() => {
    fetchInvites();
  }, [fetchInvites]);

  const handleSendInvite = async () => {
    try {
      await api.post("/invites", { receiverUsername: username });
      setUsername("");
      fetchInvites();
      showSuccessToast("Convite enviado com sucesso.");
    } catch (err) {
      logError(err, "enviar convite");
      showErrorToast("Erro ao enviar convite.");
    }
  };

  const handleAction = async (id: string, action: "accept" | "reject" | "cancel") => {
    const successMessages: Record<typeof action, string> = {
      accept: "Convite aceito com sucesso.",
      reject: "Convite rejeitado com sucesso.",
      cancel: "Convite excluído com sucesso.",
    };

    const errorMessages: Record<typeof action, string> = {
      accept: "Erro ao aceitar convite.",
      reject: "Erro ao rejeitar convite.",
      cancel: "Erro ao excluir convite.",
    };

    try {
      const method = action === "cancel" ? "delete" : "post";
      const url = action === "cancel" ? `/invites/${id}/cancel` : `/invites/${id}/${action}`;
      await api[method](url);
      fetchInvites();
      showSuccessToast(successMessages[action]);
    } catch (err) {
      logError(err, `convite ${action}`);
      showErrorToast(errorMessages[action]);
    }
  };

  const invites = tab === "received" ? receivedInvites : sentInvites;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Gerenciar Convites</h2>

      {/* Enviar convite */}
      <div className="flex items-center gap-2 mb-6">
        <Input
          type="text"
          placeholder="Nome de usuário para convidar..."
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-80"
        />
        <Button className="cursor-pointer" onClick={handleSendInvite} title="Enviar convite" disabled={!username.trim()}> 
          <MailPlus className="w-4 h-4 mr-2" />
          Enviar
        </Button>
      </div>

      {/* Abas */}
      <Tabs value={tab} onValueChange={setTab} className="w-full mb-6">
        <TabsList className="mb-4">
          <TabsTrigger className="cursor-pointer" value="received" title="Convites recebidos">Recebidos</TabsTrigger>
          <TabsTrigger className="cursor-pointer" value="sent" title="Convites enviados">Enviados</TabsTrigger>
        </TabsList>

        <TabsContent value={tab}>
          {loading ? (
            <p>Carregando...</p>
          ) : invites.length === 0 ? (
            <p className="text-gray-500">Nenhum convite {tab === "received" ? "recebido" : "enviado"}.</p>
          ) : (
            <ul className="space-y-2 mb-6">
              {invites.map((invite) => {
                const user = getInviteUser(invite, tab);
                return (
                  <li
                    key={invite.id}
                    className="p-4 bg-white rounded shadow flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <ProfilePhoto userId={user?.id} size={48} />
                      <div>
                        <p className="font-semibold">{user?.fullName}</p>
                        <p className="text-sm text-gray-500">@{user?.username}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {tab === "received" ? (
                        <>
                          <Button
                            className="cursor-pointer"
                            size="icon"
                            variant="ghost"
                            title="Aceitar"
                            onClick={() => handleAction(invite.id, "accept")}
                          >
                            <Check className="w-4 h-4 text-green-600" />
                          </Button>
                          <ConfirmDialog
                            title="Rejeitar convite"
                            description={`Deseja realmente rejeitar o convite de ${user?.username}?`}
                            confirmLabel="Confirmar"
                            onConfirm={() => handleAction(invite.id, "reject")}
                            trigger={
                              <Button className="cursor-pointer" size="icon" variant="ghost" title="Rejeitar">
                                <X className="w-4 h-4 text-red-600" />
                              </Button>
                            }
                          />
                        </>
                      ) : (
                        <ConfirmDialog
                          title="Excluir convite"
                          description={`Deseja excluir o convite enviado para ${user?.username}?`}
                          confirmLabel="Confirmar"
                          onConfirm={() => handleAction(invite.id, "cancel")}
                          trigger={
                            <Button className="cursor-pointer" size="icon" variant="ghost" title="Excluir">
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          }
                        />
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Paginação */}
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
