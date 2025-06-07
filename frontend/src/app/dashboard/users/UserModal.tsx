
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

type UserForm = {
  id?: string;
  username: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
};

type Props = {
  mode: "create" | "edit";
  triggerLabel: string;
  initialValues?: Partial<UserForm>;
  onSuccess: () => void;
};

export default function UserModal({
  mode,
  triggerLabel,
  initialValues,
  onSuccess,
}: Props) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<UserForm>({
    username: "",
    fullName: "",
    email: "",
    role: "1",
    status: "A",
  });

  useEffect(() => {
    if (initialValues) {
      setForm({
        username: initialValues.username || "",
        fullName: initialValues.fullName || "",
        email: initialValues.email || "",
        role: initialValues.role || "1",
        status: initialValues.status || "A",
        id: initialValues.id,
      });
    }
  }, [initialValues]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const { username, fullName, email, role, status, id } = form;

    if (!username.trim() || !fullName.trim() || !email.trim() || !role || !status) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    try {
      if (mode === "create") {
        await api.post("/users", { username, fullName, email, role, status });
      } else {
        await api.put(`/users/${id}`, { username, fullName, email, role, status });
      }
      setOpen(false);
      onSuccess();
    } catch (err) {
      logError(err, `${mode === "create" ? "criação" : "edição"} de usuário`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={mode === "edit" ? "outline" : "default"}>
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="space-y-4">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Criar novo usuário" : "Editar usuário"}
          </DialogTitle>
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
          {mode === "create" ? "Criar" : "Salvar alterações"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
