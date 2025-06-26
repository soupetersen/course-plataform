import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getLevelText = (level?: string) => {
  switch (level) {
    case "BEGINNER":
      return "Iniciante";
    case "INTERMEDIATE":
      return "Intermediário";
    case "ADVANCED":
      return "Avançado";
    default:
      return level;
  }
}

export const getLevelColor = (level?: string) => {
    switch (level) {
      case "BEGINNER":
        return "bg-green-100 text-green-800";
      case "INTERMEDIATE":
        return "bg-yellow-100 text-yellow-800";
      case "ADVANCED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
