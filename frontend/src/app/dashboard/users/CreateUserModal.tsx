"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/lib/api";
import { logError } from "@/lib/logger";

type Props = {
  onUserCreated: () => void;
};

export default function CreateUserModal({ onUserCreated }: Props) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    username: "",
    fullName: "",
    email: "",
    role: "1", // 0: Admin, 1: User
    status: "A",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      await api.post("/users", form);
      setOpen(false);
      setForm({ username: "", fullName: "", email: "", role: "1", status: "A" });
      onUserCreated(); // recarrega a lista
    } catch (err) {
      logError(err, "criação de usuário");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Novo Usuário</Button>
      </DialogTrigger>
      <DialogContent className="space-y-4">
        <DialogHeader>
          <DialogTitle>Criar novo usuário</DialogTitle>
        </DialogHeader>

        <Input
          name="username"
          placeholder="Usuário"
          value={form.username}
          onChange={handleChange}
          required
        />
        <Input
          name="fullName"
          placeholder="Nome completo"
          value={form.fullName}
          onChange={handleChange}
          required
        />
        <Input
          name="email"
          placeholder="E-mail"
          value={form.email}
          onChange={handleChange}
          required
        />

        <Select
          value={form.role}
          onValueChange={(value) => setForm({ ...form, role: value })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione o papel" />
          </SelectTrigger>
          <SelectContent className="w-full">
            <SelectItem value="0">Administrador</SelectItem>
            <SelectItem value="1">Usuário Comum</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={form.status}
          onValueChange={(value) => setForm({ ...form, status: value })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione o status" />
          </SelectTrigger>
          <SelectContent className="w-full">
            <SelectItem value="A">Ativo</SelectItem>
            <SelectItem value="I">Inativo</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={handleSubmit} className="w-full">
          Salvar
        </Button>
      </DialogContent>
    </Dialog>
  );
}
