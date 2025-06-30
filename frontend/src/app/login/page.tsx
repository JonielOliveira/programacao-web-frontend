"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { logError } from "@/lib/logger";
import api from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryMessage, setRecoveryMessage] = useState("");
  const [recoveryError, setRecoveryError] = useState("");
  const [senhaVisivel, setSenhaVisivel] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace("/dashboard");
    }
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    try {
      const response = await api.post("/auth/login", {
        email,
        password: senha,
      });

      localStorage.setItem("token", response.data.token);
      router.push("/dashboard");
    } catch (err) {
      logError(err, "Login");
      setErro("E-mail ou senha incorretos.");
    }
  }

  async function handleRecoverySubmit(e: React.FormEvent) {
    e.preventDefault();
    setRecoveryMessage("");
    setRecoveryError("");

    try {
      await api.post("/auth/request-password-reset", {
        email: recoveryEmail,
      });
      setRecoveryMessage("Verifique seu e-mail para obter a senha temporária.");
    } catch (err) {
      logError(err, "Solicitar senha temporária");
      setRecoveryError("Erro ao solicitar senha. Verifique o e-mail informado.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md space-y-6">
        <div className="flex justify-center">
          <Image
            src="/logo3.png"
            alt="Logo do Join & Chat"
            width={200}
            height={80}
            priority
          />
        </div>
        <h1 className="text-2xl font-bold text-center">Acessar Conta</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">E-mail</label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Senha</label>
            <div className="relative">
              <Input
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                type={senhaVisivel ? "text" : "password"}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setSenhaVisivel(!senhaVisivel)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 cursor-pointer"
                tabIndex={-1}
              >
                {senhaVisivel ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          {erro && <p className="text-red-500 text-sm">{erro}</p>}
          <Button className="w-full cursor-pointer" type="submit">Entrar</Button>
        </form>

        <Dialog>
          <DialogTrigger asChild>
            <button className="text-sm text-blue-600 hover:underline block w-full text-center mt-2 cursor-pointer">
              Primeiro acesso ou esqueceu a senha?
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogTitle className="text-lg font-semibold mb-2 text-center">
              Recuperar Acesso
            </DialogTitle>
            <form onSubmit={handleRecoverySubmit} className="space-y-4">
              <Input
                placeholder="Digite seu e-mail"
                type="email"
                value={recoveryEmail}
                onChange={(e) => setRecoveryEmail(e.target.value)}
              />
              {recoveryMessage && <p className="text-green-600 text-sm">{recoveryMessage}</p>}
              {recoveryError && <p className="text-red-500 text-sm">{recoveryError}</p>}
              <Button className="w-full cursor-pointer" type="submit">Enviar senha temporária</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
