"use client";

import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { FileStack } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TemplatesOverviewPage() {
  return (
    <div>
      <Header
        title="Template Library"
        description="Koleksi template dokumen pemerintahan"
      />
      <div className="p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            "Daftar Hadir",
            "SPJ Honor",
            "SPJ Transport",
            "SPPD",
            "Kwitansi",
            "Tanda Terima Barang",
            "Tanda Terima Honor",
            "Berita Acara",
            "Surat Pernyataan",
            "Absensi",
            "Checklist",
            "Monitoring",
            "Inventaris",
            "Distribusi Barang",
            "Rekap Honor",
            "Rekap Transport",
          ].map((name) => (
            <Card key={name} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                  <FileStack className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{name}</p>
                  <p className="text-xs text-gray-500">Template bawaan</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 mb-3">
            Untuk menggunakan template, buat form terlebih dahulu lalu tambahkan template dari halaman form.
          </p>
          <Link href="/forms">
            <Button variant="outline">Buka Forms</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
