"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    api.get("/users")
      .then((res) => setUsers(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Usuários</h2>
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
