import { toast } from "sonner";

export function showErrorToast(message: string) {
  toast.error(message, {
    duration: 5000,
  });
}
