"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { type FormFieldData, type FieldDefinition } from "@/types/form";
import { FieldPalette } from "./field-palette";
import { FieldRenderer } from "./field-renderer";
import { FieldSettings } from "./field-settings";
import { Button } from "@/components/ui/button";
import { Save, Eye, ArrowLeft, Undo, Redo } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { generateSlug } from "@/lib/utils";
import Link from "next/link";

interface FormBuilderProps {
  formId: string;
  formTitle: string;
  initialFields: FormFieldData[];
  onSave: (fields: FormFieldData[]) => Promise<void>;
}

export function FormBuilder({ formId, formTitle, initialFields, onSave }: FormBuilderProps) {
  const [fields, setFields] = useState<FormFieldData[]>(initialFields);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [history, setHistory] = useState<FormFieldData[][]>([initialFields]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const pushHistory = useCallback((newFields: FormFieldData[]) => {
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newFields);
      return newHistory;
    });
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex]);

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setFields(history[newIndex]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setFields(history[newIndex]);
    }
  };

  const addField = useCallback(
    (fieldDef: FieldDefinition, index?: number) => {
      const slug = generateSlug(fieldDef.label);
      const existingSlugs = fields.map((f) => f.slug);
      let uniqueSlug = slug;
      let counter = 1;
      while (existingSlugs.includes(uniqueSlug)) {
        uniqueSlug = `${slug}_${counter}`;
        counter++;
      }

      const newField: FormFieldData = {
        id: uuidv4(),
        name: fieldDef.label,
        slug: uniqueSlug,
        type: fieldDef.type,
        label: fieldDef.label,
        required: false,
        readonly: false,
        hidden: false,
        width: fieldDef.defaultWidth,
        order: index ?? fields.length,
      };

      const newFields = [...fields];
      if (index !== undefined) {
        newFields.splice(index, 0, newField);
      } else {
        newFields.push(newField);
      }

      const reordered = newFields.map((f, i) => ({ ...f, order: i }));
      setFields(reordered);
      pushHistory(reordered);
      setSelectedFieldId(newField.id);
    },
    [fields, pushHistory]
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current;

    if (activeData?.type === "palette") {
      const fieldDef = activeData.fieldDefinition as FieldDefinition;
      const overIndex = fields.findIndex((f) => f.id === over.id);
      addField(fieldDef, overIndex >= 0 ? overIndex : undefined);
      return;
    }

    if (active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);
      if (oldIndex >= 0 && newIndex >= 0) {
        const newFields = arrayMove(fields, oldIndex, newIndex).map((f, i) => ({ ...f, order: i }));
        setFields(newFields);
        pushHistory(newFields);
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(fields);
    } finally {
      setSaving(false);
    }
  };

  const selectedField = fields.find((f) => f.id === selectedFieldId);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-screen flex-col">
        {/* Toolbar */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href={`/forms/${formId}`} className="p-2 rounded-lg hover:bg-gray-100">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">{formTitle}</h1>
              <p className="text-xs text-gray-500">Form Builder</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={undo} disabled={historyIndex === 0}>
              <Undo className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={redo} disabled={historyIndex === history.length - 1}>
              <Redo className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-gray-200" />
            <Button
              variant={previewMode ? "default" : "outline"}
              size="sm"
              onClick={() => setPreviewMode(!previewMode)}
            >
              <Eye className="h-4 w-4 mr-1" />
              {previewMode ? "Edit" : "Preview"}
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-1" />
              {saving ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </div>

        {/* Main area */}
        <div className="flex flex-1 overflow-hidden">
          {!previewMode && <FieldPalette />}

          {/* Canvas */}
          <div className="flex-1 overflow-y-auto bg-gray-100 p-6">
            <div className="mx-auto max-w-3xl rounded-xl bg-white shadow-sm border border-gray-200 min-h-[600px]">
              <div className="p-6">
                <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
                  <div className="flex flex-wrap gap-y-1">
                    {fields.map((field) => (
                      <FieldRenderer
                        key={field.id}
                        field={field}
                        isSelected={selectedFieldId === field.id}
                        onSelect={() => !previewMode && setSelectedFieldId(field.id)}
                        onDelete={() => {
                          const newFields = fields.filter((f) => f.id !== field.id);
                          setFields(newFields);
                          pushHistory(newFields);
                          if (selectedFieldId === field.id) setSelectedFieldId(null);
                        }}
                        onDuplicate={() => {
                          const index = fields.findIndex((f) => f.id === field.id);
                          const duplicate: FormFieldData = {
                            ...field,
                            id: uuidv4(),
                            slug: `${field.slug}_copy`,
                            label: `${field.label} (Copy)`,
                          };
                          const newFields = [...fields];
                          newFields.splice(index + 1, 0, duplicate);
                          const reordered = newFields.map((f, i) => ({ ...f, order: i }));
                          setFields(reordered);
                          pushHistory(reordered);
                        }}
                        onEdit={() => setSelectedFieldId(field.id)}
                        mode={previewMode ? "fill" : "builder"}
                      />
                    ))}
                  </div>
                </SortableContext>

                {fields.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-96 text-gray-400">
                    <p className="text-lg font-medium">Drag komponen ke sini</p>
                    <p className="text-sm mt-1">Mulai membangun form Anda</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Field Settings Panel */}
          {!previewMode && selectedField && (
            <FieldSettings
              field={selectedField}
              onUpdate={(updated) => {
                const newFields = fields.map((f) => (f.id === updated.id ? updated : f));
                setFields(newFields);
              }}
              onClose={() => setSelectedFieldId(null)}
            />
          )}
        </div>
      </div>

      <DragOverlay>
        {activeId && !activeId.startsWith("palette-") && (
          <div className="rounded-lg border-2 border-blue-400 bg-blue-50 p-4 shadow-lg opacity-80">
            <span className="text-sm font-medium text-blue-700">
              {fields.find((f) => f.id === activeId)?.label || "Field"}
            </span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
