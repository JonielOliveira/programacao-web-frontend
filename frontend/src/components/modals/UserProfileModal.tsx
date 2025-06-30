"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
import { User } from "@/types/user";

interface UserProfileModalProps {
  user: User;
  onUserUpdate?: (updatedUser: User) => void;
  photoVersion: number;
  onPhotoUpdate: () => void;
}

export default function UserProfileModal({
  user,
  onUserUpdate,
  photoVersion,
  onPhotoUpdate,
}: UserProfileModalProps) {
  const [username, setUsername] = useState(user.username);
  const [fullName, setFullName] = useState(user.fullName);
  const [email, setEmail] = useState(user.email);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    setUsername(user.username);
    setFullName(user.fullName);
    setEmail(user.email);
  }, [user]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setPhotoFile(file);
    if (file) setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    try {
      const hasChangedData =
        fullName.trim() !== user.fullName.trim() ||
        email.trim().toLowerCase() !== user.email.trim().toLowerCase();

      if (hasChangedData) {
        await api.put(`/users/${user.id}`, { fullName, email });
        showSuccessToast("Dados atualizados com sucesso.");
        const updatedUser = { ...user, fullName, email };
        onUserUpdate?.(updatedUser);
      }
    } catch (err) {
      logError(err, "atualizar perfil");
      showErrorToast("Erro ao atualizar dados: " + (err as Error).message);
    }

    try {
      if (currentPassword || newPassword || confirmPassword) {
        const passwordError = validatePasswordChange(
          currentPassword,
          newPassword,
          confirmPassword
        );
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
      logError(err, "atualizar senha");
      showErrorToast("Erro ao atualizar senha: " + (err as Error).message);
    }

    try {
      if (photoFile) {
        const photoData = new FormData();
        photoData.append("photo", photoFile);
        await api.post(`/users/${user.id}/upload-photo`, photoData);
        showSuccessToast("Foto atualizada com sucesso.");
        onPhotoUpdate();
        setPreviewUrl(null);
      }
    } catch (err) {
      logError(err, "atualizar foto");
      showErrorToast("Erro ao atualizar foto: " + (err as Error).message);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="flex justify-center cursor-pointer">
          <ProfilePhoto userId={user.id} version={photoVersion} />
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogTitle className="text-lg font-bold mb-4">
          Editar Perfil
        </DialogTitle>
        <Tabs defaultValue="dados" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="dados">Dados</TabsTrigger>
            <TabsTrigger value="senha">Senha</TabsTrigger>
            <TabsTrigger value="foto">Foto</TabsTrigger>
          </TabsList>

          <TabsContent value="dados" className="space-y-4">
            <Input placeholder="Nome de usuário" value={username} disabled />
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
            <Input
              placeholder="Confirmar nova senha"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
                  <ProfilePhoto userId={user.id} version={photoVersion} />
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
