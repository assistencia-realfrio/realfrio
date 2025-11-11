import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function stripUuidFromFile(fileName: string): string {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-/;
  return fileName.replace(uuidRegex, '');
}

// NOVO: Função para verificar se um link é clicável (URL ou coordenadas)
export function isLinkClickable(link: string | null): boolean {
  if (!link) return false;
  // Verifica se começa com http/https ou se parece ser um par de coordenadas
  return link.startsWith("http://") || link.startsWith("https://") || /^-?\d+\.\d+,\s*-?\d+\.\d+/.test(link);
}