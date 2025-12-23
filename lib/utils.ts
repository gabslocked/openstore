import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export function formatPrice(value: number): string {
  // Handle NaN, undefined, null, or invalid numbers
  if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
    return 'R$ 0,00'
  }
  return `R$ ${value.toFixed(2).replace(".", ",")}`
}
