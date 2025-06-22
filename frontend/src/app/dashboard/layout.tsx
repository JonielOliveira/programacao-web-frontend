"use client";

import Link from "next/link";
import Image from "next/image";
import { ReactNode, useEffect, useState } from "react";
import { logout } from "@/lib/auth";
import api from "@/lib/api";
import { logError } from "@/lib/logger";
import UserProfileModal from "@/components/modals/UserProfileModal";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => setUser(res.data))
      .catch((err) => {
        logError(err, "carregar usuário autenticado");
      });
  }, []);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 text-white p-4 space-y-4">
        <h2 className="text-xl font-bold mb-4">Painel</h2>

        {/* Perfil do usuário logado */}
        {user && (
          <div className="bg-slate-700 rounded p-4 text-center space-y-2">
            <UserProfileModal
              user={user}
            />
            <div className="text-sm mt-2">
              <p className="font-semibold">{user.fullName}</p>
              <p className="text-gray-300 text-xs">{user.email}</p>
              <p className="text-gray-400 text-xs mt-1 italic">
                ({user.role === "0" ? "Admin" : "Usuário"})
              </p>
              <p className="text-gray-400 text-xs">
                Acessos: {user.accessCount}
              </p>
            </div>
          </div>
        )}

        {/* Navegação */}
        <nav className="space-y-2 mt-4">
          <Link href="/dashboard/users" className="block hover:text-slate-300">
            Usuários
          </Link>
          <Link href="/dashboard/messages" className="block hover:text-slate-300">
            Mensagens
          </Link>
          <Link href="/dashboard/invites" className="block hover:text-slate-300">
            Convites
          </Link>
        </nav>

        <hr className="my-4 border-slate-600" />

        {/* Botão de logout */}
        <button
          onClick={logout}
          className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded"
        >
          Sair
        </button>
      </aside>

      {/* Conteúdo principal */}
      <main className="flex-1 p-6 bg-gray-50">{children}</main>
    </div>
  );
}
