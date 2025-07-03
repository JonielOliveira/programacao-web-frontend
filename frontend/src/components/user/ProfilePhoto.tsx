"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import api from "@/lib/api";
import { logWarn } from "@/lib/logger";

interface ProfilePhotoProps {
  userId: string;
  size?: number;
  className?: string;
  version?: number;
  onClick?: () => void;
}

export default function ProfilePhoto({ userId, size = 72, className = "", version = 0, onClick }: ProfilePhotoProps) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchPhoto = async () => {
      try {
        const response = await api.get(`/users/${userId}/photo?v=${version}`, {
          responseType: "blob",
        });
        const url = URL.createObjectURL(response.data);
        setPhotoUrl(url);
      } catch (err) {
        logWarn(err, "Carregar foto de perfil");
      }
    };

    fetchPhoto();
  }, [userId, version]);

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
