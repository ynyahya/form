"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Pencil, Trash2, Eye } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
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

interface FormData {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  createdAt: string;
  createdBy: { name: string; email: string };
  _count: { templates: number; submissions: number; fields: number };
}

export default function FormsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const { data: forms = [], isLoading } = useQuery<FormData[]>({
    queryKey: ["forms"],
    queryFn: async () => {
      const res = await fetch("/api/forms");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["forms"] });
      setShowCreate(false);
      setTitle("");
      setDescription("");
      router.push(`/forms/${data.id}/builder`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/forms/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forms"] });
    },
  });

  const statusVariant = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return "success" as const;
      case "ARCHIVED":
        return "secondary" as const;
      default:
        return "warning" as const;
    }
  };

  return (
    <div>
      <Header
        title="Forms"
        description="Kelola semua form administrasi"
        actions={
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Buat Form
          </Button>
        }
      />

      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : forms.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <FileText className="h-12 w-12 mb-3" />
            <p className="text-lg font-medium">Belum ada form</p>
            <p className="text-sm mt-1">Mulai dengan membuat form pertama Anda</p>
            <Button className="mt-4" onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Buat Form Pertama
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {forms.map((form) => (
              <Card key={form.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/forms/${form.id}`}
                        className="text-base font-semibold text-gray-900 hover:text-blue-600 truncate block"
                      >
                        {form.title}
                      </Link>
                      {form.description && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{form.description}</p>
                      )}
                    </div>
                    <Badge variant={statusVariant(form.status)}>{form.status}</Badge>
                  </div>

                  <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                    <span>{form._count.fields} field</span>
                    <span>{form._count.templates} template</span>
                    <span>{form._count.submissions} submission</span>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <Link href={`/forms/${form.id}/builder`}>
                      <Button variant="outline" size="sm">
                        <Pencil className="h-3.5 w-3.5 mr-1" />
                        Builder
                      </Button>
                    </Link>
                    <Link href={`/forms/${form.id}/fill`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        Isi
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-auto"
                      onClick={() => {
                        if (confirm("Hapus form ini?")) deleteMutation.mutate(form.id);
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
            <DialogTitle>Buat Form Baru</DialogTitle>
            <DialogDescription>
              Buat form administrasi baru. Anda dapat menambahkan field dan template setelah form dibuat.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Judul Form</Label>
              <Input
                placeholder="Contoh: Daftar Hadir Petugas"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Deskripsi (opsional)</Label>
              <Textarea
                placeholder="Deskripsi singkat tentang form ini"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              Batal
            </Button>
            <Button
              onClick={() => createMutation.mutate()}
              disabled={!title || createMutation.isPending}
            >
              {createMutation.isPending ? "Membuat..." : "Buat Form"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
