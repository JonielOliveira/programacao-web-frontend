import axios from "axios";
import { showErrorToast } from "@/lib/showErrorToast";
import { ReactNode } from "react";

export function handleAxiosError(err: unknown, defaultMessage = "Erro inesperado") {
  if (axios.isAxiosError(err)) {
    const rawError = err.response?.data?.error?.message;
    const rawDetails = err.response?.data?.error?.details;

    const error = typeof rawError === "string" ? rawError : defaultMessage;
    const details = typeof rawDetails === "string" ? rawDetails : null;

    const content: ReactNode = (
      <>
        {error}
        {details && (
          <>
            <br />
            {"\u00A0\u00A0→ "}{details}
          </>
        )}
      </>
    );

    showErrorToast(content);
  } else {
    showErrorToast(defaultMessage);
  }
}
