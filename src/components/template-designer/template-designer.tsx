"use client";

import { useState } from "react";
import { type TemplateElement } from "@/types/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Save,
  ArrowLeft,
  Plus,
  Type,
  Table,
  Image as ImageIcon,
  Minus,
  Square,
  PenTool,
  QrCode,
  Hash,
  Trash2,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";
import { cn } from "@/lib/utils";

interface TemplateDesignerProps {
  formId: string;
  templateName: string;
  formFields: Array<{ slug: string; label: string; type: string }>;
  initialElements: TemplateElement[];
  onSave: (elements: TemplateElement[]) => Promise<void>;
}

const ELEMENT_TYPES = [
  { type: "text", label: "Teks", icon: Type },
  { type: "field", label: "Field Placeholder", icon: FileText },
  { type: "table", label: "Tabel", icon: Table },
  { type: "image", label: "Gambar/Logo", icon: ImageIcon },
  { type: "line", label: "Garis", icon: Minus },
  { type: "shape", label: "Kotak", icon: Square },
  { type: "signature", label: "Tanda Tangan", icon: PenTool },
  { type: "qr", label: "QR Code", icon: QrCode },
  { type: "page_number", label: "Nomor Halaman", icon: Hash },
] as const;

export function TemplateDesigner({
  formId,
  templateName,
  formFields,
  initialElements,
  onSave,
}: TemplateDesignerProps) {
  const [elements, setElements] = useState<TemplateElement[]>(initialElements);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const selectedElement = elements.find((e) => e.id === selectedId);

  const addElement = (type: TemplateElement["type"]) => {
    const newElement: TemplateElement = {
      id: uuidv4(),
      type,
      content: type === "text" ? "Teks baru" : type === "page_number" ? "Halaman {{page}}" : "",
      x: 20,
      y: elements.length * 40 + 20,
      width: type === "table" ? 560 : type === "line" ? 560 : 200,
      height: type === "table" ? 120 : type === "line" ? 2 : type === "text" ? 30 : 60,
      style: {
        fontSize: 12,
        fontWeight: "normal",
        textAlign: "left",
      },
    };
    setElements([...elements, newElement]);
    setSelectedId(newElement.id);
  };

  const updateElement = (id: string, changes: Partial<TemplateElement>) => {
    setElements(elements.map((e) => (e.id === id ? { ...e, ...changes } : e)));
  };

  const deleteElement = (id: string) => {
    setElements(elements.filter((e) => e.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(elements);
    } finally {
      setSaving(false);
    }
  };

  const renderElement = (element: TemplateElement) => {
    const isSelected = selectedId === element.id;

    return (
      <div
        key={element.id}
        className={cn(
          "absolute cursor-pointer border transition-colors",
          isSelected ? "border-blue-500 ring-2 ring-blue-200" : "border-transparent hover:border-gray-300"
        )}
        style={{
          left: element.x,
          top: element.y,
          width: element.width,
          height: element.height,
        }}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedId(element.id);
        }}
      >
        {element.type === "text" && (
          <div
            className="w-full h-full flex items-center px-1 overflow-hidden"
            style={{
              fontSize: Number(element.style?.fontSize || 12),
              fontWeight: String(element.style?.fontWeight || "normal"),
              textAlign: (element.style?.textAlign || "left") as "left" | "center" | "right",
            }}
          >
            {element.content}
          </div>
        )}
        {element.type === "field" && (
          <div className="w-full h-full flex items-center px-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700 font-mono">
            {"{{"}
            {element.fieldSlug || "field"}
            {"}}"}
          </div>
        )}
        {element.type === "table" && (
          <div className="w-full h-full border border-gray-300 rounded overflow-hidden">
            <div className="bg-gray-100 px-2 py-1 text-xs font-medium border-b">
              {element.repeatFrom ? `Repeat: ${element.repeatFrom}` : "Tabel"}
            </div>
            <div className="flex text-xs">
              {element.columns?.map((col, i) => (
                <div key={i} className="flex-1 px-2 py-1 border-r last:border-r-0 border-gray-200 truncate">
                  {col.label}
                </div>
              )) || (
                <div className="flex-1 px-2 py-1 text-gray-400">Konfigurasi kolom di panel kanan</div>
              )}
            </div>
          </div>
        )}
        {element.type === "line" && <div className="w-full border-t-2 border-gray-800 mt-[50%]" />}
        {element.type === "shape" && <div className="w-full h-full border-2 border-gray-800 rounded" />}
        {element.type === "signature" && (
          <div className="w-full h-full border-2 border-dashed border-gray-400 rounded flex items-center justify-center text-xs text-gray-400">
            Tanda Tangan
          </div>
        )}
        {element.type === "qr" && (
          <div className="w-full h-full border border-gray-300 rounded flex items-center justify-center">
            <QrCode className="h-8 w-8 text-gray-400" />
          </div>
        )}
        {element.type === "image" && (
          <div className="w-full h-full border border-gray-300 rounded flex items-center justify-center bg-gray-50">
            <ImageIcon className="h-8 w-8 text-gray-400" />
          </div>
        )}
        {element.type === "page_number" && (
          <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
            {element.content}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href={`/forms/${formId}/templates`} className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">{templateName}</h1>
            <p className="text-xs text-gray-500">Template Designer</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {ELEMENT_TYPES.map(({ type, label, icon: Icon }) => (
            <Button
              key={type}
              variant="ghost"
              size="sm"
              onClick={() => addElement(type as TemplateElement["type"])}
              title={label}
            >
              <Icon className="h-4 w-4" />
            </Button>
          ))}
          <div className="w-px h-6 bg-gray-200 mx-1" />
          <Button size="sm" onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-1" />
            {saving ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </div>

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Canvas */}
        <div className="flex-1 overflow-auto bg-gray-100 p-6" onClick={() => setSelectedId(null)}>
          <div
            className="mx-auto bg-white shadow-lg border border-gray-200 relative"
            style={{ width: 595, minHeight: 842, padding: 40 }}
          >
            <div className="relative" style={{ minHeight: 762 }}>
              {elements.map(renderElement)}

              {elements.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                  <p className="text-lg font-medium">Tambahkan elemen</p>
                  <p className="text-sm mt-1">Gunakan toolbar di atas untuk menambah elemen</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Properties panel */}
        {selectedElement && (
          <div className="w-80 border-l border-gray-200 bg-white overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900">Properties</h3>
              <button
                onClick={() => deleteElement(selectedElement.id)}
                className="p-1.5 rounded hover:bg-red-50 text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {(selectedElement.type === "text" || selectedElement.type === "page_number") && (
                <div className="space-y-2">
                  <Label>Konten</Label>
                  <Textarea
                    value={selectedElement.content || ""}
                    onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
                    rows={3}
                  />
                  <p className="text-xs text-gray-400">
                    Gunakan {"{{field_slug}}"} untuk placeholder
                  </p>
                </div>
              )}

              {selectedElement.type === "field" && (
                <div className="space-y-2">
                  <Label>Field</Label>
                  <Select
                    value={selectedElement.fieldSlug || ""}
                    onValueChange={(v) => updateElement(selectedElement.id, { fieldSlug: v })}
                  >
                    <SelectTrigger><SelectValue placeholder="Pilih field" /></SelectTrigger>
                    <SelectContent>
                      {formFields.map((f) => (
                        <SelectItem key={f.slug} value={f.slug}>
                          {f.label} ({f.slug})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedElement.type === "table" && (
                <>
                  <div className="space-y-2">
                    <Label>Repeat dari field</Label>
                    <Select
                      value={selectedElement.repeatFrom || ""}
                      onValueChange={(v) => updateElement(selectedElement.id, { repeatFrom: v })}
                    >
                      <SelectTrigger><SelectValue placeholder="Pilih table field" /></SelectTrigger>
                      <SelectContent>
                        {formFields
                          .filter((f) => f.type === "dynamic_table" || f.type === "static_table")
                          .map((f) => (
                            <SelectItem key={f.slug} value={f.slug}>
                              {f.label}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Kolom</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const cols = selectedElement.columns || [];
                          updateElement(selectedElement.id, {
                            columns: [...cols, { label: `Kolom ${cols.length + 1}`, fieldSlug: "", width: 100 }],
                          });
                        }}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    {selectedElement.columns?.map((col, i) => (
                      <div key={i} className="flex gap-2">
                        <Input
                          value={col.label}
                          onChange={(e) => {
                            const cols = [...(selectedElement.columns || [])];
                            cols[i] = { ...cols[i], label: e.target.value };
                            updateElement(selectedElement.id, { columns: cols });
                          }}
                          placeholder="Label"
                          className="flex-1"
                        />
                        <Select
                          value={col.fieldSlug}
                          onValueChange={(v) => {
                            const cols = [...(selectedElement.columns || [])];
                            cols[i] = { ...cols[i], fieldSlug: v };
                            updateElement(selectedElement.id, { columns: cols });
                          }}
                        >
                          <SelectTrigger className="flex-1"><SelectValue placeholder="Field" /></SelectTrigger>
                          <SelectContent>
                            {formFields.map((f) => (
                              <SelectItem key={f.slug} value={f.slug}>{f.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div className="border-t pt-4 space-y-3">
                <Label className="text-xs text-gray-500 uppercase tracking-wider">Posisi & Ukuran</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">X</Label>
                    <Input
                      type="number"
                      value={selectedElement.x}
                      onChange={(e) => updateElement(selectedElement.id, { x: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Y</Label>
                    <Input
                      type="number"
                      value={selectedElement.y}
                      onChange={(e) => updateElement(selectedElement.id, { y: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Width</Label>
                    <Input
                      type="number"
                      value={selectedElement.width}
                      onChange={(e) => updateElement(selectedElement.id, { width: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Height</Label>
                    <Input
                      type="number"
                      value={selectedElement.height}
                      onChange={(e) => updateElement(selectedElement.id, { height: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              {(selectedElement.type === "text" || selectedElement.type === "field") && (
                <div className="border-t pt-4 space-y-3">
                  <Label className="text-xs text-gray-500 uppercase tracking-wider">Style</Label>
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Font Size</Label>
                      <Input
                        type="number"
                        value={Number(selectedElement.style?.fontSize || 12)}
                        onChange={(e) =>
                          updateElement(selectedElement.id, {
                            style: { ...selectedElement.style, fontSize: Number(e.target.value) },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Font Weight</Label>
                      <Select
                        value={String(selectedElement.style?.fontWeight || "normal")}
                        onValueChange={(v) =>
                          updateElement(selectedElement.id, {
                            style: { ...selectedElement.style, fontWeight: v },
                          })
                        }
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="bold">Bold</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Text Align</Label>
                      <Select
                        value={String(selectedElement.style?.textAlign || "left")}
                        onValueChange={(v) =>
                          updateElement(selectedElement.id, {
                            style: { ...selectedElement.style, textAlign: v },
                          })
                        }
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="left">Left</SelectItem>
                          <SelectItem value="center">Center</SelectItem>
                          <SelectItem value="right">Right</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
