import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function stripUuidFromFile(fileName: string): string {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-/;
  return fileName.replace(uuidRegex, '');
}

// Função para verificar se um link é clicável (URL ou coordenadas)
export function isLinkClickable(link: string | null): boolean {
  if (!link) return false;
  // Verifica se começa com http/https ou se parece ser um par de coordenadas
  return link.startsWith("http://") || link.startsWith("https://") || /^-?\d+\.\d+,\s*-?\d+\.\d+/.test(link);
}

// NOVO: Função para converter cor HEX para RGBA com transparência
export function hexToRgba(hex: string, alpha: number): string {
  let r = 0, g = 0, b = 0;
  // Handle different hex formats
  if (hex.length === 4) { // #RGB
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) { // #RRGGBB
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  }
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}