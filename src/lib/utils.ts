import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format a date as DD.MM.YYYY (German format)
export function getFormattedDate(date: Date): string {
  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

export function createUncontrolledFormField(field: any) {
  return {
    name: field.name,
    onBlur: field.onBlur,
    onChange: (e: any) => field.onChange(e?.target?.value ?? e),
    ref: field.ref
  };
}
