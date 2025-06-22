"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { logError } from "@/lib/logger";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { UserPlus, Check, X, Trash2 } from "lucide-react";
import { showSuccessToast } from "@/lib/showSuccessToast";
import { showErrorToast } from "@/lib/showErrorToast";

export default function InvitesPage() {
  const [tab, setTab] = useState("received");

  const [sentInvites, setSentInvites] = useState<any[]>([]);
  const [receivedInvites, setReceivedInvites] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [username, setUsername] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 8;

  const fetchInvites = async () => {
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
  };

  useEffect(() => {
    fetchInvites();
  }, [tab, page]);

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
    try {
      const method = action === "cancel" ? "delete" : "post";
      const url = action === "cancel" ? `/invites/${id}/cancel` : `/invites/${id}/${action}`;
      await api[method](url);
      fetchInvites();
      showSuccessToast(`Convite ${action === "cancel" ? "cancelado" : action + "ado"} com sucesso.`);
    } catch (err) {
      logError(err, `convite ${action}`);
      showErrorToast(`Erro ao ${action === "cancel" ? "cancelar" : action + "ar"} convite.`);
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
        <Button onClick={handleSendInvite}>
          <UserPlus className="w-4 h-4 mr-2" />
          Enviar
        </Button>
      </div>

      {/* Abas */}
      <Tabs value={tab} onValueChange={setTab} className="w-full mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="received">Recebidos</TabsTrigger>
          <TabsTrigger value="sent">Enviados</TabsTrigger>
        </TabsList>

        <TabsContent value={tab}>
          {loading ? (
            <p>Carregando...</p>
          ) : invites.length === 0 ? (
            <p className="text-gray-500">Nenhum convite {tab === "received" ? "recebido" : "enviado"}.</p>
          ) : (
            <ul className="space-y-2 mb-6">
              {invites.map((invite) => (
                <li
                  key={invite.id}
                  className="p-4 bg-white rounded shadow flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold">
                      {tab === "received"
                        ? invite.sender?.username
                        : invite.receiver?.username}
                    </p>
                    <p className="text-sm text-gray-500">
                      {tab === "received"
                        ? invite.sender?.email
                        : invite.receiver?.email}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {tab === "received" ? (
                      <>
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Aceitar"
                          onClick={() => handleAction(invite.id, "accept")}
                        >
                          <Check className="w-4 h-4 text-green-600" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Rejeitar"
                          onClick={() => handleAction(invite.id, "reject")}
                        >
                          <X className="w-4 h-4 text-red-600" />
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="icon"
                        variant="ghost"
                        title="Cancelar"
                        onClick={() => handleAction(invite.id, "cancel")}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Paginação */}
          <div className="flex justify-center items-center gap-4">
            <Button onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page <= 1}>
              Anterior
            </Button>
            <span className="text-sm text-gray-700">
              Página {page} de {totalPages}
            </span>
            <Button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === 0 || page === totalPages}
            >
              Próxima
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
