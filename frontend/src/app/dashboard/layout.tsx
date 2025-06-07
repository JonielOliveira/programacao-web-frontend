import Link from "next/link";
import { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 text-white p-4 space-y-4">
        <h2 className="text-xl font-bold mb-4">Painel</h2>
        <nav className="space-y-2">
          <Link href="/dashboard/users" className="block hover:text-slate-300">
            Usuários
          </Link>
          <Link href="/dashboard/messages" className="block hover:text-slate-300">
            Mensagens
          </Link>
        </nav>
      </aside>

      {/* Conteúdo principal */}
      <main className="flex-1 p-6 bg-gray-50">{children}</main>
    </div>
  );
}
