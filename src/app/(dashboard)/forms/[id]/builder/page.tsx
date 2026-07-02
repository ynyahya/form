"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { FormBuilder } from "@/components/builder/form-builder";
import type { FormFieldData } from "@/types/form";

interface FormDetail {
  id: string;
  title: string;
  fields: FormFieldData[];
}

export default function FormBuilderPage() {
  const params = useParams();
  const formId = params.id as string;
  const queryClient = useQueryClient();

  const { data: form, isLoading } = useQuery<FormDetail>({
    queryKey: ["form", formId],
    queryFn: async () => {
      const res = await fetch(`/api/forms/${formId}`);
      return res.json();
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (fields: FormFieldData[]) => {
      const res = await fetch(`/api/forms/${formId}/fields`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fields: fields.map((f) => ({
            name: f.name,
            slug: f.slug,
            type: f.type,
            label: f.label,
            placeholder: f.placeholder,
            helpText: f.helpText,
            tooltip: f.tooltip,
            required: f.required,
            readonly: f.readonly,
            hidden: f.hidden,
            defaultValue: f.defaultValue,
            validation: f.validation,
            conditionalLogic: f.conditionalLogic,
            options: f.options,
            formula: f.formula,
            prefix: f.prefix,
            suffix: f.suffix,
            width: f.width,
            alignment: f.alignment,
            mask: f.mask,
            order: f.order,
            parentId: f.parentId,
            entityFieldId: f.entityFieldId,
          })),
        }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["form", formId] });
    },
  });

  if (isLoading || !form) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const initialFields: FormFieldData[] = form.fields.map((f) => ({
    id: f.id,
    name: f.name,
    slug: f.slug,
    type: f.type,
    label: f.label,
    placeholder: f.placeholder,
    helpText: f.helpText,
    tooltip: f.tooltip,
    required: f.required,
    readonly: f.readonly,
    hidden: f.hidden,
    defaultValue: f.defaultValue,
    validation: f.validation,
    conditionalLogic: f.conditionalLogic,
    options: f.options,
    formula: f.formula,
    prefix: f.prefix,
    suffix: f.suffix,
    width: f.width || "full",
    alignment: f.alignment,
    mask: f.mask,
    order: f.order,
    parentId: f.parentId,
    entityFieldId: f.entityFieldId,
  }));

  return (
    <FormBuilder
      formId={formId}
      formTitle={form.title}
      initialFields={initialFields}
      onSave={(fields) => saveMutation.mutateAsync(fields)}
    />
  );
}
