function getTimestamp() {
  return new Date().toLocaleString("pt-BR");
}
export function logError(err: unknown, context?: string) {
  if (process.env.NODE_ENV === "development") {
    const timestamp = getTimestamp();
    console.error(`[${timestamp}] [Erro${context ? " em " + context : ""}]`, err);
  }
}
export function logWarn(warn: unknown, context?: string) {
  if (process.env.NODE_ENV === "development") {
    const timestamp = getTimestamp();
    console.warn(`[${timestamp}] [Aviso${context ? " em " + context : ""}]`, warn);
  }
}

