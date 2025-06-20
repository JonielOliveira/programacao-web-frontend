"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { logError } from "@/lib/logger";
import api from "@/lib/api";
import { showSuccessToast } from "@/lib/showSuccessToast";
import { showErrorToast } from "@/lib/showErrorToast";
import ProfilePhoto from "@/components/user/ProfilePhoto";
import { validatePasswordChange } from "@/lib/validatePassword";
import { Camera } from "lucide-react";


export default function UserProfileModal() {
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => {
        setUser(res.data);
        setUsername(res.data.username);
        setFullName(res.data.fullName);
        setEmail(res.data.email);
      })
      .catch((err) => logError(err, "carregar perfil"));
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setPhotoFile(file);
    if (file) setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!user) return;

    try {
      const hasChangedData =
        fullName.trim() !== user.fullName.trim() ||
        email.trim().toLowerCase() !== user.email.trim().toLowerCase();

      if (hasChangedData) {
        await api.put(`/users/${user.id}`, {
          fullName,
          email,
        });
        showSuccessToast("Dados atualizados com sucesso.");
      }
    } catch (err) {
      logError(err, "atualizar perfil");
      showErrorToast("Erro ao atualizar dados: " + (err as Error).message);
    }

    try {
      if (currentPassword || newPassword) {
        const passwordError = validatePasswordChange(currentPassword, newPassword);
        if (passwordError) {
          showErrorToast(passwordError);
        } else {
          await api.post("/auth/change-password", {
            currentPassword,
            newPassword,
          });
          showSuccessToast("Senha atualizada com sucesso.");
        }
      }
    } catch (err) {
      logError(err, "atualizar perfil");
      showErrorToast("Erro ao atualizar senha: " + (err as Error).message);
    }

    try {
      if (photoFile) {
        const photoData = new FormData();
        photoData.append("photo", photoFile);
        await api.post("/users/upload-photo", photoData);
        showSuccessToast("Foto atualizada com sucesso.");
      }
    } catch (err) {
      logError(err, "atualizar perfil");
      showErrorToast("Erro ao atualizar foto: " + (err as Error).message);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="flex justify-center cursor-pointer">
          {user && <ProfilePhoto userId={user.id} />}
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <h2 className="text-lg font-bold mb-4">Editar Perfil</h2>
        <Tabs defaultValue="dados" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="dados">Dados</TabsTrigger>
            <TabsTrigger value="senha">Senha</TabsTrigger>
            <TabsTrigger value="foto">Foto</TabsTrigger>
          </TabsList>

          <TabsContent value="dados" className="space-y-4">
            <Input
              placeholder="Nome de usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled
            />
            <Input
              placeholder="Nome completo"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <Input
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </TabsContent>

          <TabsContent value="senha" className="space-y-4">
            <Input
              placeholder="Senha atual"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <Input
              placeholder="Nova senha"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </TabsContent>

          <TabsContent value="foto" className="space-y-4">
            <div className="space-y-2 text-center">
              <div className="flex justify-center">
                {previewUrl ? (
                  <Image
                    src={previewUrl}
                    alt="Prévia da foto"
                    width={96}
                    height={96}
                    className="rounded-full object-cover border"
                  />
                ) : (
                  user && <ProfilePhoto userId={user.id} />
                )}
              </div>
              <div>
                <input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                <Button asChild variant="outline" className="flex items-center gap-2">
                  <label htmlFor="photo" className="cursor-pointer">
                    <Camera className="w-4 h-4" />
                    Escolher foto
                  </label>
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-4 space-y-2">
          <Button className="w-full" onClick={handleSubmit}>
            Salvar Alterações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
