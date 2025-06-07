"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    try {
      const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: senha }),
      });

      if (!response.ok) throw new Error("Credenciais inválidas");

      const data = await response.json();
      localStorage.setItem("token", data.token);
      router.push("/dashboard");
    } catch (err) {
      setErro("E-mail ou senha incorretos.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md space-y-6">
        <h1 className="text-2xl font-bold text-center">Entrar no Sistema</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">E-mail</label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Senha</label>
            <Input value={senha} onChange={(e) => setSenha(e.target.value)} type="password" />
          </div>
          {erro && <p className="text-red-500 text-sm">{erro}</p>}
          <Button className="w-full" type="submit">Entrar</Button>
        </form>
      </div>
    </div>
  );
}
