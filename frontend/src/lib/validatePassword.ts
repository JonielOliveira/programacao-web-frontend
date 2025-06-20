export function validatePasswordChange(current: string, next: string, confirm: string): string | null {
  if (!current) return "Informe sua senha atual.";
  if (!next) return "Informe uma nova senha.";
  if (!confirm) return "Informe a confirmação da nova senha.";
  if (current === next) return "A nova senha não pode ser igual à senha atual.";
  if (next !== confirm) return "A confirmação de senha não corresponde.";
  if (next.length < 8) return "A nova senha deve ter pelo menos 8 caracteres.";
  if (!/[A-Z]/.test(next)) return "A nova senha deve conter pelo menos uma letra maiúscula.";
  if (!/[a-z]/.test(next)) return "A nova senha deve conter pelo menos uma letra minúscula.";
  if (!/[0-9]/.test(next)) return "A nova senha deve conter pelo menos um número.";
  if (!/[!@#$%^&*]/.test(next)) return "A nova senha deve conter um caractere especial (!@#$%^&*).";

  return null;
}
