import api from "./api";
import { logWarn } from "./logger";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export async function logout() {
  try {
    await api.post("/auth/logout");
  } catch (err) {
    logWarn(err, "Logout");
  } finally {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }
}
