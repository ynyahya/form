"use client";

import { type FormFieldData } from "@/types/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";

interface FieldSettingsProps {
  field: FormFieldData;
  onUpdate: (field: FormFieldData) => void;
  onClose: () => void;
}

export function FieldSettings({ field, onUpdate, onClose }: FieldSettingsProps) {
  const [localField, setLocalField] = useState<FormFieldData>(field);

  useEffect(() => {
    setLocalField(field);
  }, [field]);

  const update = (changes: Partial<FormFieldData>) => {
    const updated = { ...localField, ...changes };
    setLocalField(updated);
    onUpdate(updated);
  };

  const addChoice = () => {
    const choices = localField.options?.choices || [];
    update({
      options: {
        ...localField.options,
        choices: [...choices, { label: `Opsi ${choices.length + 1}`, value: `opsi_${choices.length + 1}` }],
      },
    });
  };

  const removeChoice = (index: number) => {
    const choices = [...(localField.options?.choices || [])];
    choices.splice(index, 1);
    update({ options: { ...localField.options, choices } });
  };

  const updateChoice = (index: number, key: "label" | "value", val: string) => {
    const choices = [...(localField.options?.choices || [])];
    choices[index] = { ...choices[index], [key]: val };
    update({ options: { ...localField.options, choices } });
  };

  const hasChoices = ["dropdown", "radio", "checkbox", "multi_select", "autocomplete"].includes(field.type);
  const hasColumns = ["dynamic_table", "static_table"].includes(field.type);

  return (
    <div className="w-80 border-l border-gray-200 bg-white overflow-y-auto h-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900">Pengaturan Field</h3>
        <button onClick={onClose} className="p-1 rounded hover:bg-gray-100">
          <X className="h-4 w-4 text-gray-500" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <Label>Label</Label>
          <Input value={localField.label} onChange={(e) => update({ label: e.target.value })} />
        </div>

        <div className="space-y-2">
          <Label>Slug</Label>
          <Input value={localField.slug} onChange={(e) => update({ slug: e.target.value })} className="font-mono text-xs" />
        </div>

        <div className="space-y-2">
          <Label>Placeholder</Label>
          <Input value={localField.placeholder || ""} onChange={(e) => update({ placeholder: e.target.value })} />
        </div>

        <div className="space-y-2">
          <Label>Help Text</Label>
          <Input value={localField.helpText || ""} onChange={(e) => update({ helpText: e.target.value })} />
        </div>

        <div className="space-y-2">
          <Label>Default Value</Label>
          <Input value={localField.defaultValue || ""} onChange={(e) => update({ defaultValue: e.target.value })} />
        </div>

        <div className="space-y-2">
          <Label>Width</Label>
          <Select value={localField.width} onValueChange={(v) => update({ width: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="full">Full Width</SelectItem>
              <SelectItem value="half">Half (1/2)</SelectItem>
              <SelectItem value="third">Third (1/3)</SelectItem>
              <SelectItem value="quarter">Quarter (1/4)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Prefix</Label>
          <Input value={localField.prefix || ""} onChange={(e) => update({ prefix: e.target.value })} />
        </div>

        <div className="space-y-2">
          <Label>Suffix</Label>
          <Input value={localField.suffix || ""} onChange={(e) => update({ suffix: e.target.value })} />
        </div>

        <div className="border-t pt-4 space-y-3">
          <Label className="text-xs text-gray-500 uppercase tracking-wider">Validasi</Label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={localField.required}
              onChange={(e) => update({ required: e.target.checked })}
              className="h-4 w-4 rounded text-blue-600"
            />
            Required
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={localField.readonly}
              onChange={(e) => update({ readonly: e.target.checked })}
              className="h-4 w-4 rounded text-blue-600"
            />
            Read Only
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={localField.hidden}
              onChange={(e) => update({ hidden: e.target.checked })}
              className="h-4 w-4 rounded text-blue-600"
            />
            Hidden
          </label>
        </div>

        {localField.type === "formula" && (
          <div className="border-t pt-4 space-y-2">
            <Label>Formula</Label>
            <Textarea
              value={localField.formula || ""}
              onChange={(e) => update({ formula: e.target.value })}
              placeholder="Contoh: honor_harian * jumlah_hari"
              className="font-mono text-xs"
              rows={3}
            />
            <p className="text-xs text-gray-400">
              Gunakan slug field lain dalam formula. Operator: +, -, *, /
            </p>
          </div>
        )}

        {hasChoices && (
          <div className="border-t pt-4 space-y-2">
            <div className="flex items-center justify-between">
              <Label>Opsi</Label>
              <Button variant="ghost" size="sm" onClick={addChoice}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Tambah
              </Button>
            </div>
            <div className="space-y-2">
              {(localField.options?.choices || []).map((choice, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={choice.label}
                    onChange={(e) => updateChoice(i, "label", e.target.value)}
                    placeholder="Label"
                    className="flex-1"
                  />
                  <Input
                    value={choice.value}
                    onChange={(e) => updateChoice(i, "value", e.target.value)}
                    placeholder="Value"
                    className="flex-1 font-mono text-xs"
                  />
                  <button onClick={() => removeChoice(i)} className="p-2 text-red-500 hover:bg-red-50 rounded">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {hasColumns && (
          <div className="border-t pt-4 space-y-2">
            <div className="flex items-center justify-between">
              <Label>Kolom Tabel</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const columns = localField.options?.columns || [];
                  update({
                    options: {
                      ...localField.options,
                      columns: [
                        ...columns,
                        { id: `col_${Date.now()}`, label: `Kolom ${columns.length + 1}`, type: "text" as const },
                      ],
                    },
                  });
                }}
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Tambah
              </Button>
            </div>
            <div className="space-y-2">
              {(localField.options?.columns || []).map((col, i) => (
                <div key={col.id} className="flex gap-2">
                  <Input
                    value={col.label}
                    onChange={(e) => {
                      const columns = [...(localField.options?.columns || [])];
                      columns[i] = { ...columns[i], label: e.target.value };
                      update({ options: { ...localField.options, columns } });
                    }}
                    placeholder="Nama Kolom"
                    className="flex-1"
                  />
                  <button
                    onClick={() => {
                      const columns = [...(localField.options?.columns || [])];
                      columns.splice(i, 1);
                      update({ options: { ...localField.options, columns } });
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
