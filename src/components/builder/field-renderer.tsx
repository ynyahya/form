"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { type FormFieldData } from "@/types/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { GripVertical, Settings, Trash2, Copy } from "lucide-react";

interface FieldRendererProps {
  field: FormFieldData;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onEdit: () => void;
  mode: "builder" | "fill";
  value?: string;
  onChange?: (value: string) => void;
}

export function FieldRenderer({
  field,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
  onEdit,
  mode,
  value,
  onChange,
}: FieldRendererProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: field.id,
    disabled: mode === "fill",
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const widthClass =
    field.width === "half"
      ? "w-1/2"
      : field.width === "third"
        ? "w-1/3"
        : field.width === "quarter"
          ? "w-1/4"
          : "w-full";

  const renderFieldInput = () => {
    const commonProps = {
      placeholder: field.placeholder || `Masukkan ${field.label}`,
      disabled: mode === "builder",
      required: field.required,
      readOnly: field.readonly,
      value: mode === "fill" ? value || "" : "",
      onChange: mode === "fill" ? (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange?.(e.target.value) : undefined,
    };

    switch (field.type) {
      case "paragraph":
      case "alamat":
        return <Textarea {...commonProps} />;

      case "number":
      case "percentage":
        return <Input type="number" {...commonProps} />;

      case "currency":
      case "nilai_rupiah":
      case "honor":
      case "transport":
      case "uang_harian":
        return (
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
              Rp
            </span>
            <Input type="number" className="pl-10" {...commonProps} />
          </div>
        );

      case "date":
        return <Input type="date" {...commonProps} />;

      case "time":
        return <Input type="time" {...commonProps} />;

      case "datetime":
        return <Input type="datetime-local" {...commonProps} />;

      case "email":
        return <Input type="email" {...commonProps} />;

      case "phone":
        return <Input type="tel" {...commonProps} />;

      case "url":
        return <Input type="url" {...commonProps} />;

      case "dropdown":
      case "autocomplete":
        return (
          <select
            className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm disabled:opacity-50"
            disabled={mode === "builder"}
            value={mode === "fill" ? value || "" : ""}
            onChange={mode === "fill" ? (e) => onChange?.(e.target.value) : undefined}
          >
            <option value="">{field.placeholder || "Pilih..."}</option>
            {field.options?.choices?.map((choice) => (
              <option key={choice.value} value={choice.value}>
                {choice.label}
              </option>
            ))}
          </select>
        );

      case "radio":
        return (
          <div className="space-y-2">
            {field.options?.choices?.map((choice) => (
              <label key={choice.value} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name={field.slug}
                  value={choice.value}
                  disabled={mode === "builder"}
                  checked={mode === "fill" ? value === choice.value : false}
                  onChange={mode === "fill" ? () => onChange?.(choice.value) : undefined}
                  className="h-4 w-4 text-blue-600"
                />
                {choice.label}
              </label>
            )) || <span className="text-sm text-gray-400">Tambahkan opsi di pengaturan</span>}
          </div>
        );

      case "checkbox":
        return (
          <div className="space-y-2">
            {field.options?.choices?.map((choice) => (
              <label key={choice.value} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  value={choice.value}
                  disabled={mode === "builder"}
                  className="h-4 w-4 rounded text-blue-600"
                />
                {choice.label}
              </label>
            )) || <span className="text-sm text-gray-400">Tambahkan opsi di pengaturan</span>}
          </div>
        );

      case "dynamic_table":
      case "static_table":
        return (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border-b px-3 py-2 text-left text-xs font-medium text-gray-500">No</th>
                  {field.options?.columns?.map((col) => (
                    <th key={col.id} className="border-b px-3 py-2 text-left text-xs font-medium text-gray-500">
                      {col.label}
                    </th>
                  )) || (
                    <>
                      <th className="border-b px-3 py-2 text-left text-xs font-medium text-gray-500">Kolom 1</th>
                      <th className="border-b px-3 py-2 text-left text-xs font-medium text-gray-500">Kolom 2</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border-b px-3 py-2 text-gray-400">1</td>
                  <td className="border-b px-3 py-2 text-gray-400" colSpan={field.options?.columns?.length || 2}>
                    Data akan ditampilkan di sini
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        );

      case "upload_photo":
      case "upload_pdf":
      case "upload_document":
        return (
          <div className="flex items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer">
            <span className="text-sm text-gray-500">
              {field.type === "upload_photo" ? "Upload Foto" : field.type === "upload_pdf" ? "Upload PDF" : "Upload Dokumen"}
            </span>
          </div>
        );

      case "signature":
        return (
          <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
            <span className="text-sm text-gray-500">Area Tanda Tangan</span>
          </div>
        );

      case "section":
        return <div className="border-b-2 border-gray-300 pb-2 text-lg font-semibold text-gray-700">{field.label}</div>;

      case "divider":
        return <hr className="border-gray-300" />;

      case "formula":
      case "terbilang":
        return (
          <div className="rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-600">
            {field.formula ? `Formula: ${field.formula}` : "Hasil kalkulasi otomatis"}
          </div>
        );

      case "pajak":
      case "ppn":
      case "pph":
        return (
          <div className="relative">
            <Input type="number" {...commonProps} />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">%</span>
          </div>
        );

      default:
        return <Input {...commonProps} />;
    }
  };

  if (field.type === "divider") {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          "group relative px-4 py-2",
          widthClass,
          isDragging && "opacity-50",
          mode === "builder" && "cursor-move"
        )}
        onClick={onSelect}
      >
        {mode === "builder" && (
          <div className={cn("absolute -top-1 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity", isSelected && "opacity-100")}>
            <button {...attributes} {...listeners} className="p-1 rounded hover:bg-gray-200"><GripVertical className="h-3.5 w-3.5 text-gray-400" /></button>
            <button onClick={onDelete} className="p-1 rounded hover:bg-red-100"><Trash2 className="h-3.5 w-3.5 text-red-500" /></button>
          </div>
        )}
        {renderFieldInput()}
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative rounded-lg p-4",
        widthClass,
        isDragging && "opacity-50 z-50",
        mode === "builder" && [
          "border-2 border-transparent hover:border-blue-200 cursor-move",
          isSelected && "border-blue-400 bg-blue-50/30",
        ]
      )}
      onClick={onSelect}
    >
      {mode === "builder" && (
        <div
          className={cn(
            "absolute -top-2 right-2 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10",
            isSelected && "opacity-100"
          )}
        >
          <button {...attributes} {...listeners} className="p-1 rounded bg-white shadow hover:bg-gray-100 border border-gray-200">
            <GripVertical className="h-3.5 w-3.5 text-gray-400" />
          </button>
          <button onClick={onDuplicate} className="p-1 rounded bg-white shadow hover:bg-gray-100 border border-gray-200">
            <Copy className="h-3.5 w-3.5 text-gray-500" />
          </button>
          <button onClick={onEdit} className="p-1 rounded bg-white shadow hover:bg-blue-50 border border-gray-200">
            <Settings className="h-3.5 w-3.5 text-blue-500" />
          </button>
          <button onClick={onDelete} className="p-1 rounded bg-white shadow hover:bg-red-50 border border-gray-200">
            <Trash2 className="h-3.5 w-3.5 text-red-500" />
          </button>
        </div>
      )}

      {field.type !== "section" && (
        <Label className="mb-2 block">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}

      {renderFieldInput()}

      {field.helpText && (
        <p className="mt-1 text-xs text-gray-400">{field.helpText}</p>
      )}
    </div>
  );
}
