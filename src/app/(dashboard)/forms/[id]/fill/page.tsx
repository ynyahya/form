"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FieldRenderer } from "@/components/builder/field-renderer";
import { ArrowLeft, Send, Save } from "lucide-react";
import Link from "next/link";
import { terbilang } from "@/lib/utils";
import type { FormFieldData } from "@/types/form";

interface FormDetail {
  id: string;
  title: string;
  description: string | null;
  fields: FormFieldData[];
  templates: Array<{ id: string; name: string; type: string }>;
}

export default function FillFormPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params.id as string;
  const [formData, setFormData] = useState<Record<string, string>>({});

  const { data: form, isLoading } = useQuery<FormDetail>({
    queryKey: ["form", formId],
    queryFn: async () => {
      const res = await fetch(`/api/forms/${formId}`);
      return res.json();
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (status: "DRAFT" | "SUBMITTED") => {
      const res = await fetch(`/api/forms/${formId}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: formData, status }),
      });
      return res.json();
    },
    onSuccess: () => {
      router.push(`/forms/${formId}/submissions`);
    },
  });

  if (isLoading || !form) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const evaluateFormula = (formula: string): string => {
    try {
      let expr = formula;
      for (const field of form.fields) {
        const val = formData[field.slug] || "0";
        expr = expr.replace(new RegExp(field.slug, "g"), val);
      }
      const result = Function(`"use strict"; return (${expr})`)();
      return String(result);
    } catch {
      return "0";
    }
  };

  const getFieldValue = (field: FormFieldData): string => {
    if (field.type === "formula" && field.formula) {
      return evaluateFormula(field.formula);
    }
    if (field.type === "terbilang") {
      const sourceSlug = field.formula || "";
      const sourceValue = Number(formData[sourceSlug] || 0);
      return terbilang(sourceValue);
    }
    return formData[field.slug] || "";
  };

  return (
    <div>
      <Header
        title={`Isi Form: ${form.title}`}
        description={form.description || undefined}
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => submitMutation.mutate("DRAFT")}
              disabled={submitMutation.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              Simpan Draft
            </Button>
            <Button
              onClick={() => submitMutation.mutate("SUBMITTED")}
              disabled={submitMutation.isPending}
            >
              <Send className="h-4 w-4 mr-2" />
              Submit
            </Button>
          </div>
        }
      />

      <div className="p-6">
        <div className="mb-4">
          <Link href={`/forms/${formId}`} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Kembali
          </Link>
        </div>

        <Card className="max-w-3xl mx-auto">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-y-1">
              {form.fields.map((field) => (
                <FieldRenderer
                  key={field.id}
                  field={field}
                  isSelected={false}
                  onSelect={() => {}}
                  onDelete={() => {}}
                  onDuplicate={() => {}}
                  onEdit={() => {}}
                  mode="fill"
                  value={getFieldValue(field)}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, [field.slug]: value }))
                  }
                />
              ))}
            </div>

            {form.fields.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <p>Form ini belum memiliki field</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
