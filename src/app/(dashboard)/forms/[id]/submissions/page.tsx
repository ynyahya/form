"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileDown, Eye } from "lucide-react";
import Link from "next/link";

interface SubmissionData {
  id: string;
  data: Record<string, unknown>;
  status: string;
  createdAt: string;
  user: { name: string; email: string };
  documents: Array<{ id: string; fileName: string; fileType: string }>;
}

export default function SubmissionsPage() {
  const params = useParams();
  const formId = params.id as string;

  const { data: submissions = [], isLoading } = useQuery<SubmissionData[]>({
    queryKey: ["submissions", formId],
    queryFn: async () => {
      const res = await fetch(`/api/forms/${formId}/submissions`);
      return res.json();
    },
  });

  const statusVariant = (status: string) => {
    switch (status) {
      case "SUBMITTED":
        return "default" as const;
      case "APPROVED":
      case "COMPLETED":
        return "success" as const;
      case "REJECTED":
        return "destructive" as const;
      default:
        return "warning" as const;
    }
  };

  return (
    <div>
      <Header
        title="Submissions"
        description="Data yang telah disubmit"
        actions={
          <Link href={`/forms/${formId}/fill`}>
            <Button>Isi Form Baru</Button>
          </Link>
        }
      />

      <div className="p-6">
        <div className="mb-4">
          <Link href={`/forms/${formId}`} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Kembali
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : submissions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-gray-400">
              <p>Belum ada submission</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {submissions.map((sub) => (
              <Card key={sub.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{sub.user.name}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(sub.createdAt).toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={statusVariant(sub.status)}>{sub.status}</Badge>
                    <Button variant="outline" size="sm">
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      Detail
                    </Button>
                    <Button variant="outline" size="sm">
                      <FileDown className="h-3.5 w-3.5 mr-1" />
                      Generate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
