"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import api from "@/lib/api";

interface ProfilePhotoProps {
  userId: string;
  size?: number;
  className?: string;
  onClick?: () => void;
}

export default function ProfilePhoto({ userId, size = 72, className = "", onClick }: ProfilePhotoProps) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchPhoto = async () => {
      try {
        const response = await api.get(`/users/${userId}/photo`, {
          responseType: "blob",
        });
        const url = URL.createObjectURL(response.data);
        setPhotoUrl(url);
      } catch (error) {
        console.warn("Erro ao carregar a foto de perfil:", error);
      }
    };

    fetchPhoto();
  }, [userId]);

  return (
    <Image
      src={photoUrl ?? "/default-user.png"}
      alt="Foto de perfil"
      width={size}
      height={size}
      className={`rounded-full object-cover border border-white ${className}`}
      unoptimized
      onClick={onClick}
    />
  );
}
