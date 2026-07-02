import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: { id: string; submissionId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { templateIds } = body as { templateIds?: string[] };

  const submission = await prisma.submission.findUnique({
    where: { id: params.submissionId },
    include: { form: { include: { fields: true } } },
  });

  if (!submission) return NextResponse.json({ error: "Submission not found" }, { status: 404 });

  const whereClause = templateIds
    ? { formId: params.id, id: { in: templateIds } }
    : { formId: params.id };

  const templates = await prisma.template.findMany({ where: whereClause });

  const documents = await prisma.$transaction(
    templates.map((template) =>
      prisma.document.create({
        data: {
          templateId: template.id,
          submissionId: params.submissionId,
          fileName: `${template.name}_${params.submissionId}.${template.type.toLowerCase()}`,
          fileType: template.type,
        },
      })
    )
  );

  return NextResponse.json(documents);
}
