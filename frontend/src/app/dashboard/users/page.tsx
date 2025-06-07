"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { logError } from "@/lib/logger";
import CreateUserModal from "./CreateUserModal";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const fetchUsers = () => {
    setLoading(true);
    api.get("/users")
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
        <CreateUserModal onUserCreated={fetchUsers} />
      </div>

      {loading && <p>Carregando...</p>}
      {erro && <p className="text-red-500">{erro}</p>}
      {!loading && users.length === 0 && (
        <p className="text-gray-500">Nenhum usuário encontrado.</p>
      )}

      <ul className="space-y-2">
        {users.map((user) => (
          <li key={user.id} className="p-2 bg-white rounded shadow">
            {user.username}
          </li>
        ))}
      </ul>
    </div>
  );
}
