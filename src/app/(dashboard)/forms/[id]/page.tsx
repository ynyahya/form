"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pencil, Eye, FileStack, Send, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface FormDetail {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  status: string;
  version: number;
  createdAt: string;
  createdBy: { name: string; email: string };
  fields: Array<{ id: string; label: string; type: string; slug: string; order: number }>;
  templates: Array<{ id: string; name: string; type: string }>;
  _count: { submissions: number };
}

export default function FormDetailPage() {
  const params = useParams();
  const formId = params.id as string;

  const { data: form, isLoading } = useQuery<FormDetail>({
    queryKey: ["form", formId],
    queryFn: async () => {
      const res = await fetch(`/api/forms/${formId}`);
      return res.json();
    },
  });

  if (isLoading || !form) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <Header
        title={form.title}
        description={form.description || undefined}
        actions={
          <div className="flex items-center gap-2">
            <Link href={`/forms/${formId}/builder`}>
              <Button variant="outline">
                <Pencil className="h-4 w-4 mr-2" />
                Builder
              </Button>
            </Link>
            <Link href={`/forms/${formId}/fill`}>
              <Button>
                <Eye className="h-4 w-4 mr-2" />
                Isi Form
              </Button>
            </Link>
          </div>
        }
      />

      <div className="p-6">
        <div className="mb-6 flex items-center gap-2">
          <Link href="/forms" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke Forms
          </Link>
        </div>

        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="fields">Fields ({form.fields.length})</TabsTrigger>
            <TabsTrigger value="templates">Templates ({form.templates.length})</TabsTrigger>
            <TabsTrigger value="submissions">Submissions ({form._count.submissions})</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-500">Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant={form.status === "PUBLISHED" ? "success" : "warning"}>
                    {form.status}
                  </Badge>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-500">Versi</CardTitle>
                </CardHeader>
                <CardContent>
                  <span className="text-2xl font-bold">{form.version}</span>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-500">Dibuat oleh</CardTitle>
                </CardHeader>
                <CardContent>
                  <span className="text-sm font-medium">{form.createdBy.name}</span>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="fields">
            <div className="mt-4">
              {form.fields.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <p>Belum ada field</p>
                    <Link href={`/forms/${formId}/builder`}>
                      <Button className="mt-3" size="sm">Buka Builder</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {form.fields.map((field) => (
                    <Card key={field.id}>
                      <CardContent className="flex items-center justify-between p-4">
                        <div>
                          <span className="font-medium">{field.label}</span>
                          <span className="ml-2 text-xs text-gray-400 font-mono">{field.slug}</span>
                        </div>
                        <Badge variant="outline">{field.type}</Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="templates">
            <div className="mt-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-500">Template dokumen yang dihasilkan dari form ini</p>
                <Link href={`/forms/${formId}/templates`}>
                  <Button size="sm">
                    <FileStack className="h-4 w-4 mr-2" />
                    Kelola Template
                  </Button>
                </Link>
              </div>
              {form.templates.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <p>Belum ada template</p>
                    <Link href={`/forms/${formId}/templates`}>
                      <Button className="mt-3" size="sm">Tambah Template</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {form.templates.map((template) => (
                    <Card key={template.id}>
                      <CardContent className="flex items-center justify-between p-4">
                        <span className="font-medium">{template.name}</span>
                        <Badge variant="outline">{template.type}</Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="submissions">
            <div className="mt-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-500">Data yang telah disubmit melalui form ini</p>
                <Link href={`/forms/${formId}/submissions`}>
                  <Button size="sm" variant="outline">
                    <Send className="h-4 w-4 mr-2" />
                    Lihat Semua
                  </Button>
                </Link>
              </div>
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <p>Lihat halaman submissions untuk detail</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
