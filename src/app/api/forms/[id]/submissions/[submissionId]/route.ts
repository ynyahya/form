import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: { id: string; submissionId: string } }
) {
  const submission = await prisma.submission.findUnique({
    where: { id: params.submissionId },
    include: {
      user: { select: { name: true, email: true } },
      form: { include: { fields: { orderBy: { order: "asc" } } } },
      documents: { include: { template: true } },
      approvals: { include: { approver: { select: { name: true } } } },
    },
  });

  if (!submission) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(submission);
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string; submissionId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const submission = await prisma.submission.update({
    where: { id: params.submissionId },
    data: {
      data: body.data,
      status: body.status,
      signatures: body.signatures,
      attachments: body.attachments,
    },
  });

  return NextResponse.json(submission);
}
