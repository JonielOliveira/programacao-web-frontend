"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { logError } from "@/lib/logger";
import UserModal from "./UserModal";
import { Pencil } from "lucide-react"; // ícone de edição (via lucide)
import { Button } from "@/components/ui/button";

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
          </li>
        ))}
      </ul>
    </div>
  );
}
