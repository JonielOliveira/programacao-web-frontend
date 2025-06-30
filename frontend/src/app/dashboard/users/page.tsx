"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { logError } from "@/lib/logger";
import UserModal from "@/components/modals/UserModal";
import { Eye, Pencil, Trash2, Search, UserPlus, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ConfirmDialog from "@/components/modals/ConfirmDialog";
import { showSuccessToast } from "@/lib/showSuccessToast";
import { showErrorToast } from "@/lib/showErrorToast";
import ProfilePhoto from "@/components/user/ProfilePhoto";
import { User } from "@/types/user";

function getStatusInfo(status: string | undefined) {
  switch (status) {
    case "A":
      return { text: "Ativo", color: "text-green-600" };
    case "I":
      return { text: "Inativo", color: "text-gray-500" };
    case "B":
      return { text: "Bloqueado", color: "text-red-600" };
    default:
      return { text: "Desconhecido", color: "text-gray-500" };
  }
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const limit = 5;

  const fetchUsers = useCallback(() => {
    setLoading(true);

    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      orderBy: "username",
      sort: "asc",
    });

    if (search) params.append("search", search);
    if (role !== "all") params.append("role", role);
    if (status !== "all") params.append("status", status);

    api
      .get(`/users?${params.toString()}`)
      .then((res) => {
        setUsers(res.data.data);
        setTotalPages(res.data.totalPages);
        setPage(res.data.page);
        setTotal(res.data.total);
      })
      .catch((err) => {
        logError(err, "carregar usuários");
        setErro("Erro ao carregar usuários.");
      })
      .finally(() => setLoading(false));
  }, [page, limit, search, role, status]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleDelete = async (userId: string) => {
    try {
      await api.delete(`/users/${userId}`);
      showSuccessToast("Usuário excluído com sucesso.");
      fetchUsers();
    } catch (err) {
      logError(err, "excluir usuário");
      showErrorToast("Erro ao excluir usuário.");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <ProtectedRoute>
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Usuários</h2>
          <UserModal 
            mode="create" 
            triggerButton={
              <Button className="cursor-pointer" size="icon" variant="default" title="Novo usuário">
                <UserPlus className="w-4 h-4" />
              </Button>
            } 
            onSuccess={fetchUsers} 
          />
        </div>

        {/* Barra de filtros */}
        <form onSubmit={handleSearch} className="mb-6 flex flex-wrap gap-2">
          <Input
            type="text"
            placeholder="Buscar por nome ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-60"
          />
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="w-52 cursor-pointer">
              <SelectValue placeholder="Filtrar por papel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem className="cursor-pointer" value="all">Todos</SelectItem>
              <SelectItem className="cursor-pointer" value="0">Administrador</SelectItem>
              <SelectItem className="cursor-pointer" value="1">Usuário Comum</SelectItem>
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-52 cursor-pointer">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem className="cursor-pointer" value="all">Todos</SelectItem>
              <SelectItem className="cursor-pointer" value="A">Ativo</SelectItem>
              <SelectItem className="cursor-pointer" value="I">Inativo</SelectItem>
              <SelectItem className="cursor-pointer" value="B">Bloqueado</SelectItem>
            </SelectContent>
          </Select>
          <Button className="cursor-pointer" type="submit" size="icon" title="Buscar">
            <Search className="w-4 h-4" />
          </Button>
        </form>

        {/* Total de registros */}
        {!loading && total > 0 && (
          <p className="text-sm text-gray-700 mb-2">
            {total} usuário{total !== 1 && "s"} encontrado{total !== 1 && "s"}.
          </p>
        )}

        {/* Lista */}
        {loading && <p>Carregando...</p>}
        {erro && <p className="text-red-500">{erro}</p>}
        {!loading && users.length === 0 && (
          <p className="text-gray-500">Nenhum usuário encontrado.</p>
        )}

        <ul className="space-y-2 mb-6">
          {users.map((user) => (
            <li
              key={user.id}
              className="p-4 bg-white rounded shadow flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <ProfilePhoto userId={user?.id} size={72} />
                <div>
                  <p className="font-semibold">{user?.fullName}</p>
                  <p className="text-sm text-gray-700">{user?.email}</p>
                  <p className="text-sm font-semibold">
                    @
                    <span className="text-sm text-gray-500">
                      {user?.username}
                    </span>
                  </p>
                  <p className="text-sm font-semibold">
                    Acessos:{" "}
                    <span className="text-sm text-gray-500">
                      {user?.accessCount}
                    </span>
                  </p>                
                  {user?.status && (
                    <p className="text-sm font-semibold">
                      Status:{" "}
                      <span className={`font-medium ${getStatusInfo(user.status).color}`}>
                        {getStatusInfo(user.status).text}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <UserModal
                  mode="view"
                  triggerButton={
                    <Button className="cursor-pointer" size="icon" variant="ghost" title="Visualizar">
                      <Eye className="w-4 h-4 text-blue-600" />
                    </Button>
                  }
                  initialValues={user}
                />
                <UserModal
                  mode="edit"
                  triggerButton={
                    <Button className="cursor-pointer" size="icon" variant="ghost" title="Editar">
                      <Pencil className="w-4 h-4" />
                    </Button>
                  }
                  initialValues={user}
                  onSuccess={fetchUsers}
                />
                <ConfirmDialog
                  title="Excluir usuário"
                  description={`Tem certeza que deseja excluir ${user.username}?`}
                  onConfirm={() => handleDelete(user.id)}
                  trigger={
                    <Button className="cursor-pointer" size="icon" variant="ghost" title="Excluir">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  }
                />
              </div>
            </li>
          ))}
        </ul>

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
      </div>
    </ProtectedRoute>
  );
}
