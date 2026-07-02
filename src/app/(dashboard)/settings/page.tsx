"use client";

import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <div>
      <Header title="Pengaturan" description="Konfigurasi sistem FormFlow" />

      <div className="p-6 max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Instansi</CardTitle>
            <CardDescription>Atur informasi instansi untuk dokumen</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nama Instansi</Label>
              <Input placeholder="Badan Pusat Statistik" />
            </div>
            <div className="space-y-2">
              <Label>Alamat</Label>
              <Input placeholder="Jl. Dr. Sutomo No. 6-8, Jakarta" />
            </div>
            <div className="space-y-2">
              <Label>Kota</Label>
              <Input placeholder="Jakarta" />
            </div>
            <div className="space-y-2">
              <Label>Telepon</Label>
              <Input placeholder="(021) 3841195" />
            </div>
            <Button>Simpan</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Format Penomoran Dokumen</CardTitle>
            <CardDescription>Atur format nomor dokumen otomatis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Prefix</Label>
              <Input placeholder="SPJ" />
            </div>
            <div className="space-y-2">
              <Label>Format</Label>
              <Input placeholder="{{PREFIX}}/{{SEQ}}/{{YEAR}}" />
              <p className="text-xs text-gray-400">
                Variabel: {"{{PREFIX}}"}, {"{{SEQ}}"}, {"{{YEAR}}"}, {"{{MONTH}}"}
              </p>
            </div>
            <Button>Simpan</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
