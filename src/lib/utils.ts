import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

const ones = [
  "",
  "Satu",
  "Dua",
  "Tiga",
  "Empat",
  "Lima",
  "Enam",
  "Tujuh",
  "Delapan",
  "Sembilan",
  "Sepuluh",
  "Sebelas",
];

function terbilangHelper(n: number): string {
  if (n < 12) return ones[n];
  if (n < 20) return terbilangHelper(n - 10) + " Belas";
  if (n < 100)
    return terbilangHelper(Math.floor(n / 10)) + " Puluh" + (n % 10 ? " " + terbilangHelper(n % 10) : "");
  if (n < 200) return "Seratus" + (n - 100 ? " " + terbilangHelper(n - 100) : "");
  if (n < 1000)
    return terbilangHelper(Math.floor(n / 100)) + " Ratus" + (n % 100 ? " " + terbilangHelper(n % 100) : "");
  if (n < 2000) return "Seribu" + (n - 1000 ? " " + terbilangHelper(n - 1000) : "");
  if (n < 1_000_000)
    return (
      terbilangHelper(Math.floor(n / 1000)) + " Ribu" + (n % 1000 ? " " + terbilangHelper(n % 1000) : "")
    );
  if (n < 1_000_000_000)
    return (
      terbilangHelper(Math.floor(n / 1_000_000)) +
      " Juta" +
      (n % 1_000_000 ? " " + terbilangHelper(n % 1_000_000) : "")
    );
  if (n < 1_000_000_000_000)
    return (
      terbilangHelper(Math.floor(n / 1_000_000_000)) +
      " Miliar" +
      (n % 1_000_000_000 ? " " + terbilangHelper(n % 1_000_000_000) : "")
    );
  return (
    terbilangHelper(Math.floor(n / 1_000_000_000_000)) +
    " Triliun" +
    (n % 1_000_000_000_000 ? " " + terbilangHelper(n % 1_000_000_000_000) : "")
  );
}

export function terbilang(n: number): string {
  if (n === 0) return "Nol Rupiah";
  return terbilangHelper(Math.abs(Math.floor(n))) + " Rupiah";
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function generateDocNumber(prefix: string, sequence: number, year?: number): string {
  const y = year || new Date().getFullYear();
  const seq = String(sequence).padStart(4, "0");
  return `${prefix}/${seq}/${y}`;
}
