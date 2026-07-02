"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import Link from "next/link";

interface EntityField {
  id: string;
  name: string;
  slug: string;
  type: string;
  required: boolean;
  order: number;
}

interface EntityRecord {
  id: string;
  data: Record<string, unknown>;
  createdAt: string;
}

interface EntityDetail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  fields: EntityField[];
  records: EntityRecord[];
}

const FIELD_TYPES = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "currency", label: "Currency" },
  { value: "date", label: "Date" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "dropdown", label: "Dropdown" },
];

export default function EntityDetailPage() {
  const params = useParams();
  const entityId = params.id as string;
  const queryClient = useQueryClient();
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [recordData, setRecordData] = useState<Record<string, string>>({});
  const [editingFields, setEditingFields] = useState<EntityField[]>([]);
  const [isEditingSchema, setIsEditingSchema] = useState(false);

  const { data: entity, isLoading } = useQuery<EntityDetail>({
    queryKey: ["entity", entityId],
    queryFn: async () => {
      const res = await fetch(`/api/entities/${entityId}`);
      return res.json();
    },
    select: (data) => {
      if (!isEditingSchema && editingFields.length === 0) {
        setEditingFields(data.fields);
      }
      return data;
    },
  });

  const updateFieldsMutation = useMutation({
    mutationFn: async (fields: EntityField[]) => {
      const res = await fetch(`/api/entities/${entityId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fields: fields.map((f, i) => ({
            name: f.name,
            slug: f.slug,
            type: f.type,
            required: f.required,
            order: i,
          })),
        }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entity", entityId] });
      setIsEditingSchema(false);
    },
  });

  const addRecordMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/entities/${entityId}/records`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: recordData }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entity", entityId] });
      setShowAddRecord(false);
      setRecordData({});
    },
  });

  if (isLoading || !entity) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <Header
        title={entity.name}
        description={entity.description || undefined}
        actions={
          <Button onClick={() => setShowAddRecord(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Record
          </Button>
        }
      />

      <div className="p-6">
        <div className="mb-4">
          <Link href="/entities" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke Entitas
          </Link>
        </div>

        <Tabs defaultValue="records">
          <TabsList>
            <TabsTrigger value="records">Records ({entity.records.length})</TabsTrigger>
            <TabsTrigger value="schema">Schema ({entity.fields.length} field)</TabsTrigger>
          </TabsList>

          <TabsContent value="records">
            <div className="mt-4">
              {entity.records.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <p>Belum ada record</p>
                    <Button className="mt-3" size="sm" onClick={() => setShowAddRecord(true)}>
                      Tambah Record
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                        {entity.fields.map((field) => (
                          <th key={field.id} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            {field.name}
                          </th>
                        ))}
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entity.records.map((record, i) => (
                        <tr key={record.id} className="border-t border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                          {entity.fields.map((field) => (
                            <td key={field.id} className="px-4 py-3">
                              {String(record.data[field.slug] ?? "-")}
                            </td>
                          ))}
                          <td className="px-4 py-3 text-gray-500 text-xs">
                            {new Date(record.createdAt).toLocaleDateString("id-ID")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="schema">
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">Definisikan field untuk entitas ini</p>
                <div className="flex gap-2">
                  {isEditingSchema && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingFields(entity.fields);
                          setIsEditingSchema(false);
                        }}
                      >
                        Batal
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => updateFieldsMutation.mutate(editingFields)}
                        disabled={updateFieldsMutation.isPending}
                      >
                        <Save className="h-3.5 w-3.5 mr-1" />
                        Simpan
                      </Button>
                    </>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsEditingSchema(true);
                      setEditingFields([
                        ...editingFields,
                        {
                          id: `new-${Date.now()}`,
                          name: "",
                          slug: "",
                          type: "text",
                          required: false,
                          order: editingFields.length,
                        },
                      ]);
                    }}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Tambah Field
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {editingFields.map((field, index) => (
                  <Card key={field.id}>
                    <CardContent className="flex items-center gap-3 p-3">
                      <span className="text-xs text-gray-400 w-6">{index + 1}</span>
                      <Input
                        value={field.name}
                        onChange={(e) => {
                          const updated = [...editingFields];
                          updated[index] = {
                            ...updated[index],
                            name: e.target.value,
                            slug: e.target.value.toLowerCase().replace(/\s+/g, "_"),
                          };
                          setEditingFields(updated);
                          setIsEditingSchema(true);
                        }}
                        placeholder="Nama field"
                        className="flex-1"
                      />
                      <Input
                        value={field.slug}
                        onChange={(e) => {
                          const updated = [...editingFields];
                          updated[index] = { ...updated[index], slug: e.target.value };
                          setEditingFields(updated);
                          setIsEditingSchema(true);
                        }}
                        placeholder="slug"
                        className="flex-1 font-mono text-xs"
                      />
                      <Select
                        value={field.type}
                        onValueChange={(v) => {
                          const updated = [...editingFields];
                          updated[index] = { ...updated[index], type: v };
                          setEditingFields(updated);
                          setIsEditingSchema(true);
                        }}
                      >
                        <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {FIELD_TYPES.map((t) => (
                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <label className="flex items-center gap-1 text-xs">
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={(e) => {
                            const updated = [...editingFields];
                            updated[index] = { ...updated[index], required: e.target.checked };
                            setEditingFields(updated);
                            setIsEditingSchema(true);
                          }}
                          className="h-3.5 w-3.5"
                        />
                        Wajib
                      </label>
                      <button
                        onClick={() => {
                          setEditingFields(editingFields.filter((_, i) => i !== index));
                          setIsEditingSchema(true);
                        }}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showAddRecord} onOpenChange={setShowAddRecord}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Record - {entity.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {entity.fields.map((field) => (
              <div key={field.id} className="space-y-2">
                <Label>
                  {field.name}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                <Input
                  type={field.type === "number" || field.type === "currency" ? "number" : field.type === "date" ? "date" : "text"}
                  value={recordData[field.slug] || ""}
                  onChange={(e) => setRecordData({ ...recordData, [field.slug]: e.target.value })}
                  required={field.required}
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddRecord(false)}>Batal</Button>
            <Button onClick={() => addRecordMutation.mutate()} disabled={addRecordMutation.isPending}>
              {addRecordMutation.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
