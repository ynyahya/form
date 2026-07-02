"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Database, Trash2, Eye } from "lucide-react";
import Link from "next/link";

interface EntityData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  fields: Array<{ id: string; name: string; slug: string; type: string }>;
  _count: { records: number };
}

export default function EntitiesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const { data: entities = [], isLoading } = useQuery<EntityData[]>({
    queryKey: ["entities"],
    queryFn: async () => {
      const res = await fetch("/api/entities");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/entities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          fields: [
            { name: "Nama", slug: "nama", type: "text", required: true },
          ],
        }),
      });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["entities"] });
      setShowCreate(false);
      setName("");
      setDescription("");
      router.push(`/entities/${data.id}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/entities/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entities"] });
    },
  });

  return (
    <div>
      <Header
        title="Entitas / Data Model"
        description="Kelola entitas data seperti Kegiatan, Petugas, Barang, dll."
        actions={
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Buat Entitas
          </Button>
        }
      />

      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : entities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <Database className="h-12 w-12 mb-3" />
            <p className="text-lg font-medium">Belum ada entitas</p>
            <p className="text-sm mt-1">Buat entitas untuk menyimpan data master</p>
            <Button className="mt-4" onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Buat Entitas Pertama
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {entities.map((entity) => (
              <Card key={entity.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <Link
                        href={`/entities/${entity.id}`}
                        className="text-base font-semibold text-gray-900 hover:text-blue-600"
                      >
                        {entity.name}
                      </Link>
                      {entity.description && (
                        <p className="text-sm text-gray-500 mt-1">{entity.description}</p>
                      )}
                    </div>
                    <Database className="h-5 w-5 text-gray-400" />
                  </div>

                  <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                    <span>{entity.fields.length} field</span>
                    <span>{entity._count.records} record</span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1">
                    {entity.fields.slice(0, 5).map((field) => (
                      <Badge key={field.id} variant="secondary" className="text-xs">
                        {field.name}
                      </Badge>
                    ))}
                    {entity.fields.length > 5 && (
                      <Badge variant="secondary" className="text-xs">
                        +{entity.fields.length - 5}
                      </Badge>
                    )}
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <Link href={`/entities/${entity.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        Detail
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-auto"
                      onClick={() => {
                        if (confirm("Hapus entitas ini?")) deleteMutation.mutate(entity.id);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buat Entitas Baru</DialogTitle>
            <DialogDescription>
              Buat entitas untuk menyimpan data master seperti Petugas, Kegiatan, Barang, dll.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nama Entitas</Label>
              <Input
                placeholder="Contoh: Petugas, Kegiatan, Barang"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Deskripsi</Label>
              <Textarea
                placeholder="Deskripsi entitas"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Batal</Button>
            <Button onClick={() => createMutation.mutate()} disabled={!name || createMutation.isPending}>
              {createMutation.isPending ? "Membuat..." : "Buat Entitas"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
