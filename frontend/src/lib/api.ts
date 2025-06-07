import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
});

// Lista de rotas públicas (não necessitam de token de autenticação)
const publicRoutes = ["/auth/login"];

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");

    // Verifica se a rota atual é pública
    const isPublic = publicRoutes.some((route) =>
      config.url?.startsWith(route)
    );

    // Se não for pública e houver token, adiciona no header
    if (!isPublic && token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

export default api;
