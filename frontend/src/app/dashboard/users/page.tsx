"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { logError } from "@/lib/logger";
import UserModal from "./UserModal";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/modals/ConfirmDialog";
import { showSuccessToast } from "@/lib/showSuccessToast";
import { showErrorToast } from "@/lib/showErrorToast";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const fetchUsers = () => {
    setLoading(true);
    api
      .get("/users")
      .then((res) => setUsers(res.data))
      .catch((err) => {
        logError(err, "carregar usuários");
        setErro("Erro ao carregar usuários.");
      })
      .finally(() => setLoading(false));
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
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Usuários</h2>
        <UserModal mode="create" triggerLabel="Novo Usuário" onSuccess={fetchUsers} />
      </div>

      {loading && <p>Carregando...</p>}
      {erro && <p className="text-red-500">{erro}</p>}
      {!loading && users.length === 0 && (
        <p className="text-gray-500">Nenhum usuário encontrado.</p>
      )}

      <ul className="space-y-2">
        {users.map((user) => (
          <li
            key={user.id}
            className="p-4 bg-white rounded shadow flex items-center justify-between"
          >
            <div>
              <p className="font-semibold">{user.username}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>

            <div className="flex items-center gap-2">
              {/* Visualizar */}
              <UserModal
                mode="view"
                triggerLabel={
                  <Button size="icon" variant="ghost">
                    <Eye className="w-4 h-4 text-blue-600" />
                  </Button>
                }
                initialValues={user}
              />

              {/* Editar */}
              <UserModal
                mode="edit"
                triggerLabel={
                  <Button size="icon" variant="ghost">
                    <Pencil className="w-4 h-4" />
                  </Button>
                }
                initialValues={user}
                onSuccess={fetchUsers}
              />

              {/* Excluir */}
              <ConfirmDialog
                title="Excluir usuário"
                description={`Tem certeza que deseja excluir ${user.username}?`}
                onConfirm={() => handleDelete(user.id)}
                trigger={
                  <Button size="icon" variant="ghost">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                }
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
