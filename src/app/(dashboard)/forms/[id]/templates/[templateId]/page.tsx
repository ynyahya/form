"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { TemplateDesigner } from "@/components/template-designer/template-designer";
import type { TemplateElement } from "@/types/form";

interface TemplateDetail {
  id: string;
  name: string;
  body: { elements?: TemplateElement[] };
  form: {
    fields: Array<{ slug: string; label: string; type: string }>;
  };
}

export default function TemplateDesignerPage() {
  const params = useParams();
  const formId = params.id as string;
  const templateId = params.templateId as string;
  const queryClient = useQueryClient();

  const { data: template, isLoading } = useQuery<TemplateDetail>({
    queryKey: ["template", templateId],
    queryFn: async () => {
      const res = await fetch(`/api/forms/${formId}/templates/${templateId}`);
      return res.json();
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (elements: TemplateElement[]) => {
      const res = await fetch(`/api/forms/${formId}/templates/${templateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: { elements } }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["template", templateId] });
    },
  });

  if (isLoading || !template) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <TemplateDesigner
      formId={formId}
      templateName={template.name}
      formFields={template.form.fields}
      initialElements={template.body?.elements || []}
      onSave={(elements) => saveMutation.mutateAsync(elements)}
    />
  );
}
