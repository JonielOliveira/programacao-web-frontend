"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function DashboardHome() {
  return (
    <ProtectedRoute>
      <div>
        <h1 className="text-2xl font-bold">Bem-vindo ao Join & Chat!</h1>
        <p className="text-gray-600 mt-2">Escolha uma opção no menu à esquerda.</p>
      </div>
    </ProtectedRoute>
  );
}
