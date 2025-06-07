"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";

export default function DashboardHome() {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
    }
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold">Bem-vindo ao Painel!</h1>
      <p className="text-gray-600 mt-2">Escolha uma opção no menu à esquerda.</p>
    </div>
  );
}
