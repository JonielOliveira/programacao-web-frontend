"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { logError } from "@/lib/logger";
import { isAuthenticated } from "@/lib/auth";

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated()) {
        router.replace("/login");
        return;
      }

      try {
        const res = await api.get("/auth/me");
        if (res.data.role === "0") {
          setIsAuthorized(true);
        } else {
          router.replace("/dashboard");
        }
      } catch (err) {
        logError(err, "verificar permissão de administrador");
        router.replace("/login");
      } finally {
        setChecked(true);
      }
    };

    checkAuth();
  }, [router]);

  if (!checked) return null;
  return isAuthorized ? <>{children}</> : null;
}
