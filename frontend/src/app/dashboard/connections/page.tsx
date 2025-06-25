"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { logError } from "@/lib/logger";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Search } from "lucide-react";
import { showSuccessToast } from "@/lib/showSuccessToast";
import { showErrorToast } from "@/lib/showErrorToast";
import ConfirmDialog from "@/components/modals/ConfirmDialog";
import ProfilePhoto from "@/components/user/ProfilePhoto";

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 8;

  const fetchConnections = async () => {
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
  };

  useEffect(() => {
    fetchConnections();
  }, [page]);

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

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Minhas Conexões</h2>

      {/* Barra de busca */}
      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <Input
          type="text"
          placeholder="Buscar por nome ou username..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-80"
        />
        <Button type="submit" size="icon" title="Buscar">
          <Search className="w-4 h-4" />
        </Button>
      </form>

      {/* Lista de conexões */}
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
                  <p className="font-semibold">{conn.user.username}</p>
                  <p className="text-sm text-gray-500">{conn.user.fullName}</p>
                </div>
              </div>

              <ConfirmDialog
                title="Remover conexão"
                description={`Deseja remover a conexão com ${conn.user.username}?`}
                confirmLabel="Confirmar"
                onConfirm={() => handleRemove(conn.id)}
                trigger={
                  <Button size="icon" variant="ghost" title="Remover conexão">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                }
              />
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
    </div>
  );
}
