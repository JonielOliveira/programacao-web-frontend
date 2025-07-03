import { toast } from "sonner";
import { ReactNode } from "react";

export function showErrorToast(message: ReactNode) {
  toast.error(message, {
    duration: 5000,
  });
}
