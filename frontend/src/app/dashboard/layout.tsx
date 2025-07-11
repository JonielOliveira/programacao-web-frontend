"use client";

import Link from "next/link";
import Image from "next/image";
import { ReactNode, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/auth";
import { Users, Link2, Mail, LogOut } from "lucide-react";
import api from "@/lib/api";
import { logError } from "@/lib/logger";
import UserProfileModal from "@/components/modals/UserProfileModal";
import { User } from "@/types/user";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [photoVersion, setPhotoVersion] = useState(0);

  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => setUser(res.data))
      .catch((err) => {
        logError(err, "carregar usuário autenticado");
      });
  }, []);

  const handleUserUpdate = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const handlePhotoUpdate = () => {
    setPhotoVersion((v) => v + 1);
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 text-white p-4 space-y-4">
        <div className="mb-4 flex justify-center" title="Logo do Painel">
          <Link href="/dashboard">
            <Image
              src="/logo1.png"
              alt="Painel"
              width={200}
              height={80}
              priority
            />
          </Link>
        </div>

        {/* Perfil do usuário logado */}
        {user && (
          <div
            className="bg-slate-700 rounded p-4 text-center space-y-2"
            title="Abrir perfil do usuário"
          >
            <UserProfileModal
              user={user}
              photoVersion={photoVersion}
              onUserUpdate={handleUserUpdate}
              onPhotoUpdate={handlePhotoUpdate}
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
          {user?.role === "0" && (
            <Link
              href="/dashboard/users"
              className="flex items-center gap-2 hover:text-slate-300"
              title="Usuários"
            >
              <Users className="w-4 h-4 mr-4" /> Usuários
            </Link>
          )}
          <Link
            href="/dashboard/connections"
            className="flex items-center gap-2 hover:text-slate-300"
            title="Conexões"
          >
            <Link2 className="w-4 h-4 mr-2" /> Conexões
          </Link>
          <Link
            href="/dashboard/invites"
            className="flex items-center gap-2 hover:text-slate-300"
            title="Convites"
          >
            <Mail className="w-4 h-4 mr-2" />
            Convites
          </Link>
        </nav>

        <hr className="my-4 border-slate-600" />

        {/* Botão de logout */}
        <Button
          onClick={logout}
          className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded cursor-pointer"
          size="default"
          variant="ghost"
          title="Sair"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </Button>
      </aside>

      {/* Conteúdo principal */}
      <main className="flex-1 p-6 bg-gray-50">{children}</main>
    </div>
  );
}
