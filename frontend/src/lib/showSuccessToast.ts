import { toast } from "sonner";

export function showSuccessToast(message: string) {
  toast.success(message, {
    duration: 5000,
  });
}
