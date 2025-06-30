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

type Mode = "create" | "edit" | "view";

type Props = {
  mode: Mode;
  triggerButton: React.ReactNode;
  initialValues?: Partial<UserForm>;
  onSuccess?: () => void;
};

export default function UserModal({
  mode,
  triggerButton,
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

  const isView = mode === "view";

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
      } else if (mode === "edit" && id) {
        await api.put(`/users/${id}`, { username, fullName, email, role, status });
      }
      setOpen(false);
      onSuccess?.();
    } catch (err) {
      logError(err, `${mode === "create" ? "criação" : "edição"} de usuário`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton}
      </DialogTrigger>
      <DialogContent className="space-y-4">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" && "Criar novo usuário"}
            {mode === "edit" && "Editar usuário"}
            {mode === "view" && "Visualizar usuário"}
          </DialogTitle>
        </DialogHeader>

        <Input
          name="username"
          placeholder="Usuário"
          value={form.username}
          onChange={handleChange}
          required
          disabled={isView}
        />
        <Input
          name="fullName"
          placeholder="Nome completo"
          value={form.fullName}
          onChange={handleChange}
          required
          disabled={isView}
        />
        <Input
          name="email"
          placeholder="E-mail"
          value={form.email}
          onChange={handleChange}
          required
          disabled={isView}
        />

        <Select
          value={form.role}
          onValueChange={(value) => setForm({ ...form, role: value })}
          disabled={isView}
        >
          <SelectTrigger className="w-full cursor-pointer">
            <SelectValue placeholder="Selecione o papel" />
          </SelectTrigger>
          <SelectContent className="w-full">
            <SelectItem className="cursor-pointer" value="0">Administrador</SelectItem>
            <SelectItem className="cursor-pointer" value="1">Usuário Comum</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={form.status}
          onValueChange={(value) => setForm({ ...form, status: value })}
          disabled={isView}
        >
          <SelectTrigger className="w-full cursor-pointer">
            <SelectValue placeholder="Selecione o status" />
          </SelectTrigger>
          <SelectContent className="w-full">
            <SelectItem className="cursor-pointer" value="A">Ativo</SelectItem>
            <SelectItem className="cursor-pointer" value="I">Inativo</SelectItem>
          </SelectContent>
        </Select>

        {!isView && (
          <Button onClick={handleSubmit} className="w-full cursor-pointer">
            {mode === "create" ? "Criar" : "Salvar alterações"}
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
